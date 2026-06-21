# Step 4 Prompt — Build Data Manager Page

Role: You are a senior frontend engineer building the Data Manager page for a static JSON-driven workout planner. Your job is to create a browser-based data preparation tool that imports JSON/CSV, previews, validates, allows editing, supports searchable exercise selection and quick-create exercise inside workout editing, then exports clean JSON files for manual GitHub push.

# Personality

Be practical, careful, and implementation-focused. Prioritize correctness, validation, clear warnings, and clean JSON output over fancy UI.

# Goal

Create `data-manager.html`.

The Data Manager page must:
- Download Exercise JSON template.
- Download Exercise CSV template.
- Download Workout Plan JSON template.
- Download Workout Plan CSV template.
- Import Exercise JSON/CSV.
- Import Workout Plan JSON/CSV.
- Preview imported data.
- Validate imported data.
- Let user edit imported exercise and workout plan data in browser.
- Let user select exercise for workouts using searchable/filterable selector.
- Let user quick-create a missing exercise from the workout editor.
- Add quick-created exercise to Exercise Draft.
- Store only `exerciseId` in workout items.
- Export clean `exercises.json`.
- Export clean `workout-plans.json`.

# Common Context for All Steps

Build a static workout planner website using HTML, Bootstrap 5, CSS, and vanilla JavaScript.

This project is GitHub Pages-ready and JSON-driven.

Official data files:
- `data/exercises.json`
- `data/workout-plans.json`

Important static hosting rule:
- The browser can read JSON files from `/data`.
- The browser cannot write directly to `data/*.json`.
- Do not implement backend, database, GitHub API push, authentication, jQuery, external CSV parser libraries, or localStorage CRUD for official data.
- Data Manager may use temporary in-browser draft state only.
- Official app data must come from JSON files in `/data`.

Use correct spelling:
- `exercise`
- `exercises`

Do not use:
- `excersice`
- `excersices`

Shared suggested file structure:
```txt
index.html
plan-detail.html
exercises.html
data-manager.html

data/exercises.json
data/workout-plans.json

assets/css/main.css

assets/js/app.js
assets/js/data-loader.js
assets/js/plans-view.js
assets/js/exercises-view.js
assets/js/data-manager.js
assets/js/import-export.js
assets/js/story-slider.js
assets/js/utils.js
```

Shared data models:

Exercise:
```json
{
  "id": "ex_bent_over_barbell_row",
  "name": "Bent Over Barbell Row",
  "description": "A back exercise performed with a barbell while bending forward.",
  "mainTarget": "Back",
  "muscleGroups": ["Back", "Shoulder"],
  "images": [
    "https://example.com/row-1.jpg",
    "https://example.com/row-2.jpg",
    "https://example.com/row-3.jpg"
  ],
  "youtubeUrl": "https://www.youtube.com/watch?v=example"
}
```

Workout plan:
```json
{
  "id": "plan_4_day_strength",
  "name": "4-Day Strength Plan",
  "description": "A simple 4-day workout plan for strength and muscle building.",
  "days": [
    {
      "id": "day_1_back_shoulder",
      "name": "Day 1 - Back + Shoulder",
      "note": "Focus on back strength and shoulder stability.",
      "workouts": [
        {
          "id": "workout_bent_over_row",
          "exerciseId": "ex_bent_over_barbell_row",
          "sets": 4,
          "reps": "10",
          "weight": "20kg",
          "note": "Keep back straight and control the movement."
        }
      ]
    }
  ]
}
```


# Success criteria

The task is complete when:

1. `data-manager.html` opens locally and on GitHub Pages.
2. Page explains the manual GitHub workflow:
   - import or download template
   - review/edit data
   - export JSON
   - replace files in `/data`
   - commit and push
3. User can download all 4 templates:
   - Exercise JSON
   - Exercise CSV
   - Workout Plan JSON
   - Workout Plan CSV
4. User can import Exercise JSON.
5. User can import Exercise CSV.
6. User can import Workout Plan JSON.
7. User can import Workout Plan CSV.
8. Imported exercise data is normalized, previewed, editable, and validated.
9. Imported workout plan data is normalized, previewed, editable, and validated.
10. Duplicate exercise IDs are errors.
11. Duplicate normalized exercise names are warnings or errors.
12. Duplicate plan IDs are errors.
13. Duplicate day IDs inside same plan are errors.
14. Duplicate workout IDs inside same day are errors.
15. Missing workout `exerciseId` references are shown clearly.
16. Workout editor uses a searchable/filterable exercise selector.
17. Selector searches by:
   - exercise name
   - exercise ID
   - mainTarget
   - muscleGroups
18. Selector displays:
   - exercise name
   - exercise ID
   - mainTarget
   - muscleGroups
19. Selector saves only selected `exercise.id` into `workout.exerciseId`.
20. Manual exerciseId input exists as an advanced fallback.
21. If no matching exercise exists, UI shows `Create New Exercise`.
22. Quick-create exercise modal/form includes:
   - id
   - name
   - description
   - mainTarget
   - muscleGroups
   - image1
   - image2
   - image3
   - image4
   - image5
   - youtubeUrl
23. If quick-create ID is empty, generate `ex_<slugified_name>`.
24. Quick-created exercise is validated.
25. If valid, quick-created exercise is added to Exercise Draft.
26. Current workout's `exerciseId` is updated to the new exercise ID.
27. New exercise appears in selector immediately.
28. Combined Review validates quick-created exercise references.
29. Exported `exercises.json` includes imported and quick-created exercises.
30. Exported `workout-plans.json` stores only exerciseId in workout items.
31. JSON exports are pretty-printed with 2-space indentation.
32. No backend, database, jQuery, external CSV parser, GitHub API, or server upload is used.

# Constraints

Use only:
- HTML
- Bootstrap 5
- CSS
- vanilla JavaScript
- File API / file.text() or FileReader
- Browser download API

Do not use:
- backend
- database
- jQuery
- external CSV parser libraries
- GitHub API
- automatic commit/push
- server upload
- localStorage CRUD for official data

Allowed:
- temporary in-memory draft state
- optional temporary localStorage draft cache for Data Manager only

Official data must still come from:
```txt
data/exercises.json
data/workout-plans.json
```

# Output

Create or update these files:

```txt
data-manager.html
assets/js/data-manager.js
assets/js/import-export.js
assets/js/utils.js
assets/js/data-loader.js
assets/css/main.css
```

Reuse:
```txt
data/exercises.json
data/workout-plans.json
```

# Data Manager page sections

## Section A: Instructions

Show this workflow clearly:

```txt
1. Download a template or import your current JSON/CSV.
2. Review and edit data in this page.
3. Use exercise selector to connect workouts to exercises.
4. If an exercise is missing, quick-create it from the workout editor.
5. Export clean JSON.
6. Replace the matching file in the GitHub repository:
   - data/exercises.json
   - data/workout-plans.json
7. Commit and push to GitHub.
8. GitHub Pages redeploys the site.
```

Also show warning:
- This page cannot push directly to GitHub.
- Export JSON and manually replace the repo files.

## Section B: Exercise Data Tools

Required UI:
- Download Exercise JSON Template button
- Download Exercise CSV Template button
- Import Exercise JSON/CSV file input
- Preview exercises
- Editable exercise rows/forms
- Validate exercises
- Export `exercises.json`
- Clear exercise draft

Preview should show:
- total exercises
- duplicate IDs
- duplicate normalized names
- invalid rows
- image count per exercise
- YouTube availability

## Section C: Workout Plan Data Tools

Required UI:
- Download Workout Plan JSON Template button
- Download Workout Plan CSV Template button
- Import Workout Plan JSON/CSV file input
- Preview workout plans
- Editable plan/day/workout rows/forms
- Exercise selector for each workout
- Quick Create Exercise button when missing
- Validate workout plans
- Export `workout-plans.json`
- Clear workout plan draft

Preview should show:
- total plans
- total days
- total workouts
- missing exercise references
- duplicate plan IDs
- duplicate day IDs inside each plan
- duplicate workout IDs inside each day
- invalid rows

## Section D: Exercise Selector and Quick Create

Exercise source for selector:
- Imported Exercise Draft if available.
- Otherwise loaded `data/exercises.json`.
- If both are available, combine them.
- Avoid duplicate exercise IDs.
- If duplicate IDs exist, show validation error.

Selector requirements:
- Search/filter by exercise name, ID, mainTarget, and muscleGroups.
- Display option as: name + ID + mainTarget + muscleGroups.
- Save only `exercise.id` into `workout.exerciseId`.
- Do not copy full exercise object into workout item.
- Keep manual exerciseId input as advanced fallback.
- Show Missing Reference if the current ID does not exist.

Quick-create behavior:
- Open modal/form.
- Generate ID from name if empty using `ex_<slugified_name>`.
- Validate new exercise.
- Check duplicate ID.
- Check duplicate normalized name.
- If valid:
  - add to Exercise Draft
  - update current workout.exerciseId
  - refresh selector
  - refresh Combined Review
- If invalid:
  - show errors
  - do not update workout

## Section E: Combined Review

Show:
- imported/current exercises count
- workout references count
- valid references count
- missing references
- duplicate IDs
- duplicate normalized names
- export buttons:
  - Export exercises.json
  - Export workout-plans.json

# Template formats

## Exercise JSON template

```json
[
  {
    "id": "ex_bent_over_barbell_row",
    "name": "Bent Over Barbell Row",
    "description": "A back exercise performed with a barbell while bending forward.",
    "mainTarget": "Back",
    "muscleGroups": ["Back", "Shoulder"],
    "images": [
      "https://example.com/row-1.jpg",
      "https://example.com/row-2.jpg",
      "https://example.com/row-3.jpg"
    ],
    "youtubeUrl": "https://www.youtube.com/watch?v=example"
  }
]
```

## Exercise CSV template

```csv
id,name,description,mainTarget,muscleGroups,image1,image2,image3,image4,image5,youtubeUrl
ex_bent_over_barbell_row,Bent Over Barbell Row,A back exercise performed with a barbell while bending forward.,Back,"Back,Shoulder",https://example.com/row-1.jpg,https://example.com/row-2.jpg,https://example.com/row-3.jpg,,,https://www.youtube.com/watch?v=example
```

## Workout Plan JSON template

```json
[
  {
    "id": "plan_4_day_strength",
    "name": "4-Day Strength Plan",
    "description": "A simple 4-day workout plan.",
    "days": [
      {
        "id": "day_1_back_shoulder",
        "name": "Day 1 - Back + Shoulder",
        "note": "Focus on back strength.",
        "workouts": [
          {
            "id": "workout_bent_over_row",
            "exerciseId": "ex_bent_over_barbell_row",
            "sets": 4,
            "reps": "10",
            "weight": "20kg",
            "note": "Keep back straight"
          }
        ]
      }
    ]
  }
]
```

## Workout Plan CSV template

```csv
planId,planName,planDescription,dayId,dayName,dayNote,workoutId,exerciseId,sets,reps,weight,note
plan_4_day_strength,4-Day Strength Plan,A simple 4-day workout plan.,day_1_back_shoulder,Day 1 - Back + Shoulder,Focus on back strength.,workout_bent_over_row,ex_bent_over_barbell_row,4,10,20kg,Keep back straight
```

CSV rules:
- First row is header.
- Support quoted values.
- Group workout plan CSV rows by planId.
- Inside each plan, group rows by dayId.
- Inside each day, create workout items.
- No external CSV parser.

# Required functions

Implement or reuse:

```js
function downloadFile(filename, content, mimeType) {}
function parseCsv(text) {}
function normalizeExerciseName(name) {}
function slugifyId(value, prefix) {}
function isValidUrlOrPath(value) {}
function isYoutubeUrl(value) {}

function downloadExerciseJsonTemplate() {}
function downloadExerciseCsvTemplate() {}
function downloadWorkoutPlanJsonTemplate() {}
function downloadWorkoutPlanCsvTemplate() {}

function importExerciseFile(file) {}
function importWorkoutPlanFile(file) {}

function parseExerciseJson(text) {}
function parseExerciseCsv(text) {}
function parseWorkoutPlanJson(text) {}
function parseWorkoutPlanCsv(text) {}

function validateExercises(exercises) {}
function validateWorkoutPlans(plans, exercises) {}

function renderExerciseDataPreview(exercises, validationResult) {}
function renderWorkoutPlanDataPreview(plans, validationResult) {}
function renderCombinedReview(exercises, plans) {}

function renderExerciseSelector(selectedExerciseId, onSelect) {}
function filterExerciseOptions(query, exercises) {}
function getExerciseOptionsForWorkoutEditor() {}

function openQuickCreateExerciseModal(context) {}
function createExerciseFromWorkoutEditor(formData) {}
function addExerciseToDraft(exercise) {}
function setWorkoutExerciseId(planId, dayId, workoutId, exerciseId) {}

function exportExercisesJson() {}
function exportWorkoutPlansJson() {}

function clearExerciseDraft() {}
function clearWorkoutPlanDraft() {}
```

# Validation rules

## Exercise validation

Required:
- id
- name
- description
- mainTarget

Rules:
- id is required and slug-like.
- name is required.
- description is required.
- mainTarget is required.
- muscleGroups must be an array.
- images must be an array.
- images max length is 5.
- empty image URLs are removed.
- image URL can be valid URL or local path.
- youtubeUrl can be empty.
- duplicate IDs are errors.
- duplicate normalized names are warnings or errors.

Use:

```js
function normalizeExerciseName(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ");
}
```

## Workout plan validation

Required:
- plan.id
- plan.name
- plan.days array
- day.id
- day.name
- day.workouts array
- workout.id
- workout.exerciseId

Rules:
- duplicate plan IDs are errors.
- duplicate day IDs inside same plan are errors.
- duplicate workout IDs inside same day are errors.
- workout.exerciseId must match an exercise ID.
- quick-created exercise IDs count as valid references.
- missing references are clearly shown.
- sets, reps, weight, and note can be string or number.

# Manual test scenarios

1. Open `data-manager.html`.
2. Download all 4 templates.
3. Import Exercise JSON.
4. Preview and validate exercises.
5. Edit one exercise.
6. Export `exercises.json`.
7. Import Exercise CSV.
8. Preview and validate.
9. Import Workout Plan JSON.
10. Preview and validate workout plans.
11. Confirm missing exercise references show.
12. Select exercise using selector.
13. Search selector by name, ID, mainTarget, muscleGroups.
14. Confirm selected exercise saves only exerciseId.
15. Click Create New Exercise from workout editor.
16. Create new exercise.
17. Confirm it is added to Exercise Draft.
18. Confirm workout uses new exerciseId.
19. Confirm new exercise appears in selector.
20. Confirm Combined Review passes.
21. Export `exercises.json`.
22. Export `workout-plans.json`.
23. Replace files in `/data`, commit, push, and confirm viewer pages display updated data.

# Stop rules

Before coding:
- Inspect existing Step 1, Step 2, and Step 3 files.
- Reuse existing helpers.
- Do not rewrite viewer pages unless necessary.

Do not:
- implement localStorage CRUD for official data
- implement GitHub API push
- use external CSV parser
- use backend/database
- copy full exercise object into workout items

If quick-create validation fails:
- show errors
- do not add exercise
- do not update workout.exerciseId

If quick-create succeeds:
- add to Exercise Draft
- update workout.exerciseId
- refresh selector
- refresh Combined Review

After coding:
- provide a short summary of changed files.
- provide manual test steps.
- list assumptions.
