"use strict";

let exerciseLibrary = [];
let exercisesById = new Map();

function createExerciseBadges(values) {
  if (!isArray(values) || !values.length) {
    return '<span class="muscle-badge">Not specified</span>';
  }

  return values
    .map((value) => `<span class="muscle-badge">${escapeHtml(value)}</span>`)
    .join("");
}

function createExerciseCard(exercise) {
  const images = isArray(exercise.images)
    ? exercise.images.filter((image) => typeof image === "string" && image.trim())
    : [];
  const hasVideo = Boolean(getYoutubeEmbedUrl(exercise.youtubeUrl));
  const exerciseId = escapeAttribute(exercise.id || "");
  const exerciseInitial = String(exercise.name || "E").charAt(0);

  return `
    <div class="col-12 col-md-6 col-xl-4">
      <article class="exercise-card">
        <div class="exercise-card-top">
          <div class="exercise-card-initial" aria-hidden="true">${escapeHtml(exerciseInitial)}</div>
          <span class="target-badge">${escapeHtml(exercise.mainTarget || "General")}</span>
        </div>
        <div class="exercise-card-body">
          <h3>${escapeHtml(exercise.name || "Untitled exercise")}</h3>
          <p>${escapeHtml(exercise.description || "No description provided.")}</p>
          <div class="muscle-list">${createExerciseBadges(exercise.muscleGroups)}</div>
        </div>
        <div class="exercise-card-footer">
          <div class="media-summary" aria-label="Tutorial media availability">
            <span>${formatCount(images.length, "image")}</span>
            <span class="${hasVideo ? "has-media" : ""}">${hasVideo ? "Video available" : "No video"}</span>
          </div>
          <button
            class="btn btn-dark w-100 view-exercise-detail"
            type="button"
            data-exercise-id="${exerciseId}"
            data-bs-toggle="modal"
            data-bs-target="#exerciseDetailModal"
          >
            View detail
          </button>
        </div>
      </article>
    </div>
  `;
}

function createExerciseYoutubeSection(exercise) {
  const youtubeUrl = exercise.youtubeUrl || "";
  const embedUrl = getYoutubeEmbedUrl(youtubeUrl);

  if (embedUrl) {
    return `
      <div class="ratio ratio-16x9 tutorial-video">
        <iframe
          src="${escapeAttribute(embedUrl)}"
          title="${escapeAttribute(`${exercise.name || "Exercise"} video tutorial`)}"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    `;
  }

  if (youtubeUrl) {
    return `
      <a
        class="btn btn-outline-dark"
        href="${escapeAttribute(youtubeUrl)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open video tutorial
      </a>
    `;
  }

  return '<p class="empty-tutorial mb-0">No video tutorial is available.</p>';
}

function renderExerciseDetail(exercise) {
  const modalTitle = document.getElementById("exerciseDetailModalLabel");
  const modalBody = document.getElementById("exercise-modal-body");

  if (!modalTitle || !modalBody || !exercise) {
    return;
  }

  modalTitle.textContent = exercise.name || "Exercise";
  modalBody.innerHTML = `
    <div class="row g-4 g-lg-5">
      <div class="col-lg-7">
        <section aria-labelledby="exercise-images-heading">
          <h3 id="exercise-images-heading" class="modal-section-title">Image tutorial</h3>
          <div id="library-story-slider"></div>
        </section>
      </div>
      <div class="col-lg-5">
        <p class="exercise-description">${escapeHtml(exercise.description || "No description provided.")}</p>
        <div class="detail-label">Main target</div>
        <p class="detail-value">${escapeHtml(exercise.mainTarget || "Not specified")}</p>
        <div class="detail-label">Muscle groups</div>
        <div class="muscle-list">${createExerciseBadges(exercise.muscleGroups)}</div>
        <div class="exercise-id-panel">
          <div class="detail-label">Exercise ID</div>
          <code>${escapeHtml(exercise.id || "Not specified")}</code>
        </div>
      </div>
    </div>
    <section class="video-section" aria-labelledby="exercise-video-heading">
      <div class="detail-label mb-3" id="exercise-video-heading">Video tutorial</div>
      ${createExerciseYoutubeSection(exercise)}
    </section>
  `;

  renderStorySlider(document.getElementById("library-story-slider"), exercise);
}

function buildMuscleGroupOptions(exercises) {
  const filter = document.getElementById("muscle-group-filter");

  if (!filter) {
    return;
  }

  const muscleGroups = [...new Set(exercises.flatMap((exercise) => {
    return isArray(exercise.muscleGroups) ? exercise.muscleGroups : [];
  }))]
    .filter((group) => typeof group === "string" && group.trim())
    .sort((first, second) => first.localeCompare(second));

  filter.insertAdjacentHTML(
    "beforeend",
    muscleGroups.map((group) => {
      return `<option value="${escapeAttribute(group)}">${escapeHtml(group)}</option>`;
    }).join("")
  );
}

function getFilteredExercises() {
  const searchValue = document.getElementById("exercise-search").value.trim().toLocaleLowerCase();
  const muscleGroup = document.getElementById("muscle-group-filter").value;

  return exerciseLibrary.filter((exercise) => {
    const searchableValues = [
      exercise.name,
      exercise.id,
      exercise.mainTarget,
      ...(isArray(exercise.muscleGroups) ? exercise.muscleGroups : [])
    ]
      .filter(Boolean)
      .map((value) => String(value).toLocaleLowerCase());
    const matchesSearch = !searchValue || searchableValues.some((value) => value.includes(searchValue));
    const matchesMuscleGroup = !muscleGroup
      || (isArray(exercise.muscleGroups) && exercise.muscleGroups.includes(muscleGroup));

    return matchesSearch && matchesMuscleGroup;
  });
}

function renderExerciseList() {
  const exerciseList = document.getElementById("exercise-list");
  const status = document.getElementById("exercise-status");
  const resultCount = document.getElementById("exercise-result-count");

  if (!exerciseList || !status || !resultCount) {
    return;
  }

  const filteredExercises = getFilteredExercises();
  resultCount.textContent = formatCount(filteredExercises.length, "exercise");

  if (!filteredExercises.length) {
    exerciseList.innerHTML = "";
    status.hidden = false;
    status.innerHTML = `
      <div>
        <h3 class="h5 mb-2">No exercises found</h3>
        <p class="mb-0">Try another name or choose a different muscle group.</p>
      </div>
    `;
    return;
  }

  exerciseList.innerHTML = filteredExercises.map(createExerciseCard).join("");
  status.hidden = true;
}

function clearExerciseFilters() {
  document.getElementById("exercise-search").value = "";
  document.getElementById("muscle-group-filter").value = "";
  renderExerciseList();
  document.getElementById("exercise-search").focus();
}

async function initializeExerciseLibrary() {
  if (!document.getElementById("exercises-page")) {
    return;
  }

  exerciseLibrary = await loadExercises();
  exercisesById = new Map(exerciseLibrary.map((exercise) => [String(exercise.id), exercise]));

  buildMuscleGroupOptions(exerciseLibrary);
  renderExerciseList();

  document.getElementById("exercise-search").addEventListener("input", renderExerciseList);
  document.getElementById("muscle-group-filter").addEventListener("change", renderExerciseList);
  document.getElementById("clear-exercise-filters").addEventListener("click", clearExerciseFilters);
}

document.addEventListener("click", (event) => {
  const detailButton = event.target.closest(".view-exercise-detail");

  if (!detailButton) {
    return;
  }

  renderExerciseDetail(exercisesById.get(detailButton.dataset.exerciseId));
});

document.addEventListener("DOMContentLoaded", initializeExerciseLibrary);

document.getElementById("exerciseDetailModal")?.addEventListener("hidden.bs.modal", (event) => {
  const carouselElement = event.currentTarget.querySelector(".carousel");

  if (carouselElement) {
    bootstrap.Carousel.getInstance(carouselElement)?.dispose();
  }
});
