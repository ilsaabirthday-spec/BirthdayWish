/* ============================================================
   Birthday site — interaction engine
   • custom cursor
   • HER HEAD-TURN VIDEO is scrubbed by the cursor:
       cursor X  →  target time in the clip  (smoothed + seek-queued)
       when no pointer has ever arrived, she looks around on her own
   • a light 3D tilt/parallax rides on top for depth
   • background music toggle with autoplay-on-first-gesture
   ============================================================ */
(function () {
  "use strict";

  var SITE = window.SITE || {};
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  /* ---------- site name injection ---------- */
  var name = SITE.name || "HER NAME";
  $$("[data-site-name]").forEach(function (el) {
    var dot = el.querySelector("i");
    el.textContent = "";
    el.appendChild(document.createTextNode(name));
    if (dot) el.appendChild(dot);
  });
  if (document.title.indexOf("{name}") !== -1) {
    document.title = document.title.replace("{name}", name);
  }

  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- shared pointer state ---------- */
  var vw = innerWidth, vh = innerHeight;
  var mx = vw / 2, my = vh / 2;
  var lastMove = -1e9;
  addEventListener("resize", function () { vw = innerWidth; vh = innerHeight; }, { passive: true });

  var tx = 0, ty = 0;      // target  (-1..1)
  var gx = 0, gy = 0;      // smoothed
  function pointerToTarget() {
    tx = (mx / vw - 0.5) * 2;
    ty = (my / vh - 0.5) * 2;
  }

  /* ---------- custom cursor ---------- */
  var cursorEl = $(".cursor");
  var cxp = vw / 2, cyp = vh / 2;
  var cursorShown = false;
  if (cursorEl && finePointer) {
    addEventListener("pointermove", function () {
      if (!cursorShown) { cursorShown = true; cursorEl.classList.add("on"); }
    }, { passive: true });
    addEventListener("pointerdown", function () { cursorEl.classList.add("down"); });
    addEventListener("pointerup", function () { cursorEl.classList.remove("down"); });
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest && e.target.closest("a, button, [data-hover]")) cursorEl.classList.add("hot");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest && e.target.closest("a, button, [data-hover]")) cursorEl.classList.remove("hot");
    });
    document.addEventListener("mouseleave", function () { cursorEl.classList.remove("on"); });
    document.addEventListener("mouseenter", function () { if (cursorShown) cursorEl.classList.add("on"); });
  } else if (cursorEl) {
    cursorEl.style.display = "none";
  }

  /* ---------- character: video scrub + 3D tilt ---------- */
  var tilt = $("#charTilt");
  var vid = $("#charVid");

  var vDur = 0, vSmooth = 0, vSeeking = false;

  if (vid) {
    function readMeta() {
      if (vid.duration && isFinite(vid.duration)) vDur = vid.duration;
    }
    readMeta();                                   // metadata may already be cached
    vid.addEventListener("loadedmetadata", readMeta);
    vid.addEventListener("loadeddata", function () {
      vid.classList.add("on");          // fade from poster to real frames
      readMeta();
      try { vid.currentTime = 0.04; } catch (e) {}
    });
    vid.addEventListener("seeked", function () {
      vSeeking = false;
      trySeek();          // chain the next seek immediately — no waiting for the next frame
    });
    vid.addEventListener("error", function () { vid.classList.add("on"); }); // poster fallback
  }

  var vSpan = 0;
  var vFrame = 1 / 24;        // the clip is 24fps — seek in whole film frames
  var vLastIdx = -1;
  function trySeek() {
    if (!vid || !vDur || vSeeking) return;
    var want = Math.max(0, Math.min(vSmooth, vSpan));
    var idx = Math.round(want / vFrame);
    if (idx === vLastIdx) return;               // already on / heading to this frame
    var t = idx * vFrame;
    vLastIdx = idx;
    if (Math.abs(vid.currentTime - t) < vFrame * 0.4) return; // close enough — no decode thrash
    vSeeking = true;
    window.__seeks = (window.__seeks || 0) + 1;
    try { vid.currentTime = t; }
    catch (e) { vSeeking = false; }
  }
  function driveVideo() {
    if (!vid || !vDur) return;
    // map the cursor across the good half of the clip:
    // far-left = her gaze to the left, centre = chin-up, far-right = profile to the right
    if (!vSpan) vSpan = vDur * 0.52;
    var target = ((gx + 1) / 2) * vSpan;
    vSmooth += (target - vSmooth) * 0.38;
    trySeek();
  }

  function applyTilt() {
    if (!tilt) return;
    tilt.style.transform =
      "rotateY(" + (gx * 9) + "deg) rotateX(" + (-gy * 7) + "deg)" +
      " translate3d(" + (gx * 22) + "px," + (gy * 12) + "px,0)";
  }

  function wander(t) {
    tx = Math.sin(t * 0.00045) * 0.85;
    ty = Math.sin(t * 0.0007 + 1.4) * 0.4;
  }

  var frames = 0, lastFrame = 0;
  function rafAlive() {
    return frames > 0 && (performance.now() - lastFrame) < 400;
  }

  function onPointer(e) {
    if (e && e.clientX === undefined) return;
    mx = e.clientX; my = e.clientY;
    lastMove = performance.now();
    window.__lastPointer = { x: mx, y: my, t: lastMove, trusted: !!e.isTrusted };
    pointerToTarget();
    if (!rafAlive()) {
      // animation frames throttled → drive everything straight from the event
      gx += (tx - gx) * 0.45;
      gy += (ty - gy) * 0.45;
      applyTilt();
      driveVideo();
      if (cursorEl && finePointer) {
        cxp = mx; cyp = my;
        cursorEl.style.transform = "translate3d(" + cxp + "px," + cyp + "px,0)";
      }
    }
  }
  addEventListener("pointermove", onPointer, { passive: true });
  addEventListener("mousemove", onPointer, { passive: true });   // insurance
  addEventListener("pointerdown", onPointer, { passive: true }); // taps aim her too

  (function loop(t) {
    frames++;
    lastFrame = t || performance.now();
    window.__frames = frames;
    if (lastMove < 0) wander(t);   // alive on her own until the first cursor move
    gx += (tx - gx) * 0.36;
    gy += (ty - gy) * 0.36;
    applyTilt();
    driveVideo();
    if (cursorEl && finePointer) {
      cxp += (mx - cxp) * 0.22;
      cyp += (my - cyp) * 0.22;
      cursorEl.style.transform = "translate3d(" + cxp + "px," + cyp + "px,0)";
    }
    requestAnimationFrame(loop);
  })(0);

  /* ---------- background music (a different song per page) ---------- */
  var audio = $("#bgm");
  var btn = $("#musicBtn");
  // pick this page's track: SITE.music is either a map keyed by body class or one file for all
  var pageKey = (document.body.className || "").replace(/^page-/, "").trim().split(/\s+/)[0] || "home";
  var track = (SITE.music && typeof SITE.music === "object")
    ? (SITE.music[pageKey] || SITE.musicDefault || SITE.music.home)
    : SITE.music;
  if (audio && track && audio.getAttribute("src") !== track) {
    audio.src = track;
  }
  if (audio && btn) {
    var missing = false;
    // every page auto-starts her song; a manual pause only lasts for
    // the current page (as requested — no sticky "off" state)
    var userWants = true;

    function remember() {}
    // (kept as a no-op so the old call sites stay simple)
    function markMissing() {
      if (missing) return;
      missing = true;
      btn.classList.add("missing");
      btn.title = "add the song file for this page (see assets/js/config.js)";
    }
    audio.addEventListener("error", markMissing);
    function sync() { btn.classList.toggle("playing", !audio.paused && !missing); }
    function tryPlay() {
      if (!userWants || missing) return;
      var p = audio.play();
      if (p && p.then) p.then(function () {
        // started on its own — no gesture fallback needed anymore,
        // and a later manual pause will stay paused
        removeEventListener("pointerdown", firstGesture);
        removeEventListener("keydown", firstGesture);
      });
      if (p && p.catch) p.catch(function (err) {
        if (err && err.name === "NotSupportedError") markMissing();
      });
      sync();
    }
    function firstGesture(e) {
      if (e && e.target && e.target.closest && e.target.closest("#musicBtn")) return;
      userWants = true;
      remember();
      tryPlay();
      removeEventListener("pointerdown", firstGesture);
      removeEventListener("keydown", firstGesture);
    }
    if (userWants) {
      addEventListener("pointerdown", firstGesture);
      addEventListener("keydown", firstGesture);
      // auto-start: try immediately (browsers that allow ungestured audio —
      // e.g. desktop, sites with prior interaction — start with no click at all)
      tryPlay();
      // …and keep retrying quietly while the stream spins up; if the browser
      // blocks it, the first real tap/keydown above takes over seamlessly
      audio.addEventListener("canplay", function onReady() {
        audio.removeEventListener("canplay", onReady);
        if (audio.paused && userWants) tryPlay();
      });
      [800, 2500].forEach(function (d) {
        setTimeout(function () { if (audio.paused && userWants) tryPlay(); }, d);
      });
    }
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (missing) return;
      userWants = audio.paused;
      remember();
      if (userWants) tryPlay();
      else { audio.pause(); sync(); }
    });
    audio.addEventListener("play", sync);
    audio.addEventListener("pause", sync);
  }
})();
