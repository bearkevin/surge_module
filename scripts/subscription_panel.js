/*
 * 引用由 @Rabbit-Spec 修改的脚本，初始脚本 @mieqq 编写。
*/

let args = getArgs();

(async () => {
  let info = await getDataInfo(args.url);
  if (!info) return $done();
  let resetText = resolveResetText(info, args);

  let used = info.download + info.upload;
  let total = info.total;
  let remaining = Math.max(total - used, 0);
  let expire = args.expire || info.expire;
  let content = [];

  if (total > 0) {
    let rawPct = remaining / total * 100;
    let percentage = Math.round(rawPct);
    let filled = Math.round(percentage / (100 / 12));
    let bar;
    if (rawPct < 99.5) {
      filled = Math.min(filled, 11);
      bar = "■".repeat(filled) + "□".repeat(11 - filled) + " ";
    } else {
      bar = "■".repeat(filled) + "□".repeat(12 - filled);
    }
    content.push(`${bar} ${percentage}%`);
  }
  content.push(`剩余：${bytesToSize(remaining)}/${bytesToSize(total)}`);

  if (resetText) {
    content.push(`重置：${resetText}`);
  }
  if (expire && expire !== "false") {
    if (/^[\d.]+$/.test(expire)) expire *= 1000;
    content.push(`到期：${formatTime(expire)}`);
  }

  let now = new Date();
  let hour = now.getHours();
  let minutes = now.getMinutes();
  hour = hour > 9 ? hour : "0" + hour;
  minutes = minutes > 9 ? minutes : "0" + minutes;

  $done({
    title: `${args.title} | ${hour}:${minutes}`,
    content: content.join("\n"),
    icon: args.icon || "airplane.circle",
    "icon-color": args.color || "#007aff",
  });
})();

function getArgs() {
  return Object.fromEntries(
    $argument
      .split("&")
      .map((item) => {
        let idx = item.indexOf("=");
        return [item.slice(0, idx), decodeURIComponent(item.slice(idx + 1))];
      })
  );
}

function getUserInfo(url) {
  let method = args.method || "head";
  let request = { headers: { "User-Agent": "Quantumult%20X" }, url };
  return new Promise((resolve, reject) =>
    $httpClient[method](request, (err, resp) => {
      if (err != null) {
        reject(err);
        return;
      }
      if (resp.status !== 200) {
        reject(resp.status);
        return;
      }
      let header = Object.keys(resp.headers).find(
        (key) => key.toLowerCase() === "subscription-userinfo"
      );
      if (header) {
        resolve(resp.headers[header]);
        return;
      }
      reject("链接响应头不带有流量信息");
    })
  );
}

async function getDataInfo(url) {
  const [err, data] = await getUserInfo(url)
    .then((data) => [null, data])
    .catch((err) => [err, null]);
  if (err) {
    console.log(err);
    return;
  }

  return Object.fromEntries(
    (data.match(/\w+=[\d.eE+-]+/g) || [])
      .map((item) => item.split("="))
      .map(([k, v]) => [k, Number(v)])
  );
}

function getRemainingDays(resetDay) {
  if (!resetDay) return;

  let now = new Date();
  let today = now.getDate();
  let month = now.getMonth();
  let year = now.getFullYear();
  let daysInMonth;

  if (resetDay > today) {
    daysInMonth = 0;
  } else {
    daysInMonth = new Date(year, month + 1, 0).getDate();
  }

  return daysInMonth - today + resetDay;
}

function resolveResetText(info, args) {
  if (info.resetday === 0) {
    return "今天";
  }

  let headerResetDayLeft = parsePositiveInt(info.resetday);
  if (headerResetDayLeft) {
    return `剩余${headerResetDayLeft}天`;
  }

  let resetDay =
    parsePositiveInt(args["reset_day"]) ?? parsePositiveInt(args.resetday);
  if (resetDay) {
    return `剩余${getRemainingDays(resetDay)}天`;
  }
}

function parsePositiveInt(value) {
  let parsed = parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
}

function bytesToSize(bytes) {
  if (bytes === 0) return "0B";
  let k = 1024;
  let sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
}

function formatTime(time) {
  let dateObj = new Date(time);
  let year = dateObj.getFullYear();
  let month = dateObj.getMonth() + 1;
  let day = dateObj.getDate();
  return year + "年" + month + "月" + day + "日";
}
