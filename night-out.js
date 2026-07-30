/* my night out — Six Five Apps widget
   Drop-in:  <div id="sfa-night-out"></div>
             <script src="https://widgets.sixfiveapps.com/night-out.js"></script>
   Starts at "the plan" (use GoodBarber's native header/image above it).
   Saves to localStorage key "sfa-nightout" on this device/browser only. */
(function () {
  var ROOT_ID = "sfa-night-out";
  var STORE_KEY = "sfa-nightout";
  var root = document.getElementById(ROOT_ID);
  if (!root) return;

  /* ---------- styles (scoped + !important for GoodBarber) ---------- */
  if (!document.getElementById("sfa-nightout-styles")) {
    var css =
"#sfa-night-out,#sfa-night-out *{box-sizing:border-box !important}" +
"#sfa-night-out{display:block !important;max-width:440px !important;margin:0 auto !important;font:16px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif !important;color:#363428 !important}" +
"#sfa-night-out .sfa-card{background:#fffefb !important;border:1px solid #e4e0d4 !important;border-radius:16px !important;overflow:hidden !important;box-shadow:0 10px 30px rgba(54,52,40,.08) !important}" +
"#sfa-night-out .sfa-sec{padding:20px 22px !important;border-top:1px solid #e4e0d4 !important}" +
"#sfa-night-out .sfa-sec.sfa-first{border-top:none !important}" +
"#sfa-night-out .sfa-sec h2{font-family:Georgia,'Times New Roman',serif !important;font-weight:400 !important;font-size:19px !important;margin:0 0 14px !important;display:flex !important;align-items:center !important;gap:9px !important;color:#363428 !important}" +
"#sfa-night-out .sfa-em{font-size:18px !important}" +
"#sfa-night-out .sfa-field{margin-bottom:13px !important}" +
"#sfa-night-out .sfa-field label{display:block !important;font-size:12px !important;letter-spacing:.4px !important;text-transform:lowercase !important;color:#5a5748 !important;margin:0 0 5px !important}" +
"#sfa-night-out .sfa-row{display:flex !important;gap:12px !important}" +
"#sfa-night-out .sfa-row .sfa-field{flex:1 !important}" +
"#sfa-night-out input[type=text],#sfa-night-out textarea{width:100% !important;font:15px/1.4 inherit !important;color:#363428 !important;background:#f7f7f4 !important;border:1px solid #d6d1c1 !important;border-radius:9px !important;padding:10px 12px !important;-webkit-appearance:none !important;appearance:none !important;margin:0 !important}" +
"#sfa-night-out textarea{resize:vertical !important;min-height:74px !important}" +
"#sfa-night-out input[type=text]:focus,#sfa-night-out textarea:focus{outline:none !important;border-color:#B3995B !important;box-shadow:0 0 0 3px rgba(179,153,91,.18) !important}" +
"#sfa-night-out input::placeholder,#sfa-night-out textarea::placeholder{color:#a8a390 !important;opacity:1 !important}" +
"#sfa-night-out .sfa-toggle{display:inline-flex !important;background:#f7f7f4 !important;border:1px solid #d6d1c1 !important;border-radius:10px !important;padding:3px !important;gap:3px !important;margin-bottom:15px !important}" +
"#sfa-night-out .sfa-toggle button{border:none !important;background:none !important;font:14px/1 inherit !important;color:#5a5748 !important;padding:9px 20px !important;border-radius:7px !important;cursor:pointer !important}" +
"#sfa-night-out .sfa-toggle button.sfa-on{background:#363428 !important;color:#f7f7f4 !important}" +
"#sfa-night-out .sfa-pills{display:flex !important;gap:8px !important;flex-wrap:wrap !important}" +
"#sfa-night-out .sfa-pills button{border:1px solid #d6d1c1 !important;background:#f7f7f4 !important;color:#5a5748 !important;border-radius:999px !important;padding:8px 16px !important;font:14px/1 inherit !important;cursor:pointer !important}" +
"#sfa-night-out .sfa-pills button.sfa-on{background:#B3995B !important;border-color:#B3995B !important;color:#fff !important}" +
"#sfa-night-out .sfa-collapsed{display:none !important}" +
"#sfa-night-out .sfa-walkin{font-size:14px !important;color:#5a5748 !important;padding:2px 0 !important}" +
"#sfa-night-out .sfa-chips{display:flex !important;flex-wrap:wrap !important;gap:8px !important}" +
"#sfa-night-out .sfa-chips.sfa-has{margin-bottom:12px !important}" +
"#sfa-night-out .sfa-chip{display:inline-flex !important;align-items:center !important;gap:7px !important;background:#f7f7f4 !important;border:1px solid #d6d1c1 !important;border-radius:999px !important;padding:6px 10px 6px 13px !important;font-size:14px !important;color:#363428 !important}" +
"#sfa-night-out .sfa-chip button{border:none !important;background:none !important;cursor:pointer !important;color:#5a5748 !important;font-size:16px !important;line-height:1 !important;padding:0 !important}" +
"#sfa-night-out .sfa-add{display:flex !important;gap:8px !important}" +
"#sfa-night-out .sfa-add input{flex:1 !important}" +
"#sfa-night-out .sfa-add button{border:none !important;background:#363428 !important;color:#f7f7f4 !important;border-radius:9px !important;padding:0 16px !important;font-size:14px !important;cursor:pointer !important}" +
"#sfa-night-out .sfa-rides{display:flex !important;gap:10px !important;margin:2px 0 0 !important}" +
"#sfa-night-out .sfa-ride{flex:1 !important;text-align:center !important;text-decoration:none !important;border-radius:10px !important;padding:11px 0 !important;font-size:14px !important;font-weight:600 !important;letter-spacing:.3px !important;display:block !important}" +
"#sfa-night-out .sfa-ride.sfa-uber{background:#363428 !important;color:#f7f7f4 !important}" +
"#sfa-night-out .sfa-ride.sfa-lyft{background:#C65E2D !important;color:#fff !important}" +
"#sfa-night-out .sfa-divider{padding:15px 22px !important;background:#f2efe6 !important;border-top:1px solid #e4e0d4 !important;border-bottom:1px solid #e4e0d4 !important}" +
"#sfa-night-out .sfa-divlabel{font-family:Georgia,'Times New Roman',serif !important;font-size:16px !important;color:#363428 !important;display:flex !important;align-items:center !important;gap:8px !important}" +
"#sfa-night-out .sfa-divsub{margin:4px 0 0 !important;font-size:12px !important;color:#5a5748 !important;letter-spacing:.2px !important}" +
"#sfa-night-out .sfa-check{list-style:none !important;margin:0 !important;padding:0 !important}" +
"#sfa-night-out .sfa-check li{margin-bottom:2px !important}" +
"#sfa-night-out .sfa-check label{display:flex !important;align-items:center !important;gap:11px !important;text-transform:none !important;font-size:15px !important;color:#363428 !important;padding:7px 0 !important;cursor:pointer !important;margin:0 !important;letter-spacing:0 !important}" +
"#sfa-night-out .sfa-check input{-webkit-appearance:none !important;appearance:none !important;width:20px !important;height:20px !important;flex:0 0 20px !important;border:1.5px solid #d6d1c1 !important;border-radius:6px !important;background:#f7f7f4 !important;cursor:pointer !important;position:relative !important;margin:0 !important}" +
"#sfa-night-out .sfa-check input:checked{background:#B3995B !important;border-color:#B3995B !important}" +
"#sfa-night-out .sfa-check input:checked::after{content:'' !important;position:absolute !important;left:6px !important;top:2px !important;width:5px !important;height:10px !important;border:solid #fff !important;border-width:0 2px 2px 0 !important;transform:rotate(45deg) !important}" +
"#sfa-night-out .sfa-check input:checked + span{color:#5a5748 !important;text-decoration:line-through !important}" +
"#sfa-night-out .sfa-ft{padding:20px 22px 24px !important;border-top:1px solid #e4e0d4 !important;background:#f7f7f4 !important}" +
"#sfa-night-out .sfa-note{font-size:11.5px !important;line-height:1.55 !important;color:#5a5748 !important;text-align:center !important;margin:0 6px !important;letter-spacing:.2px !important}" +
"#sfa-night-out .sfa-fresh{display:block !important;width:100% !important;text-align:center !important;background:none !important;border:none !important;color:#5a5748 !important;font-size:12.5px !important;margin-top:14px !important;cursor:pointer !important;text-decoration:underline !important;font-family:inherit !important}";
    var style = document.createElement("style");
    style.id = "sfa-nightout-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ---------- markup ---------- */
  var checkItems = [
    ["keys", "keys"], ["wallet", "wallet"], ["phone", "phone"], ["id", "id"],
    ["glasses", "driving glasses"], ["charge", "charge phone"],
    ["water", "water bottle"], ["jacket", "jacket"]
  ];
  var checkHtml = checkItems.map(function (it) {
    return "<li><label><input type='checkbox' data-item='" + it[0] + "'><span>" + it[1] + "</span></label></li>";
  }).join("");

  root.innerHTML =
'<div class="sfa-card">' +

  '<div class="sfa-sec sfa-first"><h2><span class="sfa-em">📍</span> the plan</h2>' +
    '<div class="sfa-field"><label>where</label><input type="text" id="sfa-venue" placeholder="the copper fork"></div>' +
    '<div class="sfa-row"><div class="sfa-field"><label>date</label><input type="text" id="sfa-date" placeholder="fri, aug 8"></div>' +
    '<div class="sfa-field"><label>meet time</label><input type="text" id="sfa-time" placeholder="7:45 pm"></div></div>' +
    '<div class="sfa-field"><label>address</label><input type="text" id="sfa-address" placeholder="525 fremont st"></div>' +
  '</div>' +

  '<div class="sfa-sec"><h2><span class="sfa-em">🍽️</span> reservation</h2>' +
    '<div class="sfa-toggle" id="sfa-resToggle"><button type="button" class="sfa-on" data-res="yes">we have one</button><button type="button" data-res="no">walk-in</button></div>' +
    '<div id="sfa-resDetails">' +
      '<div class="sfa-row"><div class="sfa-field"><label>reserved for</label><input type="text" id="sfa-resTime" placeholder="8:00 pm"></div>' +
      '<div class="sfa-field"><label>party size</label><input type="text" id="sfa-resParty" placeholder="5"></div></div>' +
      '<div class="sfa-field"><label>they hold the table for</label><div class="sfa-pills" id="sfa-holdPills"><button type="button">15 min</button><button type="button">30 min</button><button type="button">45 min</button></div></div>' +
      '<div class="sfa-field"><label>spoke to</label><input type="text" id="sfa-resWho" placeholder="michael — general manager"></div>' +
      '<div class="sfa-field"><label>phone</label><input type="text" id="sfa-resPhone" placeholder="(702) 555-0148"></div>' +
      '<div class="sfa-field"><label>confirmation name / # (optional)</label><input type="text" id="sfa-resConf" placeholder="jackson — party of 5"></div>' +
    '</div>' +
    '<div id="sfa-resWalkin" class="sfa-walkin sfa-collapsed">no reservation — planning to walk in.</div>' +
  '</div>' +

  '<div class="sfa-sec"><h2><span class="sfa-em">👥</span> the crew</h2>' +
    '<div class="sfa-chips" id="sfa-chips"></div>' +
    '<div class="sfa-add"><input type="text" id="sfa-crewInput" placeholder="add a name"><button type="button" id="sfa-crewAdd">add</button></div>' +
  '</div>' +

  '<div class="sfa-sec"><h2><span class="sfa-em">🚗</span> transportation</h2>' +
    '<div class="sfa-field"><label>getting there</label><input type="text" id="sfa-getting" placeholder="riding separately, meeting there"></div>' +
    '<div class="sfa-field"><label>designated driver</label><input type="text" id="sfa-dd" placeholder="sarah"></div>' +
    '<div class="sfa-field"><div class="sfa-rides"><a class="sfa-ride sfa-uber" href="https://m.uber.com/" target="_blank" rel="noopener">open uber</a><a class="sfa-ride sfa-lyft" href="https://www.lyft.com/rider" target="_blank" rel="noopener">open lyft</a></div></div>' +
  '</div>' +

  '<div class="sfa-divider"><div class="sfa-divlabel"><span class="sfa-em">🔒</span> just for you</div><p class="sfa-divsub">your own notes — kept private on this device</p></div>' +

  '<div class="sfa-sec"><h2><span class="sfa-em">🅿️</span> parking</h2>' +
    '<div class="sfa-field"><label>where you parked</label><textarea id="sfa-parking" placeholder="level 3, section c — near the elevator"></textarea></div>' +
  '</div>' +

  '<div class="sfa-sec"><h2><span class="sfa-em">📝</span> notes</h2>' +
    '<div class="sfa-field"><textarea id="sfa-notes" style="min-height:96px !important" placeholder="patio requested • john arrives 6:30 • ask for a high-top • bring jen\'s gift card"></textarea></div>' +
  '</div>' +

  '<div class="sfa-sec"><h2><span class="sfa-em">💰</span> budget</h2>' +
    '<div class="sfa-row"><div class="sfa-field"><label>budget tonight</label><input type="text" id="sfa-bBudget" placeholder="$80"></div>' +
    '<div class="sfa-field"><label>est. spend</label><input type="text" id="sfa-bEst" placeholder="$65"></div>' +
    '<div class="sfa-field"><label>cash brought</label><input type="text" id="sfa-bCash" placeholder="$40"></div></div>' +
  '</div>' +

  '<div class="sfa-sec"><h2><span class="sfa-em">☑️</span> before you leave</h2><ul class="sfa-check" id="sfa-check">' + checkHtml + '</ul></div>' +

  '<div class="sfa-ft">' +
    '<p class="sfa-note">saved on this device only. your plan stays in this browser — it isn\'t shared with anyone, and it won\'t show up if you open the app on another phone or computer.</p>' +
    '<button type="button" class="sfa-fresh" id="sfa-freshBtn">clear &amp; start a new night</button>' +
  '</div>' +
'</div>';

  /* ---------- helpers ---------- */
  function q(sel) { return root.querySelector(sel); }
  function qa(sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }

  var textIds = ["sfa-venue","sfa-date","sfa-time","sfa-address","sfa-resTime","sfa-resParty",
    "sfa-resWho","sfa-resPhone","sfa-resConf","sfa-getting","sfa-dd","sfa-parking","sfa-notes",
    "sfa-bBudget","sfa-bEst","sfa-bCash"];

  var crew = [];
  var ready = false;

  function resIsYes() {
    var b = q('#sfa-resToggle button[data-res="yes"]');
    return b && b.classList.contains("sfa-on");
  }
  function activeHold() {
    var b = q("#sfa-holdPills button.sfa-on");
    return b ? b.textContent : "";
  }

  /* ---------- persistence ---------- */
  function save() {
    if (!ready) return;
    var data = { text: {}, crew: crew.slice(), res: resIsYes() ? "yes" : "no", hold: activeHold(), checks: {} };
    textIds.forEach(function (id) { var el = q("#" + id); if (el) data.text[id] = el.value; });
    qa("#sfa-check input").forEach(function (cb) { data.checks[cb.getAttribute("data-item")] = cb.checked; });
    try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch (e) {}
  }
  function load() {
    var raw = null;
    try { raw = localStorage.getItem(STORE_KEY); } catch (e) {}
    if (!raw) return;
    var data;
    try { data = JSON.parse(raw); } catch (e) { return; }
    if (data.text) textIds.forEach(function (id) { var el = q("#" + id); if (el && data.text[id] != null) el.value = data.text[id]; });
    crew = Array.isArray(data.crew) ? data.crew : [];
    setRes(data.res !== "no");
    if (data.hold) qa("#sfa-holdPills button").forEach(function (b) { b.classList.toggle("sfa-on", b.textContent === data.hold); });
    if (data.checks) qa("#sfa-check input").forEach(function (cb) {
      var k = cb.getAttribute("data-item");
      if (k in data.checks) cb.checked = !!data.checks[k];
    });
  }

  /* ---------- crew ---------- */
  function renderCrew() {
    var c = q("#sfa-chips");
    c.innerHTML = "";
    c.classList.toggle("sfa-has", crew.length > 0);
    crew.forEach(function (name, i) {
      var el = document.createElement("span");
      el.className = "sfa-chip";
      el.innerHTML = "<span></span><button type='button' aria-label='remove'>&times;</button>";
      el.firstChild.textContent = name;
      el.querySelector("button").onclick = function () { crew.splice(i, 1); renderCrew(); save(); };
      c.appendChild(el);
    });
  }
  function addCrew() {
    var input = q("#sfa-crewInput");
    var v = input.value.trim();
    if (v) { crew.push(v); input.value = ""; renderCrew(); save(); }
  }

  /* ---------- reservation ---------- */
  function setRes(has) {
    q('#sfa-resToggle button[data-res="yes"]').classList.toggle("sfa-on", has);
    q('#sfa-resToggle button[data-res="no"]').classList.toggle("sfa-on", !has);
    q("#sfa-resDetails").classList.toggle("sfa-collapsed", !has);
    q("#sfa-resWalkin").classList.toggle("sfa-collapsed", has);
  }

  /* ---------- wire up ---------- */
  q("#sfa-crewAdd").addEventListener("click", addCrew);
  q("#sfa-crewInput").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); addCrew(); } });
  qa("#sfa-resToggle button").forEach(function (b) {
    b.addEventListener("click", function () { setRes(b.getAttribute("data-res") === "yes"); save(); });
  });
  qa("#sfa-holdPills button").forEach(function (b) {
    b.addEventListener("click", function () {
      var wasOn = b.classList.contains("sfa-on");
      qa("#sfa-holdPills button").forEach(function (x) { x.classList.remove("sfa-on"); });
      if (!wasOn) b.classList.add("sfa-on");
      save();
    });
  });
  textIds.forEach(function (id) { var el = q("#" + id); if (el) el.addEventListener("input", save); });
  qa("#sfa-check input").forEach(function (cb) { cb.addEventListener("change", save); });
  q("#sfa-freshBtn").addEventListener("click", function () {
    if (!confirm("Clear this plan and start a new night?")) return;
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    textIds.forEach(function (id) { var el = q("#" + id); if (el) el.value = ""; });
    crew = []; renderCrew();
    setRes(true);
    qa("#sfa-holdPills button").forEach(function (b) { b.classList.remove("sfa-on"); });
    qa("#sfa-check input").forEach(function (cb) { cb.checked = false; });
  });

  /* ---------- init ---------- */
  renderCrew();
  load();
  renderCrew();
  ready = true;
})();
