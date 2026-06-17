(function () {
  function loadIncludes() {
    var includeNodes = document.querySelectorAll("[data-include]");

    if (!includeNodes.length) {
      initSiteHeader();
      return Promise.resolve();
    }

    var tasks = Array.prototype.map.call(includeNodes, function (node) {
      var url = node.getAttribute("data-include");

      return fetch(url)
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Unable to load " + url);
          }
          return response.text();
        })
        .then(function (html) {
          node.outerHTML = html;
        })
        .catch(function (error) {
          console.error(error);
        });
    });

    return Promise.all(tasks).then(function () {
      initSiteHeader();
    });
  }

  function setActiveNavigation() {
    var currentPage = window.location.pathname.split("/").pop() || "index.html";
    var currentHash = window.location.hash || "";
    var links = document.querySelectorAll(".site-nav__link, .site-more__link");

    links.forEach(function (link) {
      var href = link.getAttribute("href") || "";
      var linkPage = href.split("#")[0] || "index.html";
      var linkHash = href.includes("#") ? "#" + href.split("#")[1] : "";

      var isActive = false;

      // Determine if current link matches current page
      if (currentPage === linkPage) {
        if (linkHash === "") {
          isActive = (currentHash === "" || currentHash === "#top");
        } else {
          isActive = (currentHash === linkHash);
        }
      }

      // Special case: If we are on a sub-product page, the main "Products" link should be active
      var productSubPages = [
        "products.html",
        "metal-bellows.html",
        "fabric-joints.html",
        "rubber-joints.html",
        "pressure-balance.html",
        "dismantling-joints.html",
        "dampers.html"
      ];
      if (productSubPages.indexOf(currentPage) !== -1 && linkPage === "products.html") {
        isActive = true;
      }

      link.classList.toggle("site-nav__link--active", isActive && link.classList.contains("site-nav__link"));
      if (isActive && link.classList.contains("site-nav__link")) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  // Update on hash change (e.g. clicking Products, Applications)
  window.addEventListener("hashchange", setActiveNavigation);

  function initSiteHeader() {
    setActiveNavigation();

    var header = document.querySelector(".site-header");
    var toggle = document.getElementById("site-menu-toggle");
    var nav = document.getElementById("site-nav");
    var moreNav = document.getElementById("site-more-nav");
    if (!header || !toggle || !nav || !moreNav) return;

    function isNarrow() {
      return window.matchMedia("(max-width: 1024px)").matches;
    }

    function syncAriaAndBody() {
      var mobileOpen = header.classList.contains("is-menu-open");
      var desktopMore = !isNarrow() && header.classList.contains("is-more-open");
      var expanded = mobileOpen || desktopMore;
      toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
      document.body.classList.toggle("is-site-nav-open", mobileOpen && isNarrow());
    }

    function closeAll() {
      header.classList.remove("is-menu-open");
      header.classList.remove("is-more-open");
      moreNav.hidden = true;
      syncAriaAndBody();
    }

    toggle.addEventListener("click", function () {
      if (isNarrow()) {
        header.classList.toggle("is-menu-open");
        header.classList.remove("is-more-open");
        moreNav.hidden = true;
      } else {
        header.classList.toggle("is-more-open");
        moreNav.hidden = !header.classList.contains("is-more-open");
        header.classList.remove("is-menu-open");
      }
      syncAriaAndBody();
    });

    // Mobile Sub-menu Toggle
    var dropdownIcons = document.querySelectorAll(".site-nav__dropdown-icon");
    dropdownIcons.forEach(function(icon) {
      icon.addEventListener("click", function(e) {
        if (isNarrow()) {
          e.preventDefault();
          e.stopPropagation();
          var parentItem = this.closest(".site-nav__item");
          parentItem.classList.toggle("is-dropdown-open");
        }
      });
    });

    // Mobile Sub-dropdown Toggle
    var subDropdownToggles = document.querySelectorAll(".site-nav__sub-dropdown-toggle");
    subDropdownToggles.forEach(function(toggleIcon) {
      toggleIcon.addEventListener("click", function(e) {
        if (isNarrow()) {
          e.preventDefault();
          e.stopPropagation();
          var parentItem = this.closest(".site-nav__dropdown-item");
          parentItem.classList.toggle("is-sub-dropdown-open");
        }
      });
    });

    document.addEventListener("click", function (e) {
      var t = e.target;
      if (toggle.contains(t) || moreNav.contains(t)) return;
      if (isNarrow() && nav.contains(t)) return;
      closeAll();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAll();
    });

    window.addEventListener("resize", function () {
      if (!isNarrow()) header.classList.remove("is-menu-open");
      else header.classList.remove("is-more-open");
      moreNav.hidden = true;
      syncAriaAndBody();
    });
  }

  loadIncludes();
})();

/* Hero Product Slider */
(function () {
  var slides = document.querySelectorAll(".hero__slide");
  var prevBtn = document.querySelector(".hero__nav-btn--prev");
  var nextBtn = document.querySelector(".hero__nav-btn--next");
  var countCurrent = document.querySelector(".hero__count-current");
  var sliderTitle = document.querySelector(".hero__slider-title");
  var typeItems = document.querySelectorAll(".hero__type-item");

  if (!slides.length || !prevBtn || !nextBtn) return;

  var current = 0;
  var total = slides.length;
  var isAnimating = false;
  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function goTo(index, direction) {
    if (isAnimating || index === current) return;
    isAnimating = true;

    var oldSlide = slides[current];
    var newIndex = (index + total) % total;
    var newSlide = slides[newIndex];

    // Direction: 'next' = old exits left, new enters from right
    //            'prev' = old exits right, new enters from left
    var exitClass = direction === "next" ? "is-exiting-left" : "is-exiting-right";
    var enterClass = direction === "next" ? "is-entering-right" : "is-entering-left";

    // Position new slide off-screen instantly
    newSlide.style.transition = "none";
    newSlide.classList.remove("is-active", "is-exiting-left", "is-exiting-right");
    newSlide.classList.add(enterClass);

    // Use requestAnimationFrame for smoother timing
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        // Re-enable transitions
        newSlide.style.transition = "";

        // Animate old slide out
        oldSlide.classList.remove("is-active");
        oldSlide.classList.add(exitClass);

        // Animate new slide in
        newSlide.classList.remove(enterClass);
        newSlide.classList.add("is-active");
      });
    });

    // Update sidebar
    if (typeItems[current]) typeItems[current].classList.remove("is-active");
    if (typeItems[newIndex]) typeItems[newIndex].classList.add("is-active");

    // Update counter & title
    if (countCurrent) countCurrent.textContent = pad(newIndex + 1);
    if (sliderTitle) sliderTitle.textContent = newSlide.dataset.title;

    current = newIndex;

    // Clean up after animation
    setTimeout(function () {
      oldSlide.classList.remove(exitClass);
      isAnimating = false;
    }, 850);
  }

  prevBtn.addEventListener("click", function () {
    goTo(current - 1, "prev");
  });

  nextBtn.addEventListener("click", function () {
    goTo(current + 1, "next");
  });

  typeItems.forEach(function (item, i) {
    item.style.cursor = "pointer";
    item.addEventListener("click", function () {
      var dir = i > current ? "next" : "prev";
      goTo(i, dir);
    });
  });
})();

/* Scroll Reveal Animation */
(function () {
  var revealElements = document.querySelectorAll('.reveal-on-scroll, .about__content > *, .about__stat');

  if (!revealElements.length) return;

  var observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(function (el) {
    el.classList.add('reveal-on-scroll');
    observer.observe(el);
  });
})();
