/*
 * Panel output style aligned with common Surge scripts:
 * $done({ title, content, icon, "icon-color" })
 */

function safeDecode(value) {
  try {
    return decodeURIComponent(value || "");
  } catch (e) {
    return value || "";
  }
}

function parseArgument(raw) {
  var out = {};
  if (!raw) return out;
  var parts = String(raw).split("&");
  for (var i = 0; i < parts.length; i += 1) {
    var item = parts[i];
    if (!item) continue;
    var idx = item.indexOf("=");
    var key = idx >= 0 ? item.slice(0, idx) : item;
    var value = idx >= 0 ? item.slice(idx + 1) : "";
    key = safeDecode(key).trim();
    value = safeDecode(value).trim();
    if (key) out[key] = value;
  }
  return out;
}

function getHeaderCaseInsensitive(headers, name) {
  if (!headers || !name) return null;
  var target = String(name).toLowerCase();
  var keys = Object.keys(headers);
  for (var i = 0; i < keys.length; i += 1) {
    var key = keys[i];
    if (String(key).toLowerCase() === target) return headers[key];
  }
  return null;
}

function parseUserInfoHeader(raw) {
  if (!raw || typeof raw !== "string") return null;
  var pairs = raw.match(/\w+=[\d.eE+-]+/g);
  if (!pairs || !pairs.length) return null;

  var info = {};
  for (var i = 0; i < pairs.length; i += 1) {
    var kv = pairs[i].split("=");
    info[kv[0]] = Number(kv[1]);
  }
  if (!isFinite(info.upload) || !isFinite(info.download) || !isFinite(info.total)) {
    return null;
  }
  return info;
}

function bytesToSize(bytes) {
  if (!isFinite(bytes) || bytes <= 0) return "0 B";
  var k = 1024;
  var sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  var i = Math.floor(Math.log(bytes) / Math.log(k));
  if (i >= sizes.length) i = sizes.length - 1;
  return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
}

function formatExpire(epochSeconds) {
  if (!epochSeconds || !isFinite(epochSeconds) || epochSeconds <= 0) return "未提供";
  var date = new Date(epochSeconds * 1000);
  if (isNaN(date.getTime())) return "未提供";
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  var d = date.getDate();
  var hh = date.getHours();
  var mm = date.getMinutes();
  if (hh < 10) hh = "0" + hh;
  if (mm < 10) mm = "0" + mm;
  return y + "-" + m + "-" + d + " " + hh + ":" + mm;
}

function nowHHMM() {
  var now = new Date();
  var hh = now.getHours();
  var mm = now.getMinutes();
  if (hh < 10) hh = "0" + hh;
  if (mm < 10) mm = "0" + mm;
  return hh + ":" + mm;
}

function donePanel(opts) {
  $done({
    title: opts.title,
    content: opts.content,
    icon: opts.icon || "airplane.circle",
    "icon-color": opts.color || "#007aff",
  });
}

function doneError(name, message, icon, color) {
  donePanel({
    title: name + " | " + nowHHMM(),
    content: message,
    icon: icon || "exclamationmark.triangle.fill",
    color: color || "#ff3b30",
  });
}

function requestUserInfo(url, method, callback) {
  var req = {
    url: url,
    headers: {
      "User-Agent": "Quantumult%20X",
    },
  };

  var triedGet = false;

  function run(currentMethod) {
    var fn = $httpClient[currentMethod];
    if (typeof fn !== "function") {
      callback("HTTP method unsupported: " + currentMethod, null);
      return;
    }

    fn(req, function (error, response) {
      if (error || !response) {
        if (currentMethod === "head" && !triedGet) {
          triedGet = true;
          run("get");
          return;
        }
        callback(String(error || "无响应"), null);
        return;
      }

      var status = response.status || response.statusCode || 0;
      if (status >= 400) {
        if (currentMethod === "head" && !triedGet) {
          triedGet = true;
          run("get");
          return;
        }
        callback("HTTP " + status, null);
        return;
      }

      var userInfo = getHeaderCaseInsensitive(response.headers, "subscription-userinfo");
      if (!userInfo && currentMethod === "head" && !triedGet) {
        triedGet = true;
        run("get");
        return;
      }

      if (!userInfo) {
        callback("未找到 subscription-userinfo", null);
        return;
      }

      callback(null, String(userInfo));
    });
  }

  run(method === "get" ? "get" : "head");
}

try {
  var args = parseArgument(typeof $argument === "string" ? $argument : "");
  var name = args.name || args.title || "订阅";
  var url = args.url || "";
  var method = (args.method || "head").toLowerCase();
  var icon = args.icon || "airplane.circle";
  var color = args.color || "#007aff";

  if (!url) {
    doneError(name, "缺少订阅 URL 参数", icon, color);
  } else {
    requestUserInfo(url, method, function (err, userInfoRaw) {
      if (err) {
        doneError(name, err, icon, color);
        return;
      }

      var info = parseUserInfoHeader(userInfoRaw);
      if (!info) {
        doneError(name, "subscription-userinfo 解析失败", icon, color);
        return;
      }

      var used = info.upload + info.download;
      var remaining = Math.max(info.total - used, 0);
      var expireText = formatExpire(info.expire);

      donePanel({
        title: name + " | " + nowHHMM(),
        content: "剩余：" + bytesToSize(remaining) + "\n到期：" + expireText,
        icon: icon,
        color: color,
      });
    });
  }
} catch (e) {
  doneError("订阅", "脚本异常: " + String(e));
}
