document.addEventListener("DOMContentLoaded", function () {
  // --- Category Filtering ---
  var filterButtons = document.querySelectorAll(".gallery-filter__btn");
  var galleryCards = document.querySelectorAll(".gallery-card");

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      // Remove active class from all buttons
      filterButtons.forEach(function (btn) {
        btn.classList.remove("is-active");
      });
      // Add active class to clicked button
      this.classList.add("is-active");

      var filterValue = this.getAttribute("data-filter");

      galleryCards.forEach(function (card) {
        var category = card.getAttribute("data-category");

        if (filterValue === "all" || category === filterValue) {
          card.classList.remove("is-hidden");
          // Re-trigger scroll reveal styling if needed
          setTimeout(function () {
            card.classList.add("is-revealed");
          }, 50);
        } else {
          card.classList.add("is-hidden");
        }
      });
    });
  });

  // --- Lightbox Modal ---
  var lightbox = document.getElementById("gallery-lightbox");
  if (!lightbox) return;

  var lightboxClose = lightbox.querySelector(".lightbox__close");
  var lightboxPrev = lightbox.querySelector(".lightbox__prev");
  var lightboxNext = lightbox.querySelector(".lightbox__next");
  var lightboxContent = lightbox.querySelector(".lightbox__content-container");

  // Info Side Elements
  var infoCategory = lightbox.querySelector(".lightbox__info-category");
  var infoTitle = lightbox.querySelector(".lightbox__info-title");
  var infoDesc = lightbox.querySelector(".lightbox__info-desc");
  var ctaBtn = lightbox.querySelector(".lightbox__cta-btn");

  var currentMediaIndex = -1;
  var visibleCards = [];

  function updateVisibleCards() {
    visibleCards = Array.prototype.filter.call(galleryCards, function (card) {
      return !card.classList.contains("is-hidden");
    });
  }

  function getMediaUrlAndType(card) {
    var mediaLink = card.querySelector(".gallery-card__link");
    if (!mediaLink) return null;

    var url = mediaLink.getAttribute("href");
    var isVideo = url.toLowerCase().endsWith(".mp4");
    var category = card.querySelector(".gallery-card__category").textContent;
    var title = card.querySelector(".gallery-card__title").textContent;
    var desc = card.querySelector(".gallery-card__desc").textContent;

    return {
      url: url,
      isVideo: isVideo,
      category: category,
      title: title,
      desc: desc
    };
  }

  function openLightbox(index) {
    updateVisibleCards();
    currentMediaIndex = index;
    var card = visibleCards[currentMediaIndex];
    if (!card) return;

    var mediaInfo = getMediaUrlAndType(card);
    if (!mediaInfo) return;

    // Clear previous content
    lightboxContent.innerHTML = "";

    // Set Info Panels
    if (infoCategory) infoCategory.textContent = mediaInfo.category;
    if (infoTitle) infoTitle.textContent = mediaInfo.title;
    if (infoDesc) infoDesc.textContent = mediaInfo.desc;
    if (ctaBtn) {
      ctaBtn.setAttribute("href", "contact.html?product=" + encodeURIComponent(mediaInfo.title));
    }

    if (mediaInfo.isVideo) {
      var video = document.createElement("video");
      video.className = "lightbox__video";
      video.controls = true;
      video.autoplay = true;
      video.loop = true;
      video.playsInline = true;

      var source = document.createElement("source");
      source.src = mediaInfo.url;
      source.type = "video/mp4";

      video.appendChild(source);
      lightboxContent.appendChild(video);
    } else {
      var img = document.createElement("img");
      img.className = "lightbox__img";
      img.src = mediaInfo.url;
      img.alt = mediaInfo.title;
      lightboxContent.appendChild(img);
    }

    // Toggle navigation arrows visibility depending on count
    if (visibleCards.length <= 1) {
      if (lightboxPrev) lightboxPrev.style.display = "none";
      if (lightboxNext) lightboxNext.style.display = "none";
    } else {
      if (lightboxPrev) lightboxPrev.style.display = "";
      if (lightboxNext) lightboxNext.style.display = "";
    }

    lightbox.classList.add("is-active");
    document.body.style.overflow = "hidden"; // Prevent body scroll
  }

  function closeLightbox() {
    // Clear video to stop audio playing in background
    lightboxContent.innerHTML = "";
    lightbox.classList.remove("is-active");
    document.body.style.overflow = ""; // Restore body scroll
    currentMediaIndex = -1;
  }

  function navigateLightbox(direction) {
    if (visibleCards.length === 0) return;

    var nextIndex = currentMediaIndex + direction;
    if (nextIndex >= visibleCards.length) {
      nextIndex = 0; // Loop to start
    } else if (nextIndex < 0) {
      nextIndex = visibleCards.length - 1; // Loop to end
    }

    openLightbox(nextIndex);
  }

  // Event Listeners for Open
  galleryCards.forEach(function (card) {
    var link = card.querySelector(".gallery-card__link");
    if (!link) return;

    link.addEventListener("click", function (e) {
      e.preventDefault();
      updateVisibleCards();
      var cardIndex = visibleCards.indexOf(card);
      if (cardIndex !== -1) {
        openLightbox(cardIndex);
      }
    });
  });

  // Event Listeners for Controls
  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }
  if (lightboxPrev) {
    lightboxPrev.addEventListener("click", function () {
      navigateLightbox(-1);
    });
  }
  if (lightboxNext) {
    lightboxNext.addEventListener("click", function () {
      navigateLightbox(1);
    });
  }

  // Keyboard navigation
  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("is-active")) return;

    if (e.key === "Escape") {
      closeLightbox();
    } else if (e.key === "ArrowLeft") {
      navigateLightbox(-1);
    } else if (e.key === "ArrowRight") {
      navigateLightbox(1);
    }
  });

  // Click outside to close (on background backdrop)
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox || e.target.classList.contains("lightbox__container")) {
      closeLightbox();
    }
  });

  // --- Pre-filter from URL Hash ---
  var hash = window.location.hash.replace("#", "");
  if (hash) {
    var filterBtn = document.querySelector('.gallery-filter__btn[data-filter="' + hash + '"]');
    if (filterBtn) {
      // Small timeout to allow everything to mount cleanly
      setTimeout(function() {
        filterBtn.click();
        var contentSection = document.querySelector('.gallery-content');
        if (contentSection) {
          contentSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }
});

