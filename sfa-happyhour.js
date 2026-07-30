(function () {
  "use strict";

  var CLASS = "sfa-hhstatus";
  var STYLE_ID = "sfa-hhstatus-style";
  var DAYNAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  var ORDER = [1,2,3,4,5,6,0]; // Monday-first display order
  var SHORT = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 };

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var css = `
      .sfa-hhstatus{
        box-sizing:border-box !important; width:100% !important;
        border-radius:12px !important; overflow:hidden !important;
        font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif !important;
        background:#f7f7f4 !important; border:1px solid rgba(54,52,40,.12) !important;
        color:#363428 !important;
      }
      .sfa-hhstatus .sfa-hhs-bar{
        display:flex !important; align-items:center !important; gap:11px !important;
        width:100% !important; box-sizing:border-box !important;
        padding:13px 15px !important; margin:0 !important;
        background:transparent !important; border:0 !important;
        text-align:left !important; cursor:pointer !important;
        font-family:inherit !important; color:#363428 !important;
        -webkit-tap-highlight-color:transparent !important;
      }
      .sfa-hhstatus .sfa-hhs-dot{
        width:12px !important; height:12px !important; border-radius:999px !important;
        flex:0 0 auto !important; background:#9a978c !important;
      }
      .sfa-hhstatus .sfa-hhs-txt{ flex:1 1 auto !important; display:flex !important; flex-direction:column !important; line-height:1.25 !important; }
      .sfa-hhstatus .sfa-hhs-title{ font-family:Georgia,"Times New Roman",serif !important; font-size:17px !important; font-weight:400 !important; color:#363428 !important; }
      .sfa-hhstatus .sfa-hhs-sub{ font-size:13px !important; color:rgba(54,52,40,.7) !important; margin-top:1px !important; }
      .sfa-hhstatus .sfa-hhs-chev{
        flex:0 0 auto !important; width:9px !important; height:9px !important; margin-top:-3px !important;
        border-right:2px solid rgba(54,52,40,.45) !important; border-bottom:2px solid rgba(54,52,40,.45) !important;
        transform:rotate(45deg) !important; transition:transform .2s ease !important;
      }
      .sfa-hhstatus.sfa-hhs--open .sfa-hhs-chev{ transform:rotate(225deg) !important; margin-top:3px !important; }

      .sfa-hhstatus.sfa-hhs--on .sfa-hhs-dot{ background:#4f8a5f !important; box-shadow:0 0 0 4px rgba(79,138,95,.18) !important; }
      .sfa-hhstatus.sfa-hhs--today .sfa-hhs-dot{ background:#B3995B !important; box-shadow:0 0 0 4px rgba(179,153,91,.18) !important; }
      .sfa-hhstatus.sfa-hhs--next .sfa-hhs-dot{ background:#9a978c !important; }

      .sfa-hhstatus .sfa-hhs-sched{ overflow:hidden !important; max-height:0 !important; transition:max-height .22s ease !important; }
      .sfa-hhstatus.sfa-hhs--open .sfa-hhs-sched{ max-height:460px !important; }
      .sfa-hhstatus .sfa-hhs-schedinner{ padding:4px 12px 12px 12px !important; border-top:1px solid rgba(179,153,91,.4) !important; }
      .sfa-hhstatus .sfa-hhs-day{
        display:flex !important; align-items:baseline !important; justify-content:space-between !important;
        gap:12px !important; padding:8px 8px !important; border-radius:6px !important;
        font-size:14px !important; border-bottom:1px solid rgba(54,52,40,.07) !important;
      }
      .sfa-hhstatus .sfa-hhs-day:last-child{ border-bottom:0 !important; }
      .sfa-hhstatus .sfa-hhs-day .d-name{ color:#363428 !important; }
      .sfa-hhstatus .sfa-hhs-day .d-time{ color:rgba(54,52,40,.7) !important; white-space:nowrap !important; }
      .sfa-hhstatus .sfa-hhs-day.is-closed .d-time{ color:rgba(54,52,40,.45) !important; font-style:italic !important; }
      .sfa-hhstatus .sfa-hhs-day.is-today{ background:rgba(179,153,91,.16) !important; }
      .sfa-hhstatus .sfa-hhs-day.is-today .d-name{ font-weight:700 !important; color:#363428 !important; }
      .sfa-hhstatus .sfa-hhs-day.is-today .d-name::after{ content:" \u00b7 Today" !important; color:#B3995B !important; font-weight:700 !important; }
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
      if (now.mins >= today[i][0] && now.mins < today[i][1]) return { state: "on", end: today[i][1] };
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

  function build(el, hours) {
    var rows = "";
    for (var j = 0; j < ORDER.length; j++) {
      var d = ORDER[j];
      var wins = dayWindows(hours, d);
      var timeStr, closed;
      if (wins.length) {
        closed = "";
        timeStr = wins.map(function (w) { return fmt(w[0]) + " \u2013 " + fmt(w[1]); }).join(", ");
      } else {
        closed = " is-closed";
        timeStr = "Not Available";
      }
      rows += '<div class="sfa-hhs-day' + closed + '" data-dow="' + d + '">' +
                '<span class="d-name">' + DAYNAMES[d] + '</span>' +
                '<span class="d-time">' + timeStr + '</span>' +
              '</div>';
    }
    el.innerHTML =
      '<button type="button" class="sfa-hhs-bar" aria-expanded="false">' +
        '<span class="sfa-hhs-dot"></span>' +
        '<span class="sfa-hhs-txt"><span class="sfa-hhs-title"></span><span class="sfa-hhs-sub"></span></span>' +
        '<span class="sfa-hhs-chev"></span>' +
      '</button>' +
      '<div class="sfa-hhs-sched"><div class="sfa-hhs-schedinner">' + rows + '</div></div>';

    var bar = el.querySelector(".sfa-hhs-bar");
    bar.addEventListener("click", function () {
      var open = el.classList.toggle("sfa-hhs--open");
      bar.setAttribute("aria-expanded", open ? "true" : "false");
    });
    el.__sfaBuilt = true;
  }

  function update(el) {
    var hours;
    try { hours = JSON.parse(el.getAttribute("data-hours") || "{}"); }
    catch (e) { hours = {}; }
    var tz = el.getAttribute("data-tz") || "America/Los_Angeles";
    var now = nowInTZ(tz, el.getAttribute("data-now"));
    var r = compute(hours, now);

    var state, title, sub;
    if (r.state === "on") { state = "sfa-hhs--on"; title = "Happy Hour On Now"; sub = "Until " + fmt(r.end); }
    else if (r.state === "today") { state = "sfa-hhs--today"; title = "Happy Hour Today"; sub = fmt(r.start) + " \u2013 " + fmt(r.end); }
    else if (r.state === "next") {
      state = "sfa-hhs--next";
      var label = r.offset === 1 ? "Tomorrow" : DAYNAMES[r.dow];
      title = "Next Happy Hour"; sub = label + " \u00b7 " + fmt(r.start);
    } else { state = "sfa-hhs--next"; title = "Happy Hour"; sub = "Schedule unavailable"; }

    el.classList.remove("sfa-hhs--on", "sfa-hhs--today", "sfa-hhs--next");
    el.classList.add(state);
    el.querySelector(".sfa-hhs-title").textContent = title;
    el.querySelector(".sfa-hhs-sub").textContent = sub;

    var days = el.querySelectorAll(".sfa-hhs-day");
    for (var i = 0; i < days.length; i++) {
      if (parseInt(days[i].getAttribute("data-dow"), 10) === now.dow) days[i].classList.add("is-today");
      else days[i].classList.remove("is-today");
    }
  }

  function renderAll() {
    injectStyle();
    var els = document.querySelectorAll("." + CLASS);
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (!el.__sfaBuilt) {
        var hours;
        try { hours = JSON.parse(el.getAttribute("data-hours") || "{}"); } catch (e) { hours = {}; }
        build(el, hours);
      }
      update(el);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderAll);
  } else {
    renderAll();
  }
  setInterval(renderAll, 60000);
})();
