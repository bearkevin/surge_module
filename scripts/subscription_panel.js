/*
 * Surge Panel Script: subscription quota parser
 * argument format: name=<panel name>&url=<subscription url>
 */

function parseArgument(raw) {
  var out = {};
  if (!raw) return out;

  raw.split("&").forEach(function (pair) {
    if (!pair) return;
    var idx = pair.indexOf("=");
    var key = idx >= 0 ? pair.slice(0, idx) : pair;
    var value = idx >= 0 ? pair.slice(idx + 1) : "";
    key = decodeURIComponent(key || "").trim();
    value = decodeURIComponent(value || "").trim();
    if (key) out[key] = value;
  });

  return out;
}

function getHeaderCaseInsensitive(headers, name) {
  if (!headers || !name) return null;
  var target = String(name).toLowerCase();
  var keys = Object.keys(headers);

  for (var i = 0; i < keys.length; i += 1) {
    var key = keys[i];
    if (String(key).toLowerCase() === target) {
      return headers[key];
    }
  }

  return null;
}

function parseUserInfoHeader(raw) {
  if (!raw || typeof raw !== "string") return null;

  function pickNumber(key) {
    var pattern = new RegExp(key + "\\s*=\\s*(\\d+)", "i");
    var match = raw.match(pattern);
    return match ? Number(match[1]) : null;
  }

  var upload = pickNumber("upload");
  var download = pickNumber("download");
  var total = pickNumber("total");
  var expire = pickNumber("expire");

  if (upload === null || download === null || total === null) {
    return null;
  }

  return {
    upload: upload,
    download: download,
    total: total,
    expire: expire,
  };
}

function formatRemaining(bytes) {
  var gib = 1024 * 1024 * 1024;
  var tib = gib * 1024;

  if (bytes >= tib) {
    return (bytes / tib).toFixed(2) + " TiB";
  }

  return (bytes / gib).toFixed(2) + " GiB";
}

function formatExpire(epochSeconds) {
  if (!epochSeconds || !Number.isFinite(epochSeconds) || epochSeconds <= 0) {
    return "未提供";
  }

  var date = new Date(epochSeconds * 1000);
  if (Number.isNaN(date.getTime())) {
    return "未提供";
  }

  var y = date.getFullYear();
  var m = String(date.getMonth() + 1).padStart(2, "0");
  var d = String(date.getDate()).padStart(2, "0");
  var hh = String(date.getHours()).padStart(2, "0");
  var mm = String(date.getMinutes()).padStart(2, "0");

  return y + "-" + m + "-" + d + " " + hh + ":" + mm;
}

function doneFailure(name, title, content) {
  $done({
    title: name + " " + title,
    content: content,
  });
}

var args = parseArgument(typeof $argument === "string" ? $argument : "");
var name = args.name || "订阅";
var url = args.url || "";

if (!url) {
  doneFailure(name, "请求失败", "缺少订阅 URL 参数");
} else {
  $httpClient.get(url, function (error, response) {
    if (error || !response) {
      doneFailure(name, "请求失败", String(error || "无响应"));
      return;
    }

    var status = response.status || response.statusCode || 0;
    if (status >= 400) {
      doneFailure(name, "请求失败", "HTTP " + status);
      return;
    }

    var rawUserInfo = getHeaderCaseInsensitive(response.headers, "subscription-userinfo");
    if (!rawUserInfo) {
      doneFailure(name, "数据异常", "未找到 subscription-userinfo");
      return;
    }

    var parsed = parseUserInfoHeader(String(rawUserInfo));
    if (!parsed) {
      doneFailure(name, "数据异常", "subscription-userinfo 解析失败");
      return;
    }

    var used = parsed.upload + parsed.download;
    var remaining = Math.max(parsed.total - used, 0);

    $done({
      title: name + " 剩余 " + formatRemaining(remaining),
      content: "到期 " + formatExpire(parsed.expire),
    });
  });
}
