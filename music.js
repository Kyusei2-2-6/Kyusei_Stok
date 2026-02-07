/* =========================================================
   Kyusei - music.js (DIAGNOSTIC + GUARANTEED START BUTTON)
   Works with: <audio id="bgm"><source src="assets/music.mp3"></audio>

   What it fixes:
   1) Mobile autoplay block -> handled with first tap + fallback "Enable Sound" button.
   2) If audio file missing / 404 -> shows clear alert once.
   3) Rebind disc after SPA route swap.

   How to use:
   - Replace your existing ./music.js with this file.
   ========================================================= */

(function () {
  "use strict";

  var STORAGE = {
    playing: "bgm_playing",
    volume: "bgm_volume",
    time: "bgm_time",
    warned404: "bgm_warn_404"
  };

  var bgm = document.getElementById("bgm");
  if (!bgm) {
    console.warn("[music.js] ERROR: <audio id='bgm'> not found.");
    return;
  }

  function safeGet(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
  function safeSet(k,v){ try { localStorage.setItem(k,v); } catch(e){} }

  // --- Restore volume / time
  var savedVol = Number(safeGet(STORAGE.volume));
  bgm.volume = (!isNaN(savedVol)) ? Math.min(1, Math.max(0, savedVol)) : 0.2;

  var savedTime = Number(safeGet(STORAGE.time));
  if (!isNaN(savedTime) && savedTime > 0) { try { bgm.currentTime = savedTime; } catch(e){} }

  // --- Basic diagnostics
  bgm.addEventListener("error", function () {
    // Error codes: https://developer.mozilla.org/en-US/docs/Web/API/MediaError/code
    var src = "";
    try {
      var s = bgm.querySelector("source");
      src = s ? s.getAttribute("src") : (bgm.currentSrc || "");
    } catch(e){}

    // Show alert only once per browser (avoid spam)
    if (safeGet(STORAGE.warned404) !== "1") {
      safeSet(STORAGE.warned404, "1");
      alert(
        "Audio gagal dimuat.\n\n" +
        "Cek file music:\n" +
        "- Pastikan URL ini bisa dibuka:\n" +
        location.origin + location.pathname.replace(/\/[^\/]*$/, "/") + src + "\n\n" +
        "Kalau 404: nama/path file salah atau belum ke-push."
      );
    }
    console.warn("[music.js] audio error", bgm.error, "src:", src);
  });

  // Save state
  bgm.addEventListener("play", function () { safeSet(STORAGE.playing, "1"); setDiscState(true); hideEnableUI(); });
  bgm.addEventListener("pause", function () { safeSet(STORAGE.playing, "0"); setDiscState(false); });
  bgm.addEventListener("volumechange", function () { safeSet(STORAGE.volume, String(bgm.volume)); });

  var lastWrite = 0;
  bgm.addEventListener("timeupdate", function () {
    var now = Date.now();
    if (now - lastWrite < 2000) return;
    lastWrite = now;
    safeSet(STORAGE.time, String(Math.floor(bgm.currentTime || 0)));
  });

  // --- Disc binding
  function setDiscState(isPlaying) {
    var discs = document.querySelectorAll("#musicDisc");
    for (var i=0;i<discs.length;i++){
      if (isPlaying) discs[i].classList.add("playing");
      else discs[i].classList.remove("playing");
    }
  }

  function toggle() {
    if (bgm.paused) {
      bgm.play().then(function(){
        safeSet(STORAGE.playing, "1");
      }).catch(function(err){
        console.warn("[music.js] play blocked:", err);
        showEnableUI(); // fallback button
      });
    } else {
      bgm.pause();
      safeSet(STORAGE.playing, "0");
    }
  }

  function bindDisc(disc){
    if (!disc || disc.__bgmBound) return;
    disc.__bgmBound = true;
    disc.addEventListener("click", function(){ toggle(); });
  }

  function rebind(){
    var disc = document.getElementById("musicDisc");
    if (disc) bindDisc(disc);
    setDiscState(!bgm.paused);
  }

  // --- Enable Sound UI (fallback)
  var enableUI;

  function showEnableUI(){
    if (enableUI) return;
    enableUI = document.createElement("button");
    enableUI.type = "button";
    enableUI.textContent = "🔊 Tap untuk nyalakan musik";
    enableUI.style.position = "fixed";
    enableUI.style.left = "50%";
    enableUI.style.bottom = "76px";
    enableUI.style.transform = "translateX(-50%)";
    enableUI.style.zIndex = "99999";
    enableUI.style.padding = "10px 14px";
    enableUI.style.borderRadius = "999px";
    enableUI.style.border = "1px solid rgba(255,255,255,.18)";
    enableUI.style.background = "rgba(10,15,25,.85)";
    enableUI.style.color = "rgba(255,255,255,.92)";
    enableUI.style.backdropFilter = "blur(10px)";
    enableUI.style.boxShadow = "0 10px 28px rgba(0,0,0,.40)";
    enableUI.style.fontSize = "13px";
    enableUI.style.cursor = "pointer";

    enableUI.addEventListener("click", function(){
      bgm.play().then(function(){
        safeSet(STORAGE.playing, "1");
      }).catch(function(err){
        alert("Masih diblokir browser. Coba naikkan volume media / unmute, lalu tap lagi.");
        console.warn(err);
      });
    });

    document.body.appendChild(enableUI);
  }

  function hideEnableUI(){
    if (!enableUI) return;
    try { enableUI.remove(); } catch(e){}
    enableUI = null;
  }

  // --- Autostart on first user gesture (for first visit)
  var armed = true;
  function shouldAutoStart(){
    // If user explicitly paused earlier -> don't force.
    return safeGet(STORAGE.playing) !== "0";
  }

  function onFirstGesture(){
    if (!armed) return;
    armed = false;

    if (shouldAutoStart()) {
      bgm.play().then(function(){
        safeSet(STORAGE.playing, "1");
      }).catch(function(err){
        console.warn("[music.js] play blocked on first gesture:", err);
        showEnableUI();
      });
    }

    window.removeEventListener("pointerdown", onFirstGesture, true);
    window.removeEventListener("touchstart", onFirstGesture, true);
    window.removeEventListener("click", onFirstGesture, true);
    window.removeEventListener("keydown", onFirstGesture, true);
  }

  window.addEventListener("pointerdown", onFirstGesture, true);
  window.addEventListener("touchstart", onFirstGesture, true);
  window.addEventListener("click", onFirstGesture, true);
  window.addEventListener("keydown", onFirstGesture, true);

  // Resume if previously playing
  if (safeGet(STORAGE.playing) === "1") {
    bgm.play().catch(function(){ /* unlocked by gesture later */ });
  }

  // Expose for router
  window.__kyuseiMusic = {
    rebind: rebind,
    toggle: toggle,
    el: bgm
  };

  document.addEventListener("DOMContentLoaded", function(){
    rebind();
  });
})();
