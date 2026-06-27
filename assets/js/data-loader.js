"use strict";

async function loadJsonFile(path, fallbackValue) {
  try {
    const response = await fetch(path);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn(`Unable to load JSON from "${path}".`, error);
    return fallbackValue;
  }
}

async function loadExercises() {
  const exercises = await loadJsonFile("./data/exercises.json", []);
  return isArray(exercises) ? exercises : [];
}

async function loadWorkoutPlanIndex() {
  const index = await loadJsonFile("./data/workout-plans.index.json", null);
  return isArray(index) ? index : null;
}

async function loadLegacyWorkoutPlans() {
  const plans = await loadJsonFile("./data/workout-plans.json", []);
  return isArray(plans) ? plans : [];
}

async function loadWorkoutPlans() {
  const planIndex = await loadWorkoutPlanIndex();

  if (planIndex) {
    return planIndex;
  }

  console.warn("Deprecated fallback: loading ./data/workout-plans.json");
  const legacyPlans = await loadLegacyWorkoutPlans();
  return legacyPlans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    file: "",
    daysPerWeek: isArray(plan.days) ? plan.days.length : 0
  }));
}

async function loadWorkoutPlanById(planId) {
  const planIndex = await loadWorkoutPlanIndex();

  if (planIndex) {
    const planMeta = planIndex.find((item) => item.id === planId);
    if (!planMeta) {
      throw new Error(`Workout plan not found: ${planId}`);
    }

    const plan = await loadJsonFile(`./data/${planMeta.file}`, null);
    if (!plan || isArray(plan)) {
      throw new Error(`Invalid workout plan file: ${planMeta.file}`);
    }

    if (String(plan.id || "") !== String(planMeta.id || "")) {
      throw new Error(`Plan id mismatch. Index id: ${planMeta.id}, file id: ${plan.id}`);
    }

    return plan;
  }

  console.warn("Deprecated fallback: loading ./data/workout-plans.json");
  const plans = await loadLegacyWorkoutPlans();
  return plans.find((item) => item.id === planId) || null;
}
