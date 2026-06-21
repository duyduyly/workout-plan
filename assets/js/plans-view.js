"use strict";

function createPlanCard(plan, index) {
  const days = isArray(plan.days) ? plan.days : [];
  const planId = encodeURIComponent(String(plan.id || ""));
  const safeName = escapeHtml(plan.name || "Untitled workout plan");
  const safeDescription = escapeHtml(plan.description || "No description provided.");

  return `
    <div class="col-12 col-md-6 col-xl-4">
      <article class="card plan-card">
        <div class="card-body">
          <span class="plan-number mb-3">Plan ${String(index + 1).padStart(2, "0")}</span>
          <h3 class="card-title">${safeName}</h3>
          <p class="card-text mb-4">${safeDescription}</p>
          <div class="day-count">
            <span>Training schedule</span>
            <span><strong>${days.length}</strong> ${days.length === 1 ? "day" : "days"}</span>
          </div>
          <a
            class="btn btn-dark w-100"
            href="./plan-detail.html?planId=${planId}"
          >
            Open detail
          </a>
        </div>
      </article>
    </div>
  `;
}

async function renderPlanList() {
  const planList = document.getElementById("plan-list");
  const statusPanel = document.getElementById("plan-status");

  if (!planList || !statusPanel) {
    return;
  }

  const plans = await loadWorkoutPlans();

  if (!plans.length) {
    statusPanel.innerHTML = `
      <div>
        <h3 class="h5 mb-2">No workout plans found</h3>
        <p class="mb-0">Check <code>data/workout-plans.json</code> and refresh the page.</p>
      </div>
    `;
    return;
  }

  planList.innerHTML = plans.map(createPlanCard).join("");
  statusPanel.hidden = true;
}

let activePlanWorkouts = new Map();

function createBadgeList(values) {
  if (!isArray(values) || !values.length) {
    return '<span class="muscle-badge">Not specified</span>';
  }

  return values
    .map((value) => `<span class="muscle-badge">${escapeHtml(value)}</span>`)
    .join("");
}

function createWorkoutItem(workout, exercise, dayIndex, workoutIndex) {
  const lookupId = `${dayIndex}-${workoutIndex}`;
  const exerciseInitial = String(exercise && exercise.name ? exercise.name : "E").charAt(0);
  activePlanWorkouts.set(lookupId, { workout, exercise });

  if (!exercise) {
    return `
      <article class="workout-item missing-workout">
        <div>
          <span class="badge text-bg-warning mb-2">Missing exercise reference</span>
          <h3 class="workout-name mb-2">${escapeHtml(workout.exerciseId || "Unknown exercise ID")}</h3>
          <p class="workout-note mb-0">${escapeHtml(workout.note || "This workout cannot be resolved from the exercise library.")}</p>
        </div>
        ${createWorkoutStats(workout)}
      </article>
    `;
  }

  return `
    <article class="workout-item">
      <div class="workout-overview">
        <div class="exercise-initial" aria-hidden="true">${escapeHtml(exerciseInitial)}</div>
        <div>
          <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
            <h3 class="workout-name mb-0">${escapeHtml(exercise.name || "Untitled exercise")}</h3>
            <span class="target-badge">${escapeHtml(exercise.mainTarget || "General")}</span>
          </div>
          <div class="muscle-list mb-3">${createBadgeList(exercise.muscleGroups)}</div>
          <p class="workout-note mb-0">${escapeHtml(workout.note || "No workout note provided.")}</p>
        </div>
      </div>
      <div class="workout-actions">
        ${createWorkoutStats(workout)}
        <button
          class="btn btn-dark view-workout-detail"
          type="button"
          data-workout-key="${lookupId}"
          data-bs-toggle="modal"
          data-bs-target="#workoutDetailModal"
        >
          View detail
        </button>
      </div>
    </article>
  `;
}

function createWorkoutStats(workout) {
  const stats = [
    ["Sets", workout.sets],
    ["Reps", workout.reps],
    ["Weight", workout.weight]
  ];

  return `
    <div class="workout-stats">
      ${stats.map(([label, value]) => `
        <div class="workout-stat">
          <span>${label}</span>
          <strong>${escapeHtml(value == null || value === "" ? "-" : value)}</strong>
        </div>
      `).join("")}
    </div>
  `;
}

function createWorkoutDay(day, dayIndex, exercises) {
  const workouts = isArray(day.workouts) ? day.workouts : [];
  const headingId = `day-heading-${dayIndex}`;
  const collapseId = `day-collapse-${dayIndex}`;
  const isFirstDay = dayIndex === 0;

  return `
    <div class="accordion-item workout-day-accordion">
      <h2 class="accordion-header" id="${headingId}">
        <button
          class="accordion-button${isFirstDay ? "" : " collapsed"}"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#${collapseId}"
          aria-expanded="${isFirstDay}"
          aria-controls="${collapseId}"
        >
          <span class="day-heading-copy">
            <strong>${escapeHtml(day.name || `Day ${dayIndex + 1}`)}</strong>
            <small>${escapeHtml(day.note || "No focus note provided.")}</small>
          </span>
          <span class="day-workout-count">${formatCount(workouts.length, "workout")}</span>
        </button>
      </h2>
      <div
        id="${collapseId}"
        class="accordion-collapse collapse${isFirstDay ? " show" : ""}"
        aria-labelledby="${headingId}"
        data-bs-parent="#planDaysAccordion"
      >
        <div class="accordion-body">
          ${workouts.length
            ? workouts.map((workout, workoutIndex) => {
              const exercise = exercises.find((item) => item.id === workout.exerciseId);
              return createWorkoutItem(workout, exercise, dayIndex, workoutIndex);
            }).join("")
            : '<div class="empty-day">No workouts are scheduled for this day.</div>'}
        </div>
      </div>
    </div>
  `;
}

function createYoutubeSection(exercise) {
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
      <a class="btn btn-outline-dark" href="${escapeAttribute(youtubeUrl)}" target="_blank" rel="noopener noreferrer">
        Open video tutorial
      </a>
    `;
  }

  return '<p class="empty-tutorial mb-0">No video tutorial is available.</p>';
}

function renderWorkoutModal(workout, exercise) {
  const modalTitle = document.getElementById("workoutDetailModalLabel");
  const modalBody = document.getElementById("workout-modal-body");

  if (!modalTitle || !modalBody || !exercise) {
    return;
  }

  modalTitle.textContent = exercise.name || "Exercise";
  modalBody.innerHTML = `
    <div class="row g-4 g-lg-5">
      <div class="col-lg-7">
        <section aria-labelledby="image-tutorial-heading">
          <h3 id="image-tutorial-heading" class="modal-section-title">Image tutorial</h3>
          <div id="exercise-story-slider"></div>
        </section>
      </div>
      <div class="col-lg-5">
        <p class="exercise-description">${escapeHtml(exercise.description || "No description provided.")}</p>
        <div class="detail-label">Main target</div>
        <p class="detail-value">${escapeHtml(exercise.mainTarget || "Not specified")}</p>
        <div class="detail-label">Muscle groups</div>
        <div class="muscle-list mb-4">${createBadgeList(exercise.muscleGroups)}</div>
        ${createWorkoutStats(workout)}
        <div class="workout-note-panel">
          <div class="detail-label">Workout note</div>
          <p class="mb-0">${escapeHtml(workout.note || "No workout note provided.")}</p>
        </div>
      </div>
    </div>
    <section class="video-section" aria-labelledby="video-tutorial-heading">
      <div class="detail-label mb-3" id="video-tutorial-heading">Video tutorial</div>
      ${createYoutubeSection(exercise)}
    </section>
  `;

  renderStorySlider(document.getElementById("exercise-story-slider"), exercise);
}

function showPlanError(message) {
  const heading = document.getElementById("plan-detail-heading");
  const status = document.getElementById("plan-detail-status");

  heading.innerHTML = `
    <p class="eyebrow mb-3">Workout plan</p>
    <h1 class="detail-title">Plan unavailable</h1>
    <p class="detail-description mb-0">${escapeHtml(message)}</p>
  `;
  status.innerHTML = `
    <div>
      <h2 class="h5 mb-3">We could not open this workout plan.</h2>
      <a class="btn btn-dark" href="./index.html">Back to home</a>
    </div>
  `;
}

async function renderPlanDetail() {
  const detailPage = document.getElementById("plan-detail-page");

  if (!detailPage) {
    return;
  }

  const planId = getQueryParam("planId");

  if (!planId) {
    showPlanError("The plan link is missing a planId query parameter.");
    return;
  }

  const [plans, exercises] = await Promise.all([loadWorkoutPlans(), loadExercises()]);
  const plan = plans.find((item) => item.id === planId);

  if (!plan) {
    showPlanError("The requested plan was not found in data/workout-plans.json.");
    return;
  }

  const days = isArray(plan.days) ? plan.days : [];
  const totalWorkouts = days.reduce((total, day) => {
    return total + (isArray(day.workouts) ? day.workouts.length : 0);
  }, 0);
  const heading = document.getElementById("plan-detail-heading");
  const summary = document.getElementById("plan-summary");
  const status = document.getElementById("plan-detail-status");
  const schedule = document.getElementById("plan-schedule");
  const accordion = document.getElementById("planDaysAccordion");

  activePlanWorkouts = new Map();

  document.title = `${plan.name || "Workout Plan"} | Form & Function`;
  heading.innerHTML = `
    <p class="eyebrow mb-3">Workout plan</p>
    <h1 class="detail-title">${escapeHtml(plan.name || "Untitled workout plan")}</h1>
    <p class="detail-description mb-0">${escapeHtml(plan.description || "No plan description provided.")}</p>
  `;
  summary.innerHTML = `
    <div class="summary-stat">
      <strong>${days.length}</strong>
      <span>${days.length === 1 ? "Training day" : "Training days"}</span>
    </div>
    <div class="summary-stat">
      <strong>${totalWorkouts}</strong>
      <span>${totalWorkouts === 1 ? "Workout" : "Workouts"}</span>
    </div>
  `;
  summary.hidden = false;
  accordion.innerHTML = days.length
    ? days.map((day, index) => createWorkoutDay(day, index, exercises)).join("")
    : '<div class="status-panel">This plan does not contain any training days.</div>';
  status.hidden = true;
  schedule.hidden = false;
}

document.addEventListener("click", (event) => {
  const button = event.target.closest(".view-workout-detail");

  if (!button) {
    return;
  }

  const selection = activePlanWorkouts.get(button.dataset.workoutKey);

  if (selection) {
    renderWorkoutModal(selection.workout, selection.exercise);
  }
});

document.addEventListener("DOMContentLoaded", renderPlanDetail);

document.getElementById("workoutDetailModal")?.addEventListener("hidden.bs.modal", (event) => {
  const carouselElement = event.currentTarget.querySelector(".carousel");

  if (carouselElement) {
    bootstrap.Carousel.getInstance(carouselElement)?.dispose();
  }
});
