/* ============================================================
   PHOTOS page — "DUCK CHASE" unlock
   Ducks swim across the pond; tap one mid-swim.
   Catch 5 in 30s → the gallery opens.
   Mobile-first: CSS animations do the swimming, JS only
   spawns and scores — no canvas, no game loop.
   ============================================================ */
(function () {
  "use strict";

  var game = document.getElementById("dgame");
  if (!game) return;

  var pond = document.getElementById("pond");
  var duck = document.getElementById("duck");
  var scoreEl = document.getElementById("dkScore");
  var timeEl = document.getElementById("dkTime");
  var bestEl = document.getElementById("dkBest");
  var sub = document.getElementById("duckSub");
  var btn = document.getElementById("dkBtn");
  var zone = document.getElementById("galleryZone");
  var conf = document.getElementById("dkConf");

  var TARGET = 5, ROUND = 30;
  var score = 0, timeLeft = ROUND, best = 0;
  var playing = false, waiting = false, dirFlip = false;
  var tickT = null, respawnT = null;

  try { best = parseInt(localStorage.getItem("dkBest") || "0", 10) || 0; } catch (e) {}
  bestEl.textContent = best;

  function burst() {
    if (!conf) return;
    for (var i = 0; i < 7; i++) {
      var s = document.createElement("span");
      s.textContent = ["🦆", "💛", "🌊", "✨"][i % 4];
      var ang = Math.random() * Math.PI * 2;
      var dist = 90 + Math.random() * 150;
      s.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      s.style.setProperty("--dy", (Math.sin(ang) * dist - 60) + "px");
      s.style.setProperty("--rot", (Math.random() * 400 - 200) + "deg");
      conf.appendChild(s);
      (function (el) { setTimeout(function () { el.remove(); }, 1500); })(s);
    }
  }

  function spawnDuck() {
    if (!playing || !duck) return;
    waiting = false;
    duck.classList.remove("hiding");
    duck.classList.remove("swim-r", "swim-l");
    void duck.offsetWidth;                       // restart the CSS animation
    // pond width drives the swim distance (transform-based = smooth)
    duck.style.setProperty("--pw", pond.clientWidth + "px");
    var dur = Math.max(1.1, 2.1 - score * 0.16 - Math.random() * 0.4);
    duck.style.setProperty("--dur", dur + "s");
    duck.style.top = (14 + Math.random() * 52) + "%";
    dirFlip = !dirFlip;
    duck.classList.add(dirFlip ? "swim-r" : "swim-l");
    duck.style.visibility = "visible";
  }

  function missed() {
    // swam off-screen without being caught — give her a fresh duck shortly
    if (!playing || waiting) return;
    waiting = true;
    duck.classList.remove("swim-r", "swim-l");
    clearTimeout(respawnT);
    respawnT = setTimeout(spawnDuck, 320);
  }

  function caught() {
    if (!playing || waiting || !duck.classList.contains("swim-r") && !duck.classList.contains("swim-l")) return;
    score++;
    scoreEl.textContent = score;
    duck.classList.remove("swim-r", "swim-l");
    duck.classList.add("hiding");                // pops out of existence
    burst();
    if (sub) sub.innerHTML = "caught <b>" + score + "/" + TARGET + "</b> — " + (TARGET - score) + " more to go! 🦆";
    if (score >= TARGET) { win(); return; }
    waiting = true;
    clearTimeout(respawnT);
    respawnT = setTimeout(spawnDuck, 300);
  }

  function endRound() {
    playing = false;
    clearInterval(tickT);
    clearTimeout(respawnT);
    if (duck) duck.classList.remove("swim-r", "swim-l", "hiding");
    game.classList.remove("playing");
    if (btn) btn.textContent = "PLAY AGAIN ↺";
    if (score > best) {
      best = score;
      bestEl.textContent = best;
      try { localStorage.setItem("dkBest", String(best)); } catch (e) {}
    }
  }

  function openGallery() {
    if (zone) zone.classList.add("opened");
    if (sub) {
      sub.innerHTML = "🎉 gallery unlocked — see your photos and adore yourself! ✨";
      sub.classList.add("win");
    }
    try { sessionStorage.setItem("photosUnlocked", "1"); } catch (e) {}
    if (zone) zone.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function win() {
    endRound();
    burst();
    setTimeout(openGallery, 700);
  }

  function lose() {
    endRound();
    if (sub) {
      sub.textContent = "⏰ time's up — " + score + "/" + TARGET + " caught. The ducks are teasing you, try again!";
      sub.classList.remove("win");
    }
  }

  function start() {
    if (playing) return;
    score = 0;
    timeLeft = ROUND;
    scoreEl.textContent = 0;
    timeEl.textContent = ROUND;
    if (sub) {
      sub.classList.remove("win");
      sub.innerHTML = "tap them <b>mid-swim</b> — catch " + TARGET + " before the timer runs out 🦆";
    }
    playing = true;
    game.classList.add("playing");
    if (btn) btn.textContent = "CATCHING…";
    spawnDuck();
    tickT = setInterval(function () {
      timeLeft--;
      timeEl.textContent = Math.max(0, timeLeft);
      if (timeLeft <= 0) lose();
    }, 1000);
  }

  if (duck) {
    duck.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      caught();
    });
    duck.addEventListener("animationend", missed);
    duck.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  }
  if (btn) btn.addEventListener("click", start);

  // already unlocked earlier this session? keep the gallery open for her
  var wasOpen = false;
  try { wasOpen = sessionStorage.getItem("photosUnlocked") === "1"; } catch (e) {}
  if (wasOpen && zone) {
    zone.classList.add("opened");
    if (sub) { sub.innerHTML = "gallery unlocked — see your photos and adore yourself! ✨"; sub.classList.add("win"); }
    if (btn) btn.textContent = "PLAY AGAIN ↺";
  }
})();
