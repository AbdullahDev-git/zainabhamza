// ============================================================
// App — All logic for the Nikkah invitation
// ============================================================
(function () {
  "use strict";

  const CFG = window.INVITATION_CONFIG;

  // ---- State ----
  let isMuted = false;
  let audioStarted = false;
  let coverOpened = false;

  // ---- DOM refs ----
  const cover = document.getElementById("cover");
  const main = document.getElementById("main");
  const audio = document.getElementById("bg-audio");
  const musicBtn = document.getElementById("music-btn");
  const progressBar = document.getElementById("progress-bar");
  const tapText = document.getElementById("tap-text");
  const countdownTiles = {
    days: document.getElementById("cd-days"),
    hours: document.getElementById("cd-hours"),
    mins: document.getElementById("cd-mins"),
    secs: document.getElementById("cd-secs")
  };
  const countdownPassed = document.getElementById("countdown-passed");
  const countdownTilesWrap = document.getElementById("countdown-tiles");
  const calendarBtn = document.getElementById("calendar-btn");
  const calendarSheet = document.getElementById("calendar-sheet");
  const calendarOverlay = document.getElementById("calendar-overlay");
  const calendarClose = document.getElementById("calendar-close");

  // ---- Music ----
  // Loop handler: restart from offset when audio ends
  audio.addEventListener("ended", () => {
    if (CFG.music.startOffset) {
      audio.currentTime = CFG.music.startOffset;
    } else {
      audio.currentTime = 0;
    }
    audio.play().catch(() => {});
  });

  function startAudio() {
    if (audioStarted) return;
    audio.volume = CFG.music.volume || 0.8;
    // Start from offset (skip intro)
    if (CFG.music.startOffset) {
      audio.currentTime = CFG.music.startOffset;
    }
    const p = audio.play();
    if (p && typeof p.then === "function") {
      p.then(() => {
        audioStarted = true;
        isMuted = false;
        updateMusicBtn();
      }).catch(() => {});
    } else {
      audioStarted = true;
      updateMusicBtn();
    }
  }

  function updateMusicBtn() {
    if (!musicBtn) return;
    const icon = musicBtn.querySelector(".music-icon");
    const label = musicBtn.querySelector(".music-label");
    if (isMuted || audio.paused) {
      musicBtn.classList.add("muted");
      if (icon) {
        icon.innerHTML = '<line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>';
      }
      if (label) label.textContent = "Muted";
    } else {
      musicBtn.classList.remove("muted");
      if (icon) {
        icon.innerHTML = '<path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>';
      }
      if (label) label.textContent = "Pata Ni";
    }
  }

  function toggleMute() {
    if (audio.paused) {
      audio.play().catch(() => {});
      isMuted = false;
    } else {
      if (isMuted) {
        audio.volume = CFG.music.volume || 0.8;
        isMuted = false;
      } else {
        audio.volume = 0;
        isMuted = true;
      }
    }
    try { sessionStorage.setItem("muted", isMuted ? "1" : "0"); } catch (e) {}
    updateMusicBtn();
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (!audio.paused) audio.pause();
    } else {
      if (!isMuted && audioStarted) {
        audio.play().catch(() => {});
      }
    }
  });

  // ---- Cover / Book Opening ----
  let loadingDone = false;
  let tapQueued = false;

  function finishLoading() {
    loadingDone = true;
    if (progressBar) progressBar.style.width = "100%";
    if (tapText) tapText.classList.add("visible");
    if (tapQueued) openBook();
  }

  function openBook() {
    if (coverOpened) return;
    coverOpened = true;
    startAudio();
    const book = cover.querySelector(".cover-inner");
    if (book) book.classList.add("opening");
    const lightSpill = cover.querySelector(".light-spill");
    if (lightSpill) lightSpill.style.opacity = "1";
    setTimeout(() => {
      cover.classList.add("fade-out");
      setTimeout(() => {
        cover.style.display = "none";
        if (main) {
          main.classList.add("visible");
          initScrollReveal();
          initJali();
        }
      }, 800);
    }, 2400);
  }

  if (cover) {
    cover.addEventListener("click", () => {
      if (loadingDone) openBook();
      else tapQueued = true;
    });
  }

  // ---- Asset Loading ----
  function loadAssets() {
    const assets = [
      "logo.jpeg.png",
      "nikkah_signs.jpeg",
      "venue_image_3d.png"
    ];
    let loaded = 0;
    const total = assets.length;

    function onAssetLoad() {
      loaded++;
      const pct = (loaded / total) * 100;
      if (progressBar) progressBar.style.width = pct + "%";
      if (loaded >= total) finishLoading();
    }

    assets.forEach((src) => {
      const img = new Image();
      img.onload = onAssetLoad;
      img.onerror = onAssetLoad;
      img.src = src;
    });

    setTimeout(() => {
      if (!loadingDone) finishLoading();
    }, 4000);
  }

  // ---- Scroll Reveal ----
  function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          const children = entry.target.querySelectorAll(".reveal-child");
          children.forEach((child, i) => {
            setTimeout(() => child.classList.add("revealed"), i * 150);
          });
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
  }

  // ---- Jali Animation ----
  function initJali() {
    const jaliScreen = document.querySelector(".jali-screen");
    if (!jaliScreen) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          jaliScreen.classList.add("open");
          const coupleWrap = document.querySelector(".couple-wrap");
          if (coupleWrap) {
            for (let i = 0; i < 8; i++) {
              const sparkle = document.createElement("div");
              sparkle.className = "jali-sparkle";
              sparkle.style.left = (20 + Math.random() * 60) + "%";
              sparkle.style.top = (20 + Math.random() * 60) + "%";
              sparkle.style.animationDelay = (Math.random() * 0.5) + "s";
              coupleWrap.appendChild(sparkle);
            }
          }
        }
      });
    }, { threshold: 0.3 });
    observer.observe(jaliScreen);
  }

  // ---- Countdown ----
  function initCountdown() {
    const target = new Date(CFG.event.isoDate).getTime();

    if (Date.now() >= target) {
      if (countdownTilesWrap) countdownTilesWrap.style.display = "none";
      if (countdownPassed) countdownPassed.classList.add("visible");
      return;
    }

    let prev = { d: -1, h: -1, m: -1, s: -1 };

    function update() {
      const distance = target - Date.now();
      if (distance <= 0) {
        if (countdownTilesWrap) countdownTilesWrap.style.display = "none";
        if (countdownPassed) countdownPassed.classList.add("visible");
        return;
      }
      const d = Math.floor(distance / (1000 * 60 * 60 * 24));
      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      function setTile(el, val, prevVal) {
        if (!el) return;
        if (val !== prevVal) {
          el.textContent = String(val).padStart(2, "0");
          el.classList.add("roll");
          setTimeout(() => el.classList.remove("roll"), 400);
        }
      }

      setTile(countdownTiles.days, d, prev.d);
      setTile(countdownTiles.hours, h, prev.h);
      setTile(countdownTiles.mins, m, prev.m);
      setTile(countdownTiles.secs, s, prev.s);

      prev = { d, h, m, s };
    }

    update();
    setInterval(update, 1000);
  }

  // ---- Calendar ----
  function initCalendar() {
    if (!calendarBtn) return;
    calendarBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (calendarOverlay) calendarOverlay.classList.add("open");
      if (calendarSheet) calendarSheet.classList.add("open");
    });

    function closeSheet() {
      if (calendarOverlay) calendarOverlay.classList.remove("open");
      if (calendarSheet) calendarSheet.classList.remove("open");
    }

    if (calendarOverlay) calendarOverlay.addEventListener("click", closeSheet);
    if (calendarClose) calendarClose.addEventListener("click", closeSheet);

    const gcalBtn = document.getElementById("gcal-link");
    if (gcalBtn) {
      const start = new Date(CFG.event.isoDate);
      const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
      const fmt = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const params = new URLSearchParams({
        action: "TEMPLATE",
        text: "Nikkah of Zainab & Dr. Hamza",
        dates: fmt(start) + "/" + fmt(end),
        details: "Nikkah ceremony of Zainab Fiaz & Dr. Hamza Younas",
        location: CFG.event.venue + ", " + CFG.event.address
      });
      gcalBtn.href = "https://calendar.google.com/calendar/render?" + params.toString();
    }

    const icsBtn = document.getElementById("ics-link");
    if (icsBtn) {
      icsBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const start = new Date(CFG.event.isoDate);
        const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
        const fmt = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        const ics = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Nikkah Invitation//EN",
          "BEGIN:VEVENT",
          "UID:nikkah-20261121@invitation",
          "DTSTAMP:" + fmt(new Date()),
          "DTSTART:" + fmt(start),
          "DTEND:" + fmt(end),
          "SUMMARY:Nikkah of Zainab & Dr. Hamza",
          "LOCATION:" + CFG.event.venue + ", " + CFG.event.address,
          "DESCRIPTION:Nikkah ceremony of Zainab Fiaz & Dr. Hamza Younas",
          "END:VEVENT",
          "END:VCALENDAR"
        ].join("\r\n");
        const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Nikkah-Invitation.ics";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (calendarOverlay) calendarOverlay.classList.remove("open");
        if (calendarSheet) calendarSheet.classList.remove("open");
      });
    }
  }

  // ---- Floating Petals ----
  function initPetals() {
    const container = document.getElementById("petals");
    if (!container) return;
    const count = window.innerWidth < 768 ? 12 : 18;
    for (let i = 0; i < count; i++) {
      const petal = document.createElement("div");
      petal.className = "petal";
      petal.style.left = Math.random() * 100 + "vw";
      petal.style.animationDelay = Math.random() * 12 + "s";
      petal.style.animationDuration = (10 + Math.random() * 6) + "s";
      container.appendChild(petal);
    }
    document.addEventListener("visibilitychange", () => {
      const petals = container.querySelectorAll(".petal");
      petals.forEach((p) => {
        p.style.animationPlayState = document.hidden ? "paused" : "running";
      });
    });
  }

  // ---- Init ----
  function init() {
    try {
      const stored = sessionStorage.getItem("muted");
      if (stored === "1") isMuted = true;
    } catch (e) {}

    // Try to play immediately
    startAudio();

    // Try again when audio is ready
    audio.addEventListener("canplay", () => {
      if (!audioStarted) startAudio();
    }, { once: true });

    audio.addEventListener("loadeddata", () => {
      if (!audioStarted) startAudio();
    }, { once: true });

    // Also try on window load
    window.addEventListener("load", () => {
      if (!audioStarted) startAudio();
    });

    const gestureEvents = ["pointerup", "touchend", "click", "keydown"];
    function onGesture() {
      if (!audioStarted) startAudio();
      gestureEvents.forEach((ev) => document.removeEventListener(ev, onGesture, true));
    }
    gestureEvents.forEach((ev) => document.addEventListener(ev, onGesture, true));

    if (musicBtn) {
      musicBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleMute();
      });
    }

    loadAssets();
    initCountdown();
    initCalendar();
    initPetals();

    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
