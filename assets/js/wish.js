/* ============================================================
   WISH page — "catch the birthday squad" mini-game
   Catch 🐧 🦋 🦆 → the wish unwraps itself.
   ============================================================ */
(function () {
  "use strict";

  var card = document.getElementById("msgCard");
  if (!card) return;

  var critters = Array.prototype.slice.call(document.querySelectorAll(".critter"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hdot"));
  var huntLine = document.getElementById("huntLine");
  var sealed = document.getElementById("msgSealed");
  var popEl = document.getElementById("catchPop");
  var confettiEl = document.getElementById("confetti");

  var total = critters.length;
  var caught = 0;
  var SHOUTS = {
    penguin:   "🐧 PHEEP! gadhi penguin caught!",
    butterfly: "🦋 caught! titli mil gayi ✨",
    duck:      "🦆 QUACK! duck down secured!"
  };

  function shout(text) {
    if (!popEl) return;
    popEl.textContent = text;
    popEl.classList.add("show");
    clearTimeout(popEl.__t);
    popEl.__t = setTimeout(function () { popEl.classList.remove("show"); }, 1800);
  }

  function burst(emoji) {
    if (!confettiEl) return;
    for (var i = 0; i < 7; i++) {
      var s = document.createElement("span");
      s.textContent = emoji;
      var ang = Math.random() * Math.PI * 2;
      var dist = 120 + Math.random() * 190;
      s.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      s.style.setProperty("--dy", (Math.sin(ang) * dist - 80) + "px");
      s.style.setProperty("--rot", (Math.random() * 520 - 260) + "deg");
      confettiEl.appendChild(s);
      (function (el) { setTimeout(function () { el.remove(); }, 1600); })(s);
    }
  }

  function openWish() {
    if (huntLine) {
      huntLine.textContent = "unwrapped — this one's just for you ♡";
      huntLine.classList.add("done");
    }
    if (sealed) sealed.classList.add("gone");
    card.classList.add("open");
    burst("🎁"); setTimeout(function () { burst("🐧"); }, 260); setTimeout(function () { burst("🦋"); }, 520);
    try { sessionStorage.setItem("wishUnlocked", "1"); } catch (e) {}
  }

  critters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.classList.contains("caught")) return;
      btn.classList.add("caught");
      caught++;
      var key = btn.id.replace("cr-", "");
      dots.forEach(function (d) { if (d.getAttribute("data-c") === key) d.classList.add("got"); });
      shout(SHOUTS[key] || "caught!");
      burst(key === "penguin" ? "🐧" : key === "butterfly" ? "🦋" : "🦆");
      if (caught >= total) setTimeout(openWish, 650);
      else if (huntLine) huntLine.innerHTML = "caught <b>" + caught + " / " + total + "</b> — keep hunting!";
    });
  });

  // already unlocked earlier this session? keep it open for her
  var wasOpen = false;
  try { wasOpen = sessionStorage.getItem("wishUnlocked") === "1"; } catch (e) {}
  if (wasOpen) {
    caught = total;
    critters.forEach(function (b) { b.classList.add("caught"); });
    dots.forEach(function (d) { d.classList.add("got"); });
    if (huntLine) { huntLine.textContent = "unwrapped — this one's just for you ♡"; huntLine.classList.add("done"); }
    if (sealed) sealed.classList.add("gone");
    card.classList.add("open");
  }
})();
