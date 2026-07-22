/* Six Five Apps - Hours Status Widget */
(function () {
  "use strict";

  var SETTINGS = {
    timezone: "America/Los_Angeles",
    closesSoonMinutes: 60,

    labels: {
      open: "Open now",
      soon: "Closes soon",
      closed: "Closed"
    },

    colors: {
      open: "#1a7f37",
      soon: "#c77700",
      closed: "#9b1c1c",
      detail: "#666666"
    },

    hours: {
      sun: "8:00-21:00",
      mon: "8:00-21:00",
      tue: "8:00-21:00",
      wed: "8:00-21:00",
      thu: "8:00-21:00",
      fri: "8:00-21:00",
      sat: "8:00-21:00"
    },

    tidySpacing: true
  };

  if (window.__sfaHoursLoaded) return;
  window.__sfaHoursLoaded = true;

  var CSS =
    ".sfa-hours,.sfa-hours *{box-sizing:border-box !important;}" +
    ".sfa-hours{display:block !important;font-family:Arial,Helvetica,sans-serif !important;" +
    "background:transparent !important;color:#222 !important;margin:0 !important;padding:0 !important;" +
    "border:0 !important;text-align:left !important;line-height:normal !important;}" +
    ".sfa-hours .sfa-hours-top{display:flex !important;align-items:center !important;gap:8px !important;" +
    "margin:0 0 3px 0 !important;padding:0 !important;line-height:1.1 !important;}" +
    ".sfa-hours .sfa-hours-dot{width:9px !important;height:9px !important;min-width:9px !important;" +
    "border-radius:50% !important;display:inline-block !important;flex:0 0 9px !important;}" +
    ".sfa-hours .sfa-hours-label{font-size:1rem !important;font-weight:700 !important;margin:0 !important;padding:0 !important;}" +
    ".sfa-hours .sfa-hours-detail{font-size:.84rem !important;line-height:1.25 !important;" +
    "padding:0 0 0 17px !important;margin:0 !important;}";

  function injectCSS() {
    if (document.getElementById("sfa-hours-css")) return;
    var target = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
    if (!target) return;
    var style = document.createElement("style");
    style.id = "sfa-hours-css";
    style.type = "text/css";
    if (style.styleSheet) {
      style.styleSheet.cssText = CSS;
    } else {
      style.appendChild(document.createTextNode(CSS));
    }
    target.appendChild(style);
  }

  var DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function zonedNow() {
    try {
      var parts = new Intl.DateTimeFormat("en-US", {
        timeZone: SETTINGS.timezone,
        weekday: "short",
        hour: "numeric",
        minute: "numeric",
        hour12: false
      }).formatToParts(new Date());

      var map = {};
      for (var i = 0; i < parts.length; i++) {
        if (parts[i].type !== "literal") map[parts[i].type] = parts[i].value;
      }
      var idx = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var hour = parseInt(map.hour, 10) % 24;
      return { day: idx[map.weekday], minutes: (hour * 60) + parseInt(map.minute, 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function toMinutes(t) {
    var p = t.split(":");
    return (parseInt(p[0], 10) * 60) + parseInt(p[1] || "0", 10);
  }

  function formatTime(t) {
    var p = t.split(":");
    var h = parseInt(p[0], 10);
    var m = parseInt(p[1] || "0", 10);
    var suffix = (h % 24) >= 12 ? "PM" : "AM";
    h = (h % 12) || 12;
    return h + ":" + (m < 10 ? "0" + m : m) + " " + suffix;
  }

  function parseDay(str) {
    if (!str || String(str).toLowerCase() === "closed") return [];
    return String(str).split(",").map(function (range) {
      var pair = range.split("-");
      var openStr = (pair[0] || "").trim();
      var closeStr = (pair[1] || "").trim();
      return {
        open: toMinutes(openStr),
        close: toMinutes(closeStr),
        openStr: openStr,
        closeStr: closeStr
      };
    }).filter(function (s) {
      return !isNaN(s.open) && !isNaN(s.close);
    });
  }

  function nextOpening(now) {
    var today = parseDay(SETTINGS.hours[DAY_KEYS[now.day]]);
    for (var i = 0; i < today.length; i++) {
      if (now.minutes < today[i].open) {
        return "Opens today at " + formatTime(today[i].openStr);
      }
    }
    for (var d = 1; d <= 7; d++) {
      var idx = (now.day + d) % 7;
      var slots = parseDay(SETTINGS.hours[DAY_KEYS[idx]]);
      if (!slots.length) continue;
      if (d === 1) return "Opens tomorrow at " + formatTime(slots[0].openStr);
      return "Opens " + DAY_NAMES[idx] + " at " + formatTime(slots[0].openStr);
    }
    return "Hours unavailable";
  }

  function running(minsLeft, closeStr) {
    var soon = minsLeft <= SETTINGS.closesSoonMinutes;
    return {
      state: soon ? "soon" : "open",
      text: soon ? SETTINGS.labels.soon : SETTINGS.labels.open,
      detail: "Closes at " + formatTime(closeStr)
    };
  }

  function getStatus() {
    var now = zonedNow();

    var yesterday = parseDay(SETTINGS.hours[DAY_KEYS[(now.day + 6) % 7]]);
    for (var i = 0; i < yesterday.length; i++) {
      var y = yesterday[i];
      if (y.close <= y.open && now.minutes < y.close) {
        return running(y.close - now.minutes, y.closeStr);
      }
    }

    var today = parseDay(SETTINGS.hours[DAY_KEYS[now.day]]);
    for (var j = 0; j < today.length; j++) {
      var s = today[j];
      if (s.close <= s.open) {
        if (now.minutes >= s.open) {
          return running((1440 - now.minutes) + s.close, s.closeStr);
        }
      } else if (now.minutes >= s.open && now.minutes < s.close) {
        return running(s.close - now.minutes, s.closeStr);
      }
    }

    return {
      state: "closed",
      text: SETTINGS.labels.closed,
      detail: nextOpening(now)
    };
  }

  function isBlank(node) {
    if (!node || node.nodeType !== 1) return false;
    if (node.querySelector("img, iframe, video, svg, table")) return false;
    return node.textContent.replace(/\u00a0/g, "").trim() === "";
  }

  function flatten(node) {
    node.style.setProperty("margin", "0", "important");
    node.style.setProperty("padding", "0", "important");
    node.style.setProperty("height", "0", "important");
    node.style.setProperty("min-height", "0", "important");
    node.style.setProperty("line-height", "0", "important");
    node.style.setProperty("overflow", "hidden", "important");
  }

  function tidy(el) {
    if (!SETTINGS.tidySpacing || el.getAttribute("data-sfa-tidied")) return;
    el.setAttribute("data-sfa-tidied", "1");

    var parent = el.parentElement;
    if (parent && parent.tagName === "P") {
      var onlyChild = true;
      for (var i = 0; i < parent.childNodes.length; i++) {
        var n = parent.childNodes[i];
        if (n === el) continue;
        if (n.nodeType === 3 && n.textContent.replace(/\u00a0/g, "").trim() === "") continue;
        if (n.nodeType === 1 && (n.tagName === "SCRIPT" || n.tagName === "STYLE" || n.tagName === "BR")) continue;
        onlyChild = false;
        break;
      }
      if (onlyChild && parent.parentNode) {
        parent.parentNode.insertBefore(el, parent);
        flatten(parent);
      }
    }

    var before = el.previousElementSibling;
    if (before && before.tagName === "P" && isBlank(before)) flatten(before);

    var after = el.nextElementSibling;
    if (after && after.tagName === "P" && isBlank(after)) flatten(after);
  }

  function paint(el) {
    var s = getStatus();
    var signature = s.state + "|" + s.text + "|" + s.detail;
    if (el.getAttribute("data-sfa-sig") === signature && el.firstChild) return;
    el.setAttribute("data-sfa-sig", signature);

    var color = s.state === "open" ? SETTINGS.colors.open
              : s.state === "soon" ? SETTINGS.colors.soon
              : SETTINGS.colors.closed;

    el.innerHTML =
      '<div class="sfa-hours-top">' +
        '<span class="sfa-hours-dot" style="background:' + color + ' !important;"></span>' +
        '<span class="sfa-hours-label" style="color:' + color + ' !important;">' + s.text + '</span>' +
      '</div>' +
      '<div class="sfa-hours-detail" style="color:' + SETTINGS.colors.detail + ' !important;">' + s.detail + '</div>';
  }

  var scheduled = false;

  function boot() {
    scheduled = false;
    injectCSS();
    var nodes = document.querySelectorAll("[data-sfa-hours], .sfa-hours");
    for (var i = 0; i < nodes.length; i++) {
      tidy(nodes[i]);
      paint(nodes[i]);
    }
  }

  function queue() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(boot, 60);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  }
  boot();

  var tries = 0;
  var poll = setInterval(function () {
    boot();
    if (++tries > 60) clearInterval(poll);
  }, 400);

  if (window.MutationObserver) {
    try {
      new MutationObserver(queue).observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    } catch (e) {}
  }

  window.addEventListener("load", boot);
  window.addEventListener("pageshow", boot);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) boot();
  });

  setInterval(boot, 30000);
})();
