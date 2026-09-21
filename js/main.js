/* Léa Akrour - portfolio.
   Mobile menu, scroll effects, scroll-spy, reveal. The page works without it. */
(function () {
  "use strict";

  var header   = document.querySelector(".site-header");
  var hero     = document.querySelector(".hero");
  var toggle   = document.querySelector(".nav-toggle");
  var nav      = document.querySelector(".nav");
  var backdrop = document.querySelector(".nav-backdrop");

  /* ---------- 1. Mobile menu ---------- */
  function setMenu(open) {
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    backdrop.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (toggle && nav && backdrop) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    backdrop.addEventListener("click", function () {
      setMenu(false);
      toggle.focus();
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
        setMenu(false);
        toggle.focus();
      }
    });

    // Keep in sync with the 900px nav breakpoint in css/styles.css.
    window.matchMedia("(min-width: 901px)").addEventListener("change", function (event) {
      if (event.matches) setMenu(false);
    });
  }

  /* ---------- 2. Scroll-driven effects ----------
     One handler for everything, throttled to one animation frame: scroll
     fires far more often than the screen refreshes. */
  var toTop    = document.querySelector(".to-top");
  var bar      = document.querySelector(".scroll-progress-bar");
  var heroWrap = document.querySelector(".hero-inner");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  var ticking = false;

  function clamp01(value) {
    return value < 0 ? 0 : value > 1 ? 1 : value;
  }

  function update() {
    ticking = false;

    var y = window.scrollY;
    var vh = window.innerHeight;

    if (header) header.classList.toggle("is-stuck", y > 8);

    if (toTop) toTop.classList.toggle("is-visible", y > vh * 1.2);

    if (hero) hero.classList.toggle("is-scrolled", y > 40);

    if (bar) {
      var scrollable = document.documentElement.scrollHeight - vh;
      bar.style.transform =
        "scaleX(" + (scrollable > 0 ? clamp01(y / scrollable).toFixed(4) : 0) + ")";
    }

    // Below is decoration only, so it is skipped and --hero-p stays at 0.
    if (reduceMotion.matches) return;

    if (heroWrap) {
      heroWrap.style.setProperty("--hero-p", clamp01(y / (vh * 0.85)).toFixed(4));
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();

  var canObserve = "IntersectionObserver" in window;

  /* ---------- 3. Scroll-spy ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-list a"));

  if (canObserve && navLinks.length) {
    var linkFor = {};
    var sections = [];

    navLinks.forEach(function (link) {
      var id = link.getAttribute("href").slice(1);
      var section = document.getElementById(id);
      if (section) {
        linkFor[id] = link;
        sections.push(section);
      }
    });

    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = linkFor[entry.target.id];
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach(function (other) { other.classList.remove("is-active"); });
            link.classList.add("is-active");
          }
        });
      },
      // Fires when a section crosses the middle band of the viewport.
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach(function (section) { spy.observe(section); });
  }

  /* ---------- 4. Reveal on scroll ---------- */
  var targets = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));

  if (canObserve && targets.length) {
    // Set from JS, so the content stays visible if this file never runs.
    document.documentElement.classList.add("js-reveal");

    var reveal = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    targets.forEach(function (target) { reveal.observe(target); });
  }
})();
