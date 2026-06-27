"use strict";

let officialExercises = [];
let officialPlanIndex = [];
let exerciseDraft = [];
let workoutPlanDraft = null;
let workoutPlanIndexDraft = [];
let exerciseDraftActive = false;
let workoutPlanDraftActive = false;
let workoutPlanIndexDraftActive = false;
let quickCreateContext = null;

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function getCurrentExercises() {
  return exerciseDraftActive ? exerciseDraft : officialExercises;
}

function getCurrentPlan() {
  return workoutPlanDraftActive ? workoutPlanDraft : null;
}

function getCurrentPlanIndex() {
  return workoutPlanIndexDraftActive ? workoutPlanIndexDraft : officialPlanIndex;
}

function getExerciseOptionsForWorkoutEditor() {
  const options = new Map();
  officialExercises.forEach((exercise) => options.set(exercise.id, exercise));
  exerciseDraft.forEach((exercise) => options.set(exercise.id, exercise));
  return [...options.values()];
}

function filterExerciseOptions(query, exercises) {
  const normalizedQuery = String(query || "").trim().toLocaleLowerCase();
  if (!normalizedQuery) {
    return exercises;
  }

  return exercises.filter((exercise) => {
    return [
      exercise.name,
      exercise.id,
      exercise.mainTarget,
      ...(isArray(exercise.muscleGroups) ? exercise.muscleGroups : [])
    ]
      .filter(Boolean)
      .some((value) => String(value).toLocaleLowerCase().includes(normalizedQuery));
  });
}

function exerciseOptionLabel(exercise) {
  const muscles = isArray(exercise.muscleGroups) ? exercise.muscleGroups.join(", ") : "";
  return `${exercise.name} | ${exercise.id} | ${exercise.mainTarget} | ${muscles}`;
}

function renderExerciseSelector(selectedExerciseId, query) {
  const exercises = filterExerciseOptions(query, getExerciseOptionsForWorkoutEditor());
  const selectedExists = exercises.some((exercise) => exercise.id === selectedExerciseId);
  const selectedFallback = selectedExerciseId && !selectedExists
    ? `<option value="${escapeAttribute(selectedExerciseId)}" selected>Missing Reference | ${escapeHtml(selectedExerciseId)}</option>`
    : "";

  return `
    <option value="">Select an exercise</option>
    ${selectedFallback}
    ${exercises.map((exercise) => `
      <option value="${escapeAttribute(exercise.id)}"${exercise.id === selectedExerciseId ? " selected" : ""}>
        ${escapeHtml(exerciseOptionLabel(exercise))}
      </option>
    `).join("")}
  `;
}

function renderValidationMessages(result) {
  const hasMessages = result.errors.length || result.warnings.length;
  if (!hasMessages) {
    return '<div class="validation-ok">No validation issues found.</div>';
  }

  return `
    ${result.errors.length ? `
      <div class="validation-list validation-errors">
        <strong>${formatCount(result.errors.length, "error")}</strong>
        <ul>${result.errors.map((message) => `<li>${escapeHtml(message)}</li>`).join("")}</ul>
      </div>
    ` : ""}
    ${result.warnings.length ? `
      <div class="validation-list validation-warnings">
        <strong>${formatCount(result.warnings.length, "warning")}</strong>
        <ul>${result.warnings.map((message) => `<li>${escapeHtml(message)}</li>`).join("")}</ul>
      </div>
    ` : ""}
  `;
}

function renderExerciseDataPreview(exercises, validationResult) {
  const preview = document.getElementById("exercise-preview");
  if (!preview) return;

  const imageCount = exercises.reduce((total, exercise) => total + (isArray(exercise.images) ? exercise.images.length : 0), 0);
  const youtubeCount = exercises.filter((exercise) => isYoutubeUrl(exercise.youtubeUrl)).length;
  const mediaReadyCount = exercises.filter((exercise) => {
    return (isArray(exercise.images) && exercise.images.length) || isYoutubeUrl(exercise.youtubeUrl);
  }).length;

  preview.innerHTML = `
    <div class="manager-preview-shell">
      <div class="manager-preview-heading">
        <div>
          <p class="manager-panel-kicker mb-1">Draft summary</p>
          <h3 class="manager-panel-title mb-0">Exercise library readiness</h3>
        </div>
        <div class="manager-status-chips">
          <span class="manager-status-chip">${exerciseDraftActive ? "Draft active" : "Official only"}</span>
          <span class="manager-status-chip">${validationResult.errors.length ? "Needs fixes" : "Export ready"}</span>
        </div>
      </div>
    <div class="review-stats">
      <div><strong>${exercises.length}</strong><span>Exercises</span></div>
      <div><strong>${validationResult.duplicateIds.length}</strong><span>Duplicate IDs</span></div>
      <div><strong>${validationResult.duplicateNames.length}</strong><span>Duplicate names</span></div>
      <div><strong>${validationResult.invalidRows.length}</strong><span>Invalid rows</span></div>
      <div><strong>${imageCount}</strong><span>Images</span></div>
      <div><strong>${youtubeCount}</strong><span>YouTube links</span></div>
    </div>
    <div class="manager-health-row">
      <div class="manager-health-card">
        <span>Media coverage</span>
        <strong>${mediaReadyCount}</strong>
        <small>Exercises with at least one image or video</small>
      </div>
      <div class="manager-health-card">
        <span>Validation state</span>
        <strong>${validationResult.errors.length ? "Blocked" : "Ready"}</strong>
        <small>${validationResult.warnings.length ? `${validationResult.warnings.length} warning(s) still present` : "No blocking validation errors"}</small>
      </div>
    </div>
    ${renderValidationMessages(validationResult)}
    </div>
  `;
}

function renderWorkoutPlanDataPreview(plan, planValidation, indexValidation, indexDraft) {
  const preview = document.getElementById("plan-preview");
  if (!preview) return;

  preview.innerHTML = `
    <div class="manager-preview-shell">
      <div class="manager-preview-heading">
        <div>
          <p class="manager-panel-kicker mb-1">Draft summary</p>
          <h3 class="manager-panel-title mb-0">Plan and index readiness</h3>
        </div>
        <div class="manager-status-chips">
          <span class="manager-status-chip">${plan ? "Plan loaded" : "No plan loaded"}</span>
          <span class="manager-status-chip">${workoutPlanIndexDraftActive ? "Index draft active" : "Official index"}</span>
        </div>
      </div>
    <div class="review-stats">
      <div><strong>${plan ? 1 : 0}</strong><span>${plan ? "Plan" : "Plans"}</span></div>
      <div><strong>${planValidation.totalDays}</strong><span>Days</span></div>
      <div><strong>${planValidation.totalWorkouts}</strong><span>Workouts</span></div>
      <div><strong>${planValidation.missingReferences.length}</strong><span>Missing references</span></div>
      <div><strong>${planValidation.errors.length + indexValidation.errors.length}</strong><span>Errors</span></div>
      <div><strong>${indexDraft.length}</strong><span>Index items</span></div>
    </div>
    <div class="manager-health-row">
      <div class="manager-health-card">
        <span>Current plan file</span>
        <strong>${escapeHtml(plan?.id || "Pending")}</strong>
        <small>${plan?.id ? `Exports as ${escapeHtml(plan.id)}.json` : "Import a single plan JSON or CSV to start editing"}</small>
      </div>
      <div class="manager-health-card">
        <span>Index status</span>
        <strong>${indexValidation.errors.length ? "Blocked" : "Ready"}</strong>
        <small>${indexDraft.length ? `${indexDraft.length} tracked index item(s)` : "No index items available"}</small>
      </div>
    </div>
    ${renderValidationMessages({
      errors: [...planValidation.errors, ...indexValidation.errors],
      warnings: [...planValidation.warnings, ...indexValidation.warnings]
    })}
    </div>
  `;
}

function renderExerciseEditor(exercises) {
  const editor = document.getElementById("exercise-editor");
  if (!editor) return;

  if (!exerciseDraftActive) {
    editor.innerHTML = '<div class="editor-empty">Exercise draft cleared. Import a file or quick-create an exercise to start a new draft.</div>';
    return;
  }

  editor.innerHTML = exercises.length ? exercises.map((exercise, index) => `
    <article class="editor-card">
      <div class="editor-card-heading">
        <div><span>Exercise ${index + 1}</span><strong>${escapeHtml(exercise.name || "Untitled")}</strong></div>
        <div class="editor-heading-actions">
          <span class="target-badge">${escapeHtml(exercise.mainTarget || "No target")}</span>
          <button class="btn btn-sm btn-outline-dark review-exercise" type="button" data-exercise-index="${index}">
            Review
          </button>
        </div>
      </div>
      <div class="editor-card-meta">
        <span class="manager-status-chip">${escapeHtml(exercise.id || "No ID")}</span>
        <span class="manager-status-chip">${isArray(exercise.images) && exercise.images.length ? `${exercise.images.length} image(s)` : "No images"}</span>
        <span class="manager-status-chip">${isYoutubeUrl(exercise.youtubeUrl) ? "Video linked" : "No video"}</span>
      </div>
      <div class="row g-3">
        ${managerInput("ID", exercise.id, `exercise.${index}.id`)}
        ${managerInput("Name", exercise.name, `exercise.${index}.name`)}
        ${managerTextarea("Description", exercise.description, `exercise.${index}.description`, "col-12")}
        ${managerInput("Main target", exercise.mainTarget, `exercise.${index}.mainTarget`)}
        ${managerInput("Muscle groups (comma separated)", exercise.muscleGroups.join(", "), `exercise.${index}.muscleGroups`)}
        ${managerTextarea("Images (one per line)", exercise.images.join("\n"), `exercise.${index}.images`, "col-12")}
        ${managerInput("YouTube URL", exercise.youtubeUrl, `exercise.${index}.youtubeUrl`, "col-12")}
      </div>
    </article>
  `).join("") : '<div class="editor-empty">The exercise draft is empty.</div>';
}

function renderExerciseReview(exercise) {
  const modalTitle = document.getElementById("exerciseReviewModalLabel");
  const modalBody = document.getElementById("exercise-review-body");

  if (!modalTitle || !modalBody || !exercise) {
    return;
  }

  const embedUrl = getYoutubeEmbedUrl(exercise.youtubeUrl);
  const muscleGroups = isArray(exercise.muscleGroups) && exercise.muscleGroups.length
    ? exercise.muscleGroups.map((group) => `<span class="muscle-badge">${escapeHtml(group)}</span>`).join("")
    : '<span class="muscle-badge">Not specified</span>';
  const videoContent = embedUrl
    ? `
      <div class="ratio ratio-16x9 tutorial-video">
        <iframe
          src="${escapeAttribute(embedUrl)}"
          title="${escapeAttribute(`${exercise.name || "Exercise"} video tutorial`)}"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    `
    : exercise.youtubeUrl
      ? `<a class="btn btn-outline-dark" href="${escapeAttribute(exercise.youtubeUrl)}" target="_blank" rel="noopener noreferrer">Open video tutorial</a>`
      : '<p class="empty-tutorial mb-0">No video tutorial is available.</p>';

  modalTitle.textContent = exercise.name || "Untitled exercise";
  modalBody.innerHTML = `
    <div class="row g-4 g-lg-5">
      <div class="col-lg-7">
        <div id="manager-review-story"></div>
      </div>
      <div class="col-lg-5">
        <p class="exercise-description">${escapeHtml(exercise.description || "No description provided.")}</p>
        <div class="detail-label">Exercise ID</div>
        <p class="detail-value"><code>${escapeHtml(exercise.id || "Not specified")}</code></p>
        <div class="detail-label">Main target</div>
        <p class="detail-value">${escapeHtml(exercise.mainTarget || "Not specified")}</p>
        <div class="detail-label">Muscle groups</div>
        <div class="muscle-list">${muscleGroups}</div>
      </div>
    </div>
    <section class="video-section">
      <div class="detail-label mb-3">Video tutorial</div>
      ${videoContent}
    </section>
  `;

  renderStorySlider(document.getElementById("manager-review-story"), exercise);
}

function managerInput(label, value, path, columnClass) {
  return `
    <div class="${columnClass || "col-md-6"}">
      <label class="form-label">${escapeHtml(label)}</label>
      <input class="form-control manager-field" value="${escapeAttribute(value)}" data-path="${escapeAttribute(path)}" />
    </div>
  `;
}

function managerTextarea(label, value, path, columnClass) {
  return `
    <div class="${columnClass || "col-md-6"}">
      <label class="form-label">${escapeHtml(label)}</label>
      <textarea class="form-control manager-field" rows="2" data-path="${escapeAttribute(path)}">${escapeHtml(value)}</textarea>
    </div>
  `;
}

function renderWorkoutEditor(plan) {
  const editor = document.getElementById("plan-editor");
  if (!editor) return;

  if (!workoutPlanDraftActive || !plan) {
    editor.innerHTML = '<div class="editor-empty">Workout plan draft cleared. Import a plan JSON or CSV file to create a new draft. You can also import <code>workout-plans.index.json</code> to update the index draft only.</div>';
    return;
  }

  editor.innerHTML = `
    <article class="editor-card plan-editor-card">
      <div class="editor-card-heading">
        <div><span>Current plan</span><strong>${escapeHtml(plan.name || "Untitled")}</strong></div>
        <span>${formatCount(isArray(plan.days) ? plan.days.length : 0, "day")}</span>
      </div>
      <div class="editor-card-meta">
        <span class="manager-status-chip">${escapeHtml(plan.id || "No plan id")}</span>
        <span class="manager-status-chip">${formatCount(isArray(plan.days) ? plan.days.length : 0, "day")}</span>
        <span class="manager-status-chip">${plan.description ? "Description ready" : "Description missing"}</span>
      </div>
      <div class="row g-3">
        ${managerInput("Plan ID", plan.id, "plan.id")}
        ${managerInput("Plan name", plan.name, "plan.name")}
        ${managerTextarea("Description", plan.description, "plan.description", "col-12")}
      </div>
      <div class="day-editor-list">
        ${(isArray(plan.days) ? plan.days : []).map((day, dayIndex) => renderDayEditor(day, dayIndex)).join("")}
      </div>
    </article>
  `;
}

function renderDayEditor(day, dayIndex) {
  const workouts = isArray(day.workouts) ? day.workouts : [];

  return `
    <section class="day-editor">
      <div class="day-editor-heading"><strong>${escapeHtml(day.name || `Day ${dayIndex + 1}`)}</strong><span>${formatCount(workouts.length, "workout")}</span></div>
      <div class="editor-card-meta">
        <span class="manager-status-chip">${escapeHtml(day.id || `day_${dayIndex + 1}`)}</span>
        <span class="manager-status-chip">${day.note ? "Focus note ready" : "No focus note"}</span>
      </div>
      <div class="row g-3">
        ${managerInput("Day ID", day.id, `day.${dayIndex}.id`)}
        ${managerInput("Day name", day.name, `day.${dayIndex}.name`)}
        ${managerTextarea("Day note", day.note, `day.${dayIndex}.note`, "col-12")}
      </div>
      <div class="workout-editor-list">
        ${workouts.map((workout, workoutIndex) => renderWorkoutEditorItem(day, workout, dayIndex, workoutIndex)).join("")}
      </div>
    </section>
  `;
}

function renderWorkoutEditorItem(day, workout, dayIndex, workoutIndex) {
  const referenceExists = getExerciseOptionsForWorkoutEditor().some((exercise) => exercise.id === workout.exerciseId);
  const context = `${dayIndex}.${workoutIndex}`;

  return `
    <article class="workout-editor${referenceExists ? "" : " missing-reference"}">
      <div class="workout-editor-heading">
        <strong>${escapeHtml(workout.id || `Workout ${workoutIndex + 1}`)}</strong>
        <span class="${referenceExists ? "reference-ok" : "reference-missing"}">
          ${referenceExists ? "Reference valid" : "Missing Reference"}
        </span>
      </div>
      <div class="editor-card-meta">
        <span class="manager-status-chip">${escapeHtml(workout.exerciseId || "No exerciseId")}</span>
        <span class="manager-status-chip">${escapeHtml(workout.sets || "-")} sets</span>
        <span class="manager-status-chip">${escapeHtml(workout.reps || "-")} reps</span>
      </div>
      <div class="row g-3">
        ${managerInput("Workout ID", workout.id, `workout.${context}.id`)}
        <div class="col-md-6">
          <label class="form-label">Search exercise</label>
          <input class="form-control exercise-option-search" data-context="${context}" placeholder="Name, ID, target, muscle group" />
        </div>
        <div class="col-12">
          <label class="form-label">Exercise selector</label>
          <select class="form-select exercise-selector" data-context="${context}">
            ${renderExerciseSelector(workout.exerciseId, "")}
          </select>
          <div class="selector-actions">
            <button class="btn btn-sm btn-outline-dark quick-create-exercise" type="button"
              data-day-id="${escapeAttribute(day.id)}" data-workout-id="${escapeAttribute(workout.id)}" data-context="${context}">
              Create New Exercise
            </button>
          </div>
        </div>
        <div class="col-12">
          <details>
            <summary>Advanced: manual exerciseId</summary>
            <input class="form-control manager-field mt-2" value="${escapeAttribute(workout.exerciseId)}" data-path="workout.${context}.exerciseId" />
          </details>
        </div>
        ${managerInput("Sets", workout.sets, `workout.${context}.sets`, "col-6 col-lg-3")}
        ${managerInput("Reps", workout.reps, `workout.${context}.reps`, "col-6 col-lg-3")}
        ${managerInput("Weight", workout.weight, `workout.${context}.weight`, "col-6 col-lg-3")}
        ${managerInput("Note", workout.note, `workout.${context}.note`, "col-6 col-lg-3")}
      </div>
    </article>
  `;
}

function renderCombinedReview(exercises, plan, index) {
  const container = document.getElementById("combined-review");
  if (!container) return;

  const exerciseValidation = validateExercises(exercises);
  const planValidation = validateWorkoutPlan(plan, exercises);
  const indexValidation = validateWorkoutPlanIndex(index, plan);
  const totalReferences = planValidation.totalWorkouts;
  const validReferences = totalReferences - planValidation.missingReferences.length;

  container.innerHTML = `
    <div class="manager-preview-shell">
      <div class="manager-preview-heading">
        <div>
          <p class="manager-panel-kicker mb-1">Publish review</p>
          <h3 class="manager-panel-title mb-0">Cross-file validation status</h3>
        </div>
        <div class="manager-status-chips">
          <span class="manager-status-chip">${exerciseDraftActive ? "Exercise draft active" : "Official exercises"}</span>
          <span class="manager-status-chip">${workoutPlanDraftActive ? "Plan draft active" : "No plan draft"}</span>
        </div>
      </div>
    <div class="review-stats review-stats-large">
      <div><strong>${exercises.length}</strong><span>Current exercises</span></div>
      <div><strong>${plan ? 1 : 0}</strong><span>Current plan</span></div>
      <div><strong>${index.length}</strong><span>Index items</span></div>
      <div><strong>${totalReferences}</strong><span>Workout references</span></div>
      <div><strong>${validReferences}</strong><span>Valid references</span></div>
      <div><strong>${planValidation.missingReferences.length}</strong><span>Missing references</span></div>
    </div>
    <div class="combined-status ${exerciseValidation.errors.length || planValidation.errors.length || indexValidation.errors.length ? "has-errors" : "is-valid"}">
      ${exerciseValidation.errors.length || planValidation.errors.length || indexValidation.errors.length
        ? "Resolve validation errors before exporting production data."
        : "Combined exercise, plan, and index data are valid."}
    </div>
    </div>
  `;
}

function updatePlanExportLabels() {
  const planId = String(workoutPlanDraft?.id || "").trim();
  const exportLabel = planId ? `Export ${planId}.json` : "Export current plan JSON";

  document.querySelectorAll("#export-plans, [data-export=\"plans\"]").forEach((button) => {
    button.textContent = exportLabel;
  });
}

function refreshAll(options) {
  const settings = options || {};
  const exercises = getCurrentExercises();
  const plan = getCurrentPlan();
  const index = getCurrentPlanIndex();
  const exerciseValidation = validateExercises(exercises);
  const planValidation = validateWorkoutPlan(plan, exercises);
  const indexValidation = validateWorkoutPlanIndex(index, plan);

  renderExerciseDataPreview(exercises, exerciseValidation);
  renderWorkoutPlanDataPreview(plan, planValidation, indexValidation, index);
  renderCombinedReview(exercises, plan, index);
  updatePlanExportLabels();
  if (settings.editors !== false) {
    renderExerciseEditor(exerciseDraft);
    renderWorkoutEditor(workoutPlanDraft);
  }
}

function setByDataPath(path, value) {
  const parts = path.split(".");
  const type = parts[0];

  if (type === "exercise") {
    const exercise = exerciseDraft[Number(parts[1])];
    const key = parts[2];
    if (!exercise) return;
    exercise[key] = key === "muscleGroups"
      ? normalizeStringArray(value)
      : key === "images"
        ? String(value).split(/\r?\n/).map((item) => item.trim()).filter(Boolean).slice(0, 5)
        : value;
    exerciseDraftActive = true;
    return;
  }

  if (!workoutPlanDraft) {
    return;
  }

  if (type === "plan") {
    workoutPlanDraft[parts[1]] = value;
  } else if (type === "day") {
    workoutPlanDraft.days[Number(parts[1])][parts[2]] = value;
  } else if (type === "workout") {
    workoutPlanDraft.days[Number(parts[1])].workouts[Number(parts[2])][parts[3]] = value;
  }
  workoutPlanDraftActive = true;
}

function setWorkoutExerciseByContext(context, exerciseId) {
  const [dayIndex, workoutIndex] = context.split(".").map(Number);
  const workout = workoutPlanDraft?.days?.[dayIndex]?.workouts?.[workoutIndex];
  if (!workout) return;
  workout.exerciseId = exerciseId;
  workoutPlanDraftActive = true;
}

function setWorkoutExerciseId(dayId, workoutId, exerciseId) {
  const day = workoutPlanDraft?.days?.find((item) => item.id === dayId);
  const workout = day?.workouts?.find((item) => item.id === workoutId);
  if (!workout) return false;
  workout.exerciseId = exerciseId;
  workoutPlanDraftActive = true;
  return true;
}

function showManagerMessage(elementId, message, isError) {
  const element = document.getElementById(elementId);
  if (!element) return;
  element.className = `manager-message ${isError ? "message-error" : "message-success"}`;
  element.textContent = message;
}

function ensureIndexDraftEntry(plan) {
  if (!plan || !plan.id) {
    return null;
  }

  if (!workoutPlanIndexDraftActive) {
    workoutPlanIndexDraft = cloneData(officialPlanIndex).map(normalizeWorkoutPlanIndexItem);
    workoutPlanIndexDraftActive = true;
  }

  const existingIndex = workoutPlanIndexDraft.findIndex((item) => item.id === plan.id);
  const existingItem = existingIndex >= 0 ? workoutPlanIndexDraft[existingIndex] : officialPlanIndex.find((item) => item.id === plan.id);
  const nextItem = createPlanIndexItem(plan, existingItem);

  if (existingIndex >= 0) {
    workoutPlanIndexDraft.splice(existingIndex, 1, nextItem);
  } else {
    workoutPlanIndexDraft.push(nextItem);
  }

  return nextItem;
}

async function handleExerciseImport(file) {
  try {
    exerciseDraft = await importExerciseFile(file);
    exerciseDraftActive = true;
    showManagerMessage("exercise-import-message", `Imported ${formatCount(exerciseDraft.length, "exercise")}.`, false);
    refreshAll();
  } catch (error) {
    showManagerMessage("exercise-import-message", error.message, true);
  }
}

async function handlePlanImport(file) {
  try {
    if (file.name.toLowerCase() === "workout-plans.index.json") {
      workoutPlanIndexDraft = await importWorkoutPlanIndexFile(file);
      workoutPlanIndexDraftActive = true;
      showManagerMessage("plan-import-message", `Imported ${formatCount(workoutPlanIndexDraft.length, "index item")} from workout-plans.index.json.`, false);
      refreshAll();
      return;
    }

    workoutPlanDraft = await importWorkoutPlanFile(file);
    workoutPlanDraftActive = true;
    ensureIndexDraftEntry(workoutPlanDraft);
    const filename = workoutPlanDraft.id ? `${workoutPlanDraft.id}.json` : "plan JSON";
    showManagerMessage("plan-import-message", `Imported 1 plan. Current export target: ${filename}.`, false);
    refreshAll();
  } catch (error) {
    showManagerMessage("plan-import-message", error.message, true);
  }
}

function exportExercisesJson() {
  const exercises = getCurrentExercises().map(normalizeExercise);
  const validation = validateExercises(exercises);
  if (validation.errors.length) {
    showManagerMessage("exercise-import-message", "Exercise export blocked: resolve validation errors first.", true);
    return;
  }
  downloadFile("exercises.json", JSON.stringify(exercises, null, 2), "application/json");
}

function exportWorkoutPlanJson() {
  const plan = getCurrentPlan();
  if (!plan) {
    showManagerMessage("plan-import-message", "Workout plan export blocked: import or create a plan draft first.", true);
    return;
  }

  const normalizedPlan = normalizeWorkoutPlan(plan);
  const validation = validateWorkoutPlan(normalizedPlan, getCurrentExercises());
  if (validation.errors.length) {
    showManagerMessage("plan-import-message", "Workout plan export blocked: resolve validation errors first.", true);
    return;
  }
  if (!normalizedPlan.id) {
    showManagerMessage("plan-import-message", "Workout plan export blocked: plan id is required.", true);
    return;
  }

  ensureIndexDraftEntry(normalizedPlan);
  downloadFile(`${normalizedPlan.id}.json`, JSON.stringify(normalizedPlan, null, 2), "application/json");
}

function exportWorkoutPlanIndexJson() {
  const plan = getCurrentPlan();
  if (plan) {
    const normalizedPlan = normalizeWorkoutPlan(plan);
    const planValidation = validateWorkoutPlan(normalizedPlan, getCurrentExercises());
    if (planValidation.errors.length) {
      showManagerMessage("plan-import-message", "Workout plan index export blocked: resolve current plan validation errors first.", true);
      return;
    }
    if (!normalizedPlan.id) {
      showManagerMessage("plan-import-message", "Workout plan index export blocked: current plan id is required.", true);
      return;
    }
    ensureIndexDraftEntry(normalizedPlan);
  }

  const index = getCurrentPlanIndex().map(normalizeWorkoutPlanIndexItem);
  const indexValidation = validateWorkoutPlanIndex(index, plan ? normalizeWorkoutPlan(plan) : null);
  if (indexValidation.errors.length) {
    showManagerMessage("plan-import-message", "Workout plan index export blocked: resolve index validation errors first.", true);
    return;
  }

  downloadFile("workout-plans.index.json", JSON.stringify(index, null, 2), "application/json");
}

function clearExerciseDraft() {
  exerciseDraft = [];
  exerciseDraftActive = false;
  showManagerMessage("exercise-import-message", "Exercise draft cleared. Official JSON remains unchanged.", false);
  refreshAll();
}

function clearWorkoutPlanDraft() {
  workoutPlanDraft = null;
  workoutPlanDraftActive = false;
  showManagerMessage("plan-import-message", "Workout plan draft cleared. Index draft remains available for export.", false);
  refreshAll();
}

function openQuickCreateExerciseModal(context) {
  quickCreateContext = context;
  const form = document.getElementById("quick-create-form");
  form.reset();
  document.getElementById("quick-create-errors").innerHTML = "";
  bootstrap.Modal.getOrCreateInstance(document.getElementById("quickCreateExerciseModal")).show();
}

function createExerciseFromWorkoutEditor(formData) {
  const name = String(formData.get("name") || "").trim();
  return normalizeExercise({
    id: String(formData.get("id") || "").trim() || slugifyId(name, "ex_"),
    name,
    description: formData.get("description"),
    mainTarget: formData.get("mainTarget"),
    muscleGroups: formData.get("muscleGroups"),
    images: [1, 2, 3, 4, 5].map((number) => formData.get(`image${number}`)),
    youtubeUrl: formData.get("youtubeUrl")
  });
}

function addExerciseToDraft(exercise) {
  if (!exerciseDraftActive) {
    exerciseDraft = cloneData(officialExercises);
    exerciseDraftActive = true;
  }
  exerciseDraft.push(exercise);
}

function submitQuickCreate(form) {
  const exercise = createExerciseFromWorkoutEditor(new FormData(form));
  const candidateExercises = [...getCurrentExercises(), exercise];
  const validation = validateExercises(candidateExercises);
  const newExerciseIndex = candidateExercises.length - 1;
  const relevantErrors = validation.errors.filter((message) => {
    return message.startsWith(`Exercise ${newExerciseIndex + 1}:`)
      || message.includes(`"${exercise.id}"`)
      || message.includes(`"${normalizeExerciseName(exercise.name)}"`);
  });
  const duplicateNameWarning = validation.warnings.find((message) => {
    return message.includes(`"${normalizeExerciseName(exercise.name)}"`);
  });

  if (relevantErrors.length || duplicateNameWarning) {
    document.getElementById("quick-create-errors").innerHTML = `
      <div class="validation-list validation-errors">
        <ul>${[...relevantErrors, duplicateNameWarning].filter(Boolean).map((message) => `<li>${escapeHtml(message)}</li>`).join("")}</ul>
      </div>
    `;
    return;
  }

  addExerciseToDraft(exercise);
  const updatedByIds = setWorkoutExerciseId(quickCreateContext.dayId, quickCreateContext.workoutId, exercise.id);
  if (!updatedByIds) {
    setWorkoutExerciseByContext(quickCreateContext.context, exercise.id);
  }
  bootstrap.Modal.getInstance(document.getElementById("quickCreateExerciseModal")).hide();
  refreshAll();
}

function initializeImageFields() {
  document.getElementById("quick-image-fields").innerHTML = [1, 2, 3, 4, 5].map((number) => `
    <div class="col-md-6">
      <label class="form-label" for="quick-image-${number}">Image ${number}</label>
      <input class="form-control" id="quick-image-${number}" name="image${number}" />
    </div>
  `).join("");
}

function bindManagerEvents() {
  document.querySelectorAll("[data-template]").forEach((button) => {
    button.addEventListener("click", () => {
      const actions = {
        "exercise-json": downloadExerciseJsonTemplate,
        "exercise-csv": downloadExerciseCsvTemplate,
        "plan-json": downloadWorkoutPlanJsonTemplate,
        "plan-csv": downloadWorkoutPlanCsvTemplate
      };
      actions[button.dataset.template]();
    });
  });

  document.getElementById("exercise-file").addEventListener("change", (event) => {
    if (event.target.files[0]) handleExerciseImport(event.target.files[0]);
  });
  document.getElementById("plan-file").addEventListener("change", (event) => {
    if (event.target.files[0]) handlePlanImport(event.target.files[0]);
  });
  document.getElementById("validate-exercises").addEventListener("click", () => refreshAll({ editors: false }));
  document.getElementById("validate-plans").addEventListener("click", () => refreshAll({ editors: false }));
  document.getElementById("export-exercises").addEventListener("click", exportExercisesJson);
  document.getElementById("export-plans").addEventListener("click", exportWorkoutPlanJson);
  document.getElementById("export-plan-index").addEventListener("click", exportWorkoutPlanIndexJson);
  document.getElementById("clear-exercises").addEventListener("click", clearExerciseDraft);
  document.getElementById("clear-plans").addEventListener("click", clearWorkoutPlanDraft);
  document.querySelectorAll("[data-export]").forEach((button) => {
    if (button.dataset.export === "exercises") {
      button.addEventListener("click", exportExercisesJson);
    } else if (button.dataset.export === "plans") {
      button.addEventListener("click", exportWorkoutPlanJson);
    } else if (button.dataset.export === "plan-index") {
      button.addEventListener("click", exportWorkoutPlanIndexJson);
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target.matches(".manager-field")) {
      const path = event.target.dataset.path;
      setByDataPath(path, event.target.value);
      if (path.startsWith("plan.") && workoutPlanDraft) {
        ensureIndexDraftEntry(normalizeWorkoutPlan(workoutPlanDraft));
      }
      refreshAll({ editors: false });
      if (path.startsWith("exercise.") || path.endsWith(".exerciseId")) {
        renderWorkoutEditor(workoutPlanDraft);
      }
    }
    if (event.target.matches(".exercise-selector")) {
      setWorkoutExerciseByContext(event.target.dataset.context, event.target.value);
      const manual = event.target.closest(".workout-editor").querySelector('[data-path$=".exerciseId"]');
      manual.value = event.target.value;
      refreshAll({ editors: false });
      renderWorkoutEditor(workoutPlanDraft);
    }
  });

  document.addEventListener("input", (event) => {
    if (!event.target.matches(".exercise-option-search")) return;
    const editor = event.target.closest(".workout-editor");
    const selector = editor.querySelector(".exercise-selector");
    const [dayIndex, workoutIndex] = event.target.dataset.context.split(".").map(Number);
    const selectedId = workoutPlanDraft?.days?.[dayIndex]?.workouts?.[workoutIndex]?.exerciseId || "";
    selector.innerHTML = renderExerciseSelector(selectedId, event.target.value);
  });

  document.addEventListener("click", (event) => {
    const reviewButton = event.target.closest(".review-exercise");
    if (reviewButton) {
      const exercise = exerciseDraft[Number(reviewButton.dataset.exerciseIndex)];
      renderExerciseReview(exercise);
      bootstrap.Modal.getOrCreateInstance(document.getElementById("exerciseReviewModal")).show();
      return;
    }

    const button = event.target.closest(".quick-create-exercise");
    if (!button) return;
    openQuickCreateExerciseModal({
      dayId: button.dataset.dayId,
      workoutId: button.dataset.workoutId,
      context: button.dataset.context
    });
  });

  document.getElementById("quick-create-form").addEventListener("submit", (event) => {
    event.preventDefault();
    submitQuickCreate(event.currentTarget);
  });

  document.getElementById("exerciseReviewModal").addEventListener("hidden.bs.modal", (event) => {
    const carouselElement = event.currentTarget.querySelector(".carousel");
    if (carouselElement) {
      bootstrap.Carousel.getInstance(carouselElement)?.dispose();
    }
  });
}

async function initializeDataManager() {
  if (!document.getElementById("data-manager-page")) return;

  const [loadedExercises, loadedPlanIndex] = await Promise.all([loadExercises(), loadWorkoutPlanIndex()]);
  officialExercises = loadedExercises.map(normalizeExercise);
  officialPlanIndex = (loadedPlanIndex || []).map(normalizeWorkoutPlanIndexItem);
  exerciseDraft = cloneData(officialExercises);
  workoutPlanIndexDraft = cloneData(officialPlanIndex);
  exerciseDraftActive = true;
  workoutPlanIndexDraftActive = true;
  initializeImageFields();
  bindManagerEvents();
  refreshAll();
}

document.addEventListener("DOMContentLoaded", initializeDataManager);
