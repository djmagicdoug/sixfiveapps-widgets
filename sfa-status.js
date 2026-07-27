/* Six Five Apps — Open/Closed + Hours status widget
   Reusable across listings. Upload once to widgets.sixfiveapps.com.
   Per listing, paste a container:
   <div class="sfa-status" data-tz="America/Los_Angeles"
        data-hours='{"1":[["11:00","22:00"]], ... }'></div>
   Days are keyed 0=Sun .. 6=Sat. Times are 24h "HH:MM"; use "24:00" for midnight.
   Multiple ranges per day allowed (split shifts). Missing/empty day = closed. */
(function () {
  var DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var SHORT = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 };
  var WEEK_ORDER = [1,2,3,4,5,6,0]; // display Mon..Sun

  function toMin(t){ var p = String(t).split(':'); return (+p[0]) * 60 + (+p[1]); }

  function fmt(min){
    min = ((min % 1440) + 1440) % 1440;
    var h = Math.floor(min / 60), m = min % 60;
    var ap = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12; if (h12 === 0) h12 = 12;
    return h12 + ':' + (m < 10 ? '0' : '') + m + ' ' + ap;
  }

  function nowInTz(tz){
    var d = new Date();
    var wk = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(d);
    var parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d);
    var hh = 0, mm = 0;
    parts.forEach(function (p){ if (p.type === 'hour') hh = +p.value; if (p.type === 'minute') mm = +p.value; });
    if (hh === 24) hh = 0;
    return { day: SHORT[wk], min: hh * 60 + mm };
  }

  function currentlyOpen(hours, now){
    var ranges = hours[now.day] || [];
    for (var i = 0; i < ranges.length; i++){
      var om = toMin(ranges[i][0]), cm = toMin(ranges[i][1]);
      if (cm <= om) cm += 1440;
      if (now.min >= om && now.min < cm) return { open: true, closeMin: cm };
    }
    // yesterday's hours spilling past midnight into today
    var y = (now.day + 6) % 7, yr = hours[y] || [];
    for (var j = 0; j < yr.length; j++){
      var yo = toMin(yr[j][0]), yc = toMin(yr[j][1]);
      if (yc <= yo && now.min < yc) return { open: true, closeMin: yc };
    }
    return { open: false };
  }

  function nextOpen(hours, now){
    for (var off = 0; off < 8; off++){
      var day = (now.day + off) % 7;
      var ranges = (hours[day] || []).slice().sort(function (a, b){ return toMin(a[0]) - toMin(b[0]); });
      for (var i = 0; i < ranges.length; i++){
        var om = toMin(ranges[i][0]);
        if (off === 0 && om <= now.min) continue;
        var label = off === 0 ? 'today' : (off === 1 ? 'tomorrow' : DAYS[day]);
        return label + ' at ' + fmt(om);
      }
    }
    return null;
  }

  function dayLabel(ranges){
    if (!ranges || !ranges.length) return 'Closed';
    return ranges.map(function (r){
      var cm = toMin(r[1]);
      return fmt(toMin(r[0])) + ' \u2013 ' + fmt(cm);
    }).join(', ');
  }

  function render(el){
    var hours, tz;
    try { hours = JSON.parse(el.getAttribute('data-hours') || '{}'); }
    catch (e) { return; }
    tz = el.getAttribute('data-tz') || (Intl.DateTimeFormat().resolvedOptions().timeZone) || 'America/Los_Angeles';

    var now = nowInTz(tz);
    var st = currentlyOpen(hours, now);
    var sub;
    if (st.open) {
      sub = 'until ' + fmt(st.closeMin);
    } else {
      var no = nextOpen(hours, now);
      sub = no ? 'opens ' + no : '';
    }

    var rowsHtml = WEEK_ORDER.map(function (d){
      var cls = 'sfa-status-row' + (d === now.day ? ' sfa-status-row--today' : '');
      return '<div class="' + cls + '"><span class="sfa-status-day">' + DAYS[d] +
             '</span><span class="sfa-status-time">' + dayLabel(hours[d]) + '</span></div>';
    }).join('');

    el.innerHTML =
      '<button type="button" class="sfa-status-head" aria-expanded="false">' +
        '<span class="sfa-status-badge ' + (st.open ? 'is-open' : 'is-closed') + '">' +
          (st.open ? 'Open' : 'Closed') + '</span>' +
        '<span class="sfa-status-sub">' + sub + '</span>' +
        '<svg class="sfa-status-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>' +
      '</button>' +
      '<div class="sfa-status-week" hidden>' + rowsHtml + '</div>';

    var head = el.querySelector('.sfa-status-head');
    var week = el.querySelector('.sfa-status-week');
    head.addEventListener('click', function (){
      var open = week.hasAttribute('hidden');
      if (open) { week.removeAttribute('hidden'); head.setAttribute('aria-expanded', 'true'); el.classList.add('is-expanded'); }
      else { week.setAttribute('hidden', ''); head.setAttribute('aria-expanded', 'false'); el.classList.remove('is-expanded'); }
    });
  }

  function injectStyles(){
    if (document.getElementById('sfa-status-styles')) return;
    var css =
      '.sfa-status{width:100%;box-sizing:border-box;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#363428;}' +
      '.sfa-status .sfa-status-head{display:flex;align-items:center;gap:10px;width:100%;background:none;border:none;padding:14px 0;cursor:pointer;text-align:left;-webkit-tap-highlight-color:transparent;}' +
      '.sfa-status .sfa-status-badge{flex:0 0 auto;font-size:13px;font-weight:700;letter-spacing:.02em;padding:5px 12px;border-radius:999px;}' +
      '.sfa-status .sfa-status-badge.is-open{color:#2f6b3f;background:rgba(63,125,78,.15);}' +
      '.sfa-status .sfa-status-badge.is-closed{color:#a63229;background:rgba(166,50,41,.13);}' +
      '.sfa-status .sfa-status-sub{flex:1 1 auto;font-size:14px;color:rgba(54,52,40,.7);}' +
      '.sfa-status .sfa-status-chev{flex:0 0 auto;width:18px;height:18px;color:#C65E2D;transition:transform .2s ease;}' +
      '.sfa-status.is-expanded .sfa-status-chev{transform:rotate(180deg);}' +
      '.sfa-status .sfa-status-head:focus-visible{outline:2px solid #B3995B;outline-offset:3px;border-radius:4px;}' +
      '.sfa-status .sfa-status-week{padding:4px 0 12px 0;border-top:1px solid rgba(54,52,40,.1);}' +
      '.sfa-status .sfa-status-row{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:5px 0;}' +
      '.sfa-status .sfa-status-day{font-family:Georgia,"Times New Roman",serif;font-size:15px;color:#363428;}' +
      '.sfa-status .sfa-status-time{font-size:14px;color:rgba(54,52,40,.75);white-space:nowrap;}' +
      '.sfa-status .sfa-status-row--today .sfa-status-day{font-weight:700;}' +
      '.sfa-status .sfa-status-row--today .sfa-status-time{color:#363428;font-weight:600;}';
    var s = document.createElement('style');
    s.id = 'sfa-status-styles';
    s.textContent = css;
    document.head.appendChild(s);
  }

  function renderAll(){
    injectStyles();
    var els = document.querySelectorAll('.sfa-status[data-hours]');
    for (var i = 0; i < els.length; i++){
      if (els[i].getAttribute('data-sfa-done')) continue;
      els[i].setAttribute('data-sfa-done', '1');
      render(els[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAll);
  } else {
    renderAll();
  }
  window.sfaStatusRefresh = renderAll;
})();
