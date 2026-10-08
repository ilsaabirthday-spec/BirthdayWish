/* ============================================================
   MESSAGE page — "break the seal" unlock (v2)
   The wax seal DODGES around its arena — tap it 5 times to
   crack it open. Mobile-first: pointer events + CSS transitions,
   no canvas, no game loop.
   ============================================================ */
(function () {
  "use strict";

  var card = document.getElementById("msgCard");
  if (!card) return;

  var arena = document.getElementById("sealArena");
  var seal = document.getElementById("jumpSeal");
  var pipsWrap = document.getElementById("sealPips");
  var hint = document.getElementById("holdHint");
  var note = document.getElementById("holdNote");
  var sealed = document.getElementById("msgSealed");
  var letter = document.getElementById("msgLetter");
  var conf = document.getElementById("msgConf");
  var pips = pipsWrap ? pipsWrap.querySelectorAll("i") : [];

  var TAPS = 5;
  var taps = 0;
  var opened = false;
  var LINES = [
    "1 down — it slipped! keep going…",
    "2 down — it's scared now!",
    "3 down — almost got it!",
    "4 down — ONE MORE TAP!",
    "boom — seal broken! ❤️"
  ];

  function burst(emojis) {
    if (!conf) return;
    for (var i = 0; i < 8; i++) {
      var s = document.createElement("span");
      s.textContent = emojis[i % emojis.length];
      var ang = Math.random() * Math.PI * 2;
      var dist = 110 + Math.random() * 170;
      s.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      s.style.setProperty("--dy", (Math.sin(ang) * dist - 70) + "px");
      s.style.setProperty("--rot", (Math.random() * 460 - 230) + "deg");
      conf.appendChild(s);
      (function (el) { setTimeout(function () { el.remove(); }, 1600); })(s);
    }
  }

  function moveSeal() {
    if (!arena || !seal) return;
    var w = Math.max(0, arena.clientWidth - seal.offsetWidth);
    var h = Math.max(0, arena.clientHeight - seal.offsetHeight);
    seal.style.left = Math.round(6 + Math.random() * Math.max(0, w - 12)) + "px";
    seal.style.top = Math.round(6 + Math.random() * Math.max(0, h - 12)) + "px";
  }

  function reveal(staggerMax) {
    if (sealed) sealed.classList.add("gone");
    card.classList.add("open");
    var pars = letter ? letter.querySelectorAll(".mp") : [];
    Array.prototype.forEach.call(pars, function (p, i) {
      p.style.animationDelay = Math.min(0.1 + i * 0.14, staggerMax || 2.4) + "s";
    });
  }

  function open() {
    opened = true;
    if (hint) hint.textContent = "seal broken — it's all yours! ❤️";
    if (note) note.innerHTML = "read it twice, okay? 💌";
    if (seal) { seal.style.pointerEvents = "none"; seal.textContent = "❤️"; }
    burst(["❤️", "🎂", "✨", "💌"]);
    try { sessionStorage.setItem("msgUnlocked", "1"); } catch (e) {}
    setTimeout(function () { reveal(2.4); }, 620);
  }

  if (seal) {
    moveSeal();
    seal.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      if (opened) return;
      taps++;
      if (pips[taps - 1]) pips[taps - 1].classList.add("on");
      if (hint) hint.textContent = LINES[Math.min(taps, TAPS) - 1];
      burst(["✨"]);
      if (taps >= TAPS) { open(); return; }
      // it dodges — jump after every hit (tiny delay so the tap feels landed)
      seal.style.scale = "0.86";
      setTimeout(function () {
        seal.style.scale = "";
        moveSeal();
      }, 160);
    });
    seal.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  }

  // keep it aligned if the screen rotates while locked
  window.addEventListener("resize", function () {
    if (!opened) moveSeal();
  }, { passive: true });

  // already unlocked earlier this session? keep it open for her
  var wasOpen = false;
  try { wasOpen = sessionStorage.getItem("msgUnlocked") === "1"; } catch (e) {}
  if (wasOpen) {
    opened = true;
    taps = TAPS;
    Array.prototype.forEach.call(pips, function (p) { p.classList.add("on"); });
    if (hint) hint.textContent = "seal broken — it's all yours! ❤️";
    if (note) note.innerHTML = "read it twice, okay? 💌";
    if (seal) { seal.style.pointerEvents = "none"; seal.textContent = "❤️"; }
    reveal(1.6);
  }
})();
