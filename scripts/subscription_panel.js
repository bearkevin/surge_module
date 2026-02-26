/*
 * Surge Panel Script: subscription quota parser
 * argument format: name=<panel name>&url=<subscription url>
 */

function parseArgument(raw) {
  var out = {};
  if (!raw) return out;

  var nameMatch = raw.match(/(?:^|&)name=([^&]*)/i);
  var urlMatch = raw.match(/(?:^|&)url=(.*)$/i);

  if (nameMatch) {
    out.name = decodeURIComponent(nameMatch[1] || "").trim();
  }
  if (urlMatch) {
    out.url = decodeURIComponent(urlMatch[1] || "").trim();
  }

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
  if (!epochSeconds || !isFinite(epochSeconds) || epochSeconds <= 0) {
    return "未提供";
  }

  var date = new Date(epochSeconds * 1000);
  if (isNaN(date.getTime())) {
    return "未提供";
  }

  function pad2(n) {
    n = String(n);
    return n.length < 2 ? "0" + n : n;
  }

  var y = date.getFullYear();
  var m = pad2(date.getMonth() + 1);
  var d = pad2(date.getDate());
  var hh = pad2(date.getHours());
  var mm = pad2(date.getMinutes());

  return y + "-" + m + "-" + d + " " + hh + ":" + mm;
}

function doneFailure(name, title, content) {
  $done({
    title: name + " " + title,
    content: content,
  });
}

try {
  var args = parseArgument(typeof $argument === "string" ? $argument : "");
  var name = args.name || "订阅";
  var url = args.url || "";

  if (!url) {
    doneFailure(name, "请求失败", "缺少订阅 URL 参数");
  } else {
    $httpClient.get(url, function (error, response, data) {
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
        style: "info",
      });
    });
  }
} catch (e) {
  doneFailure("订阅", "请求失败", "脚本异常: " + String(e));
}
