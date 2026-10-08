/* ============================================================
   LETTER page — "PENGUIN POP" mini-game
   One penguin pops out of one of six ice holes.
   Tap it before it dives back — 10 hits in 25s wins.
   Mobile-first: pure DOM + emoji, no canvas, no heavy loop —
   just a setTimeout chain and CSS transforms.
   ============================================================ */
(function () {
  "use strict";

  var arena = document.getElementById("pgArena");
  if (!arena) return;

  var game = document.getElementById("pgame");
  var peng = document.getElementById("pgPeng");
  var holes = Array.prototype.slice.call(arena.querySelectorAll(".hole"));
  var scoreEl = document.getElementById("pgScore");
  var timeEl = document.getElementById("pgTime");
  var bestEl = document.getElementById("pgBest");
  var subEl = document.getElementById("pgameSub");
  var btn = document.getElementById("pgBtn");
  var conf = document.getElementById("pgConf");

  var TARGET = 10, ROUND = 25;
  var score = 0, timeLeft = ROUND, best = 0;
  var playing = false, lastHole = -1;
  var popT = null, hideT = null, tickT = null;
  var idleDelay = 780; // penguin shows this long before diving — shrinks as she scores
  var letterPaper = document.getElementById("letterPaper");

  function openLetter() {
    if (letterPaper) letterPaper.classList.add("opened");
    if (subEl) {
      subEl.innerHTML = "letter unlocked — enjoy it! 💌";
      subEl.classList.add("win");
    }
    if (btn) btn.textContent = "PLAY AGAIN ↺";
    try { sessionStorage.setItem("letterUnlocked", "1"); } catch (e) {}
  }

  try { best = parseInt(localStorage.getItem("pgBest") || "0", 10) || 0; } catch (e) {}
  bestEl.textContent = best;

  function burst() {
    if (!conf) return;
    for (var i = 0; i < 6; i++) {
      var s = document.createElement("span");
      s.textContent = ["🐧", "❄", "🧊", "💛"][i % 4];
      var ang = Math.random() * Math.PI * 2;
      var dist = 80 + Math.random() * 140;
      s.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      s.style.setProperty("--dy", (Math.sin(ang) * dist - 60) + "px");
      s.style.setProperty("--rot", (Math.random() * 400 - 200) + "deg");
      conf.appendChild(s);
      (function (el) { setTimeout(function () { el.remove(); }, 1500); })(s);
    }
  }

  function placePenguin() {
    var idx;
    do { idx = Math.floor(Math.random() * holes.length); } while (idx === lastHole);
    lastHole = idx;
    var hr = holes[idx].getBoundingClientRect();
    var ar = arena.getBoundingClientRect();
    peng.style.left = (hr.left - ar.left) + "px";
    peng.style.top = (hr.top - ar.top) + "px";
    peng.style.width = hr.width + "px";
    peng.style.height = hr.height + "px";
    peng.classList.add("up");
    // dive back after a beat (shorter as the score climbs)
    idleDelay = Math.max(420, 780 - score * 36);
    clearTimeout(hideT);
    hideT = setTimeout(function () {
      peng.classList.remove("up");
      scheduleNext(140);
    }, idleDelay);
  }

  function scheduleNext(delay) {
    clearTimeout(popT);
    if (!playing) return;
    popT = setTimeout(placePenguin, delay || (180 + Math.random() * 240));
  }

  peng.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    if (!playing || !peng.classList.contains("up")) return;
    score++;
    scoreEl.textContent = score;
    clearTimeout(hideT);
    peng.classList.remove("up");
    peng.classList.add("hit");
    setTimeout(function () { peng.classList.remove("hit"); }, 320);
    if (score >= TARGET) return win();
    scheduleNext(160);
  });

  function endRound(won) {
    playing = false;
    clearInterval(tickT);
    clearTimeout(popT);
    clearTimeout(hideT);
    peng.classList.remove("up");
    game.classList.remove("playing");
    btn.textContent = "PLAY AGAIN ↺";
    if (score > best) {
      best = score;
      bestEl.textContent = best;
      try { localStorage.setItem("pgBest", String(best)); } catch (e) {}
    }
    return won;
  }

  function win() {
    endRound(true);
    subEl.innerHTML = "🏆 you poked 10 penguins in " + (ROUND - timeLeft) + "s — the letter is yours!";
    subEl.classList.add("win");
    burst();
    setTimeout(openLetter, 900);
  }

  function lose() {
    endRound(false);
    subEl.textContent = "⏰ time's up — " + score + "/" + TARGET + " taps. So close, try again!";
    subEl.classList.remove("win");
  }

  function start() {
    if (playing) return;
    score = 0;
    timeLeft = ROUND;
    scoreEl.textContent = 0;
    timeEl.textContent = ROUND;
    subEl.classList.remove("win");
    subEl.textContent = "tap the penguin before he dives back in — score 10 to win 🧊";
    playing = true;
    game.classList.add("playing");
    btn.textContent = "PLAYING…";
    placePenguin();
    tickT = setInterval(function () {
      timeLeft--;
      timeEl.textContent = Math.max(0, timeLeft);
      if (timeLeft <= 0) lose();
    }, 1000);
  }

  btn.addEventListener("click", start);

  // already won earlier this session? keep the letter open for her
  var wasOpen = false;
  try { wasOpen = sessionStorage.getItem("letterUnlocked") === "1"; } catch (e) {}
  if (wasOpen) {
    if (letterPaper) letterPaper.classList.add("opened");
    if (subEl) { subEl.textContent = "letter unlocked — enjoy it! 💌"; subEl.classList.add("win"); }
    if (btn) btn.textContent = "PLAY AGAIN ↺";
  }

  // keep the penguin aligned with its hole if the screen rotates/resizes
  window.addEventListener("resize", function () {
    if (playing && peng.classList.contains("up")) {
      // re-place at a random hole (cheap — exact hole restore isn't worth the code)
      placePenguin();
    }
  }, { passive: true });
})();
