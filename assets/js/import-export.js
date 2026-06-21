"use strict";

const EXERCISE_JSON_TEMPLATE = [
  {
    id: "ex_bent_over_barbell_row",
    name: "Bent Over Barbell Row",
    description: "A back exercise performed with a barbell while bending forward.",
    mainTarget: "Back",
    muscleGroups: ["Back", "Shoulder"],
    images: [
      "https://example.com/row-1.jpg",
      "https://example.com/row-2.jpg",
      "https://example.com/row-3.jpg"
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=example"
  }
];

const EXERCISE_CSV_TEMPLATE = `id,name,description,mainTarget,muscleGroups,image1,image2,image3,image4,image5,youtubeUrl
ex_bent_over_barbell_row,Bent Over Barbell Row,A back exercise performed with a barbell while bending forward.,Back,"Back,Shoulder",https://example.com/row-1.jpg,https://example.com/row-2.jpg,https://example.com/row-3.jpg,,,https://www.youtube.com/watch?v=example`;

const WORKOUT_PLAN_JSON_TEMPLATE = [
  {
    id: "plan_4_day_strength",
    name: "4-Day Strength Plan",
    description: "A simple 4-day workout plan.",
    days: [
      {
        id: "day_1_back_shoulder",
        name: "Day 1 - Back + Shoulder",
        note: "Focus on back strength.",
        workouts: [
          {
            id: "workout_bent_over_row",
            exerciseId: "ex_bent_over_barbell_row",
            sets: 4,
            reps: "10",
            weight: "20kg",
            note: "Keep back straight"
          }
        ]
      }
    ]
  }
];

const WORKOUT_PLAN_CSV_TEMPLATE = `planId,planName,planDescription,dayId,dayName,dayNote,workoutId,exerciseId,sets,reps,weight,note
plan_4_day_strength,4-Day Strength Plan,A simple 4-day workout plan.,day_1_back_shoulder,Day 1 - Back + Shoulder,Focus on back strength.,workout_bent_over_row,ex_bent_over_barbell_row,4,10,20kg,Keep back straight`;

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType || "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const source = String(text || "").replace(/^\uFEFF/, "");

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const nextCharacter = source[index + 1];

    if (character === '"' && quoted && nextCharacter === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }
      row.push(field);
      if (row.some((value) => value.trim())) {
        rows.push(row);
      }
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (quoted) {
    throw new Error("CSV contains an unterminated quoted value.");
  }

  row.push(field);
  if (row.some((value) => value.trim())) {
    rows.push(row);
  }

  if (!rows.length) {
    return [];
  }

  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((values) => {
    return headers.reduce((record, header, index) => {
      record[header] = values[index] == null ? "" : values[index].trim();
      return record;
    }, {});
  });
}

function normalizeStringArray(value) {
  if (isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

function normalizeExercise(exercise) {
  const images = isArray(exercise.images)
    ? exercise.images
    : [exercise.image1, exercise.image2, exercise.image3, exercise.image4, exercise.image5];

  return {
    id: String(exercise.id || "").trim(),
    name: String(exercise.name || "").trim(),
    description: String(exercise.description || "").trim(),
    mainTarget: String(exercise.mainTarget || "").trim(),
    muscleGroups: normalizeStringArray(exercise.muscleGroups),
    images: images.map((image) => String(image || "").trim()).filter(Boolean).slice(0, 5),
    youtubeUrl: String(exercise.youtubeUrl || "").trim()
  };
}

function normalizeWorkoutPlan(plan) {
  return {
    id: String(plan.id || "").trim(),
    name: String(plan.name || "").trim(),
    description: String(plan.description || "").trim(),
    days: (isArray(plan.days) ? plan.days : []).map((day) => ({
      id: String(day.id || "").trim(),
      name: String(day.name || "").trim(),
      note: String(day.note || "").trim(),
      workouts: (isArray(day.workouts) ? day.workouts : []).map((workout) => ({
        id: String(workout.id || "").trim(),
        exerciseId: String(workout.exerciseId || "").trim(),
        sets: workout.sets == null ? "" : workout.sets,
        reps: workout.reps == null ? "" : workout.reps,
        weight: workout.weight == null ? "" : workout.weight,
        note: workout.note == null ? "" : workout.note
      }))
    }))
  };
}

function parseExerciseJson(text) {
  const parsed = JSON.parse(text);
  if (!isArray(parsed)) {
    throw new Error("Exercise JSON must contain an array.");
  }
  return parsed.map(normalizeExercise);
}

function parseExerciseCsv(text) {
  return parseCsv(text).map(normalizeExercise);
}

function parseWorkoutPlanJson(text) {
  const parsed = JSON.parse(text);
  if (!isArray(parsed)) {
    throw new Error("Workout plan JSON must contain an array.");
  }
  return parsed.map(normalizeWorkoutPlan);
}

function parseWorkoutPlanCsv(text) {
  const records = parseCsv(text);
  const plans = new Map();

  records.forEach((record) => {
    const planId = record.planId.trim();
    const dayId = record.dayId.trim();

    if (!plans.has(planId)) {
      plans.set(planId, {
        id: planId,
        name: record.planName,
        description: record.planDescription,
        days: [],
        _days: new Map()
      });
    }

    const plan = plans.get(planId);
    if (!plan._days.has(dayId)) {
      const day = {
        id: dayId,
        name: record.dayName,
        note: record.dayNote,
        workouts: []
      };
      plan._days.set(dayId, day);
      plan.days.push(day);
    }

    plan._days.get(dayId).workouts.push({
      id: record.workoutId,
      exerciseId: record.exerciseId,
      sets: record.sets,
      reps: record.reps,
      weight: record.weight,
      note: record.note
    });
  });

  return [...plans.values()].map((plan) => {
    delete plan._days;
    return normalizeWorkoutPlan(plan);
  });
}

async function importExerciseFile(file) {
  const text = await file.text();
  return file.name.toLowerCase().endsWith(".csv") ? parseExerciseCsv(text) : parseExerciseJson(text);
}

async function importWorkoutPlanFile(file) {
  const text = await file.text();
  return file.name.toLowerCase().endsWith(".csv") ? parseWorkoutPlanCsv(text) : parseWorkoutPlanJson(text);
}

function validateExercises(exercises) {
  const errors = [];
  const warnings = [];
  const invalidRows = new Set();
  const idRows = new Map();
  const nameRows = new Map();

  exercises.forEach((exercise, index) => {
    const row = index + 1;
    if (!exercise.id) errors.push(`Exercise ${row}: id is required.`);
    if (exercise.id && !/^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(exercise.id)) errors.push(`Exercise ${row}: id must be lowercase and slug-like.`);
    if (!exercise.name) errors.push(`Exercise ${row}: name is required.`);
    if (!exercise.description) errors.push(`Exercise ${row}: description is required.`);
    if (!exercise.mainTarget) errors.push(`Exercise ${row}: mainTarget is required.`);
    if (!isArray(exercise.muscleGroups)) errors.push(`Exercise ${row}: muscleGroups must be an array.`);
    if (!isArray(exercise.images)) errors.push(`Exercise ${row}: images must be an array.`);
    if (isArray(exercise.images) && exercise.images.length > 5) errors.push(`Exercise ${row}: images cannot exceed 5.`);
    (isArray(exercise.images) ? exercise.images : []).forEach((image) => {
      if (!isValidUrlOrPath(image)) errors.push(`Exercise ${row}: invalid image URL or path "${image}".`);
    });
    if (exercise.youtubeUrl && !isYoutubeUrl(exercise.youtubeUrl)) errors.push(`Exercise ${row}: youtubeUrl is not a recognized YouTube URL.`);

    const rowErrors = errors.filter((message) => message.startsWith(`Exercise ${row}:`));
    if (rowErrors.length) invalidRows.add(index);
    if (exercise.id) {
      if (!idRows.has(exercise.id)) idRows.set(exercise.id, []);
      idRows.get(exercise.id).push(row);
    }
    const normalizedName = normalizeExerciseName(exercise.name);
    if (normalizedName) {
      if (!nameRows.has(normalizedName)) nameRows.set(normalizedName, []);
      nameRows.get(normalizedName).push(row);
    }
  });

  const duplicateIds = [...idRows.entries()].filter(([, rows]) => rows.length > 1);
  duplicateIds.forEach(([id, rows]) => errors.push(`Duplicate exercise ID "${id}" in rows ${rows.join(", ")}.`));
  const duplicateNames = [...nameRows.entries()].filter(([, rows]) => rows.length > 1);
  duplicateNames.forEach(([name, rows]) => warnings.push(`Duplicate normalized exercise name "${name}" in rows ${rows.join(", ")}.`));

  return { errors, warnings, invalidRows: [...invalidRows], duplicateIds, duplicateNames };
}

function validateWorkoutPlans(plans, exercises) {
  const errors = [];
  const warnings = [];
  const exerciseIds = new Set(exercises.map((exercise) => exercise.id));
  const planIds = new Map();
  const missingReferences = [];
  let totalDays = 0;
  let totalWorkouts = 0;

  plans.forEach((plan, planIndex) => {
    const planLabel = `Plan ${planIndex + 1}`;
    if (!plan.id) errors.push(`${planLabel}: id is required.`);
    if (!plan.name) errors.push(`${planLabel}: name is required.`);
    if (!isArray(plan.days)) errors.push(`${planLabel}: days must be an array.`);
    if (!planIds.has(plan.id)) planIds.set(plan.id, []);
    planIds.get(plan.id).push(planIndex + 1);
    const dayIds = new Map();

    (isArray(plan.days) ? plan.days : []).forEach((day, dayIndex) => {
      totalDays += 1;
      const dayLabel = `${planLabel}, day ${dayIndex + 1}`;
      if (!day.id) errors.push(`${dayLabel}: id is required.`);
      if (!day.name) errors.push(`${dayLabel}: name is required.`);
      if (!isArray(day.workouts)) errors.push(`${dayLabel}: workouts must be an array.`);
      if (!dayIds.has(day.id)) dayIds.set(day.id, []);
      dayIds.get(day.id).push(dayIndex + 1);
      const workoutIds = new Map();

      (isArray(day.workouts) ? day.workouts : []).forEach((workout, workoutIndex) => {
        totalWorkouts += 1;
        const workoutLabel = `${dayLabel}, workout ${workoutIndex + 1}`;
        if (!workout.id) errors.push(`${workoutLabel}: id is required.`);
        if (!workout.exerciseId) errors.push(`${workoutLabel}: exerciseId is required.`);
        if (workout.exerciseId && !exerciseIds.has(workout.exerciseId)) {
          const reference = `${plan.id || planLabel} / ${day.id || dayLabel} / ${workout.id || workoutLabel}: ${workout.exerciseId}`;
          missingReferences.push(reference);
          errors.push(`Missing exercise reference: ${reference}.`);
        }
        if (!workoutIds.has(workout.id)) workoutIds.set(workout.id, []);
        workoutIds.get(workout.id).push(workoutIndex + 1);
      });

      [...workoutIds.entries()].filter(([, rows]) => rows.length > 1).forEach(([id]) => {
        errors.push(`${dayLabel}: duplicate workout ID "${id}".`);
      });
    });

    [...dayIds.entries()].filter(([, rows]) => rows.length > 1).forEach(([id]) => {
      errors.push(`${planLabel}: duplicate day ID "${id}".`);
    });
  });

  [...planIds.entries()].filter(([, rows]) => rows.length > 1).forEach(([id]) => {
    errors.push(`Duplicate plan ID "${id}".`);
  });

  return { errors, warnings, missingReferences, totalDays, totalWorkouts };
}

function downloadExerciseJsonTemplate() {
  downloadFile("exercise-template.json", JSON.stringify(EXERCISE_JSON_TEMPLATE, null, 2), "application/json");
}

function downloadExerciseCsvTemplate() {
  downloadFile("exercise-template.csv", EXERCISE_CSV_TEMPLATE, "text/csv;charset=utf-8");
}

function downloadWorkoutPlanJsonTemplate() {
  downloadFile("workout-plan-template.json", JSON.stringify(WORKOUT_PLAN_JSON_TEMPLATE, null, 2), "application/json");
}

function downloadWorkoutPlanCsvTemplate() {
  downloadFile("workout-plan-template.csv", WORKOUT_PLAN_CSV_TEMPLATE, "text/csv;charset=utf-8");
}
