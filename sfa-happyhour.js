(function () {
  "use strict";

  var CLASS = "sfa-hhstatus";
  var STYLE_ID = "sfa-hhstatus-style";
  var DAYNAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  var SHORT = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 };

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var css = `
      .sfa-hhstatus{
        display:flex !important; align-items:center !important; gap:11px !important;
        box-sizing:border-box !important; width:100% !important;
        padding:13px 15px !important; border-radius:12px !important;
        font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif !important;
        background:#f7f7f4 !important; border:1px solid rgba(54,52,40,.12) !important;
        color:#363428 !important;
      }
      .sfa-hhstatus .sfa-hhs-dot{
        width:12px !important; height:12px !important; border-radius:999px !important;
        flex:0 0 auto !important; background:#9a978c !important;
      }
      .sfa-hhstatus .sfa-hhs-txt{ display:flex !important; flex-direction:column !important; line-height:1.25 !important; }
      .sfa-hhstatus .sfa-hhs-title{
        font-family:Georgia,"Times New Roman",serif !important;
        font-size:17px !important; font-weight:400 !important; color:#363428 !important;
      }
      .sfa-hhstatus .sfa-hhs-sub{ font-size:13px !important; color:rgba(54,52,40,.7) !important; margin-top:1px !important; }
      .sfa-hhstatus.sfa-hhs--on .sfa-hhs-dot{ background:#4f8a5f !important; box-shadow:0 0 0 4px rgba(79,138,95,.18) !important; }
      .sfa-hhstatus.sfa-hhs--today .sfa-hhs-dot{ background:#B3995B !important; box-shadow:0 0 0 4px rgba(179,153,91,.18) !important; }
      .sfa-hhstatus.sfa-hhs--next .sfa-hhs-dot{ background:#9a978c !important; }
    `;
    var s = document.createElement("style");
    s.id = STYLE_ID; s.type = "text/css";
    s.appendChild(document.createTextNode(css));
    (document.head || document.documentElement).appendChild(s);
  }

  function toMins(hhmm) { var p = String(hhmm).split(":"); return (+p[0]) * 60 + (+p[1]); }

  function fmt(mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    var ap = h >= 12 ? "PM" : "AM";
    var hh = h % 12; if (hh === 0) hh = 12;
    return m === 0 ? (hh + " " + ap) : (hh + ":" + (m < 10 ? "0" + m : m) + " " + ap);
  }

  // Returns { dow: 0-6, mins: minutes since midnight } in the venue timezone.
  // Optional override ("YYYY-MM-DDTHH:MM") is treated as venue-local, for testing only.
  function nowInTZ(tz, override) {
    if (override) {
      var mm = override.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
      if (mm) {
        var d = new Date(+mm[1], +mm[2] - 1, +mm[3], +mm[4], +mm[5]);
        return { dow: d.getDay(), mins: (+mm[4]) * 60 + (+mm[5]) };
      }
    }
    try {
      var parts = new Intl.DateTimeFormat("en-US", {
        timeZone: tz, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false
      }).formatToParts(new Date());
      var wd = "", hr = 0, mn = 0;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (p.type === "weekday") wd = p.value;
        else if (p.type === "hour") hr = parseInt(p.value, 10);
        else if (p.type === "minute") mn = parseInt(p.value, 10);
      }
      if (hr === 24) hr = 0;
      return { dow: SHORT[wd], mins: hr * 60 + mn };
    } catch (e) {
      var n = new Date();
      return { dow: n.getDay(), mins: n.getHours() * 60 + n.getMinutes() };
    }
  }

  function dayWindows(hours, dow) {
    var w = hours[String(dow)];
    if (!w || !w.length) return [];
    return w.map(function (pair) { return [toMins(pair[0]), toMins(pair[1])]; })
            .sort(function (a, b) { return a[0] - b[0]; });
  }

  function compute(hours, now) {
    var today = dayWindows(hours, now.dow), i;
    for (i = 0; i < today.length; i++) {
      if (now.mins >= today[i][0] && now.mins < today[i][1]) {
        return { state: "on", end: today[i][1] };
      }
    }
    var later = today.filter(function (w) { return w[0] > now.mins; });
    if (later.length) return { state: "today", start: later[0][0], end: later[0][1] };

    for (var k = 1; k <= 7; k++) {
      var d = (now.dow + k) % 7;
      var w = dayWindows(hours, d);
      if (w.length) return { state: "next", offset: k, dow: d, start: w[0][0] };
    }
    return { state: "none" };
  }

  function render(el) {
    var hours;
    try { hours = JSON.parse(el.getAttribute("data-hours") || "{}"); }
    catch (e) { hours = {}; }
    var tz = el.getAttribute("data-tz") || "America/Los_Angeles";
    var now = nowInTZ(tz, el.getAttribute("data-now"));
    var r = compute(hours, now);

    var cls, title, sub;
    if (r.state === "on") {
      cls = "sfa-hhs--on"; title = "Happy Hour On Now"; sub = "Until " + fmt(r.end);
    } else if (r.state === "today") {
      cls = "sfa-hhs--today"; title = "Happy Hour Today"; sub = fmt(r.start) + " \u2013 " + fmt(r.end);
    } else if (r.state === "next") {
      cls = "sfa-hhs--next";
      var label = r.offset === 1 ? "Tomorrow" : DAYNAMES[r.dow];
      title = "Next Happy Hour"; sub = label + " \u00b7 " + fmt(r.start);
    } else {
      cls = "sfa-hhs--next"; title = "Happy Hour"; sub = "Schedule unavailable";
    }

    el.className = CLASS + " " + cls;
    el.innerHTML =
      '<span class="sfa-hhs-dot"></span>' +
      '<span class="sfa-hhs-txt">' +
        '<span class="sfa-hhs-title">' + title + '</span>' +
        '<span class="sfa-hhs-sub">' + sub + '</span>' +
      '</span>';
  }

  function renderAll() {
    injectStyle();
    var els = document.querySelectorAll("." + CLASS);
    for (var i = 0; i < els.length; i++) render(els[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderAll);
  } else {
    renderAll();
  }
  setInterval(renderAll, 60000);
})();
