"use strict";

let storySliderSequence = 0;

function updateStoryProgress(container, activeIndex) {
  container.querySelectorAll(".story-progress-fill").forEach((fill, index) => {
    fill.classList.remove("is-active");
    fill.style.width = index < activeIndex ? "100%" : "0%";

    if (index === activeIndex) {
      // Restart the animation even when returning to a previously viewed slide.
      void fill.offsetWidth;
      fill.classList.add("is-active");
    }
  });
}

function renderStorySlider(container, exercise) {
  if (!container) {
    return;
  }

  const images = isArray(exercise && exercise.images)
    ? exercise.images.filter((image) => typeof image === "string" && image.trim())
    : [];

  if (!images.length) {
    container.innerHTML = `
      <div class="story-placeholder">
        <span class="story-placeholder-mark" aria-hidden="true">F/F</span>
        <p class="mb-0">No tutorial images are available for this exercise.</p>
      </div>
    `;
    return;
  }

  storySliderSequence += 1;
  const carouselId = `exerciseStoryCarousel${storySliderSequence}`;
  const showNavigation = images.length > 1;

  container.innerHTML = `
    <div class="story-slider">
      ${showNavigation ? `
        <div class="story-progress" aria-hidden="true">
          ${images.map(() => '<span class="story-progress-track"><span class="story-progress-fill"></span></span>').join("")}
        </div>
      ` : ""}
      <div
        id="${carouselId}"
        class="carousel slide"
        data-bs-ride="${showNavigation ? "carousel" : "false"}"
        data-bs-interval="5000"
      >
        <div class="carousel-inner">
          ${images.map((image, index) => `
            <div class="carousel-item${index === 0 ? " active" : ""}" data-bs-interval="5000">
              <img
                src="${escapeAttribute(image)}"
                class="story-image d-block w-100"
                alt="${escapeAttribute(`${exercise.name || "Exercise"} tutorial step ${index + 1}`)}"
              />
            </div>
          `).join("")}
        </div>
        ${showNavigation ? `
          <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Previous image</span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Next image</span>
          </button>
        ` : ""}
      </div>
    </div>
  `;

  if (!showNavigation) {
    return;
  }

  const carouselElement = container.querySelector(`#${carouselId}`);
  updateStoryProgress(container, 0);
  carouselElement.addEventListener("slide.bs.carousel", (event) => {
    updateStoryProgress(container, event.to);
  });
}
