# Step 1 Prompt — Build Home / Workout Plans Page

Role: You are a senior frontend engineer building the first page of a static JSON-driven workout planner website. Your job is to create the shared project foundation and the Home / Workout Plans page.

# Personality

Be practical, careful, and implementation-focused. Keep the UI clean, responsive, and simple enough for GitHub Pages.

# Goal

Create the base static app structure and implement `index.html`.

The Home page must:
- Load workout plans from `data/workout-plans.json`.
- Show a read-only list of plans.
- Link to `plan-detail.html`.
- Link to `exercises.html`.
- Link to `data-manager.html`.

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

1. `index.html` opens locally and on GitHub Pages.
2. `data/workout-plans.json` exists with seed/sample data.
3. `data/exercises.json` exists with seed/sample data.
4. `assets/css/main.css` exists and provides shared styling.
5. `assets/js/utils.js` exists with common helpers.
6. `assets/js/data-loader.js` exists and can load JSON safely.
7. `assets/js/plans-view.js` can render the Home plan list.
8. The Home page displays plan cards from `data/workout-plans.json`.
9. Each plan card shows:
   - plan name
   - description
   - number of days
   - Open Detail button
10. Open Detail links to `plan-detail.html?planId=<plan.id>`.
11. The navbar contains links to:
   - Home
   - Exercises
   - Data Manager
12. The page is read-only.
13. There are no create/edit/delete buttons on this page.
14. If `data/workout-plans.json` cannot be loaded, show a friendly empty state or warning.
15. No backend, database, jQuery, external library, or localStorage CRUD is used.

# Constraints

Use only:
- HTML
- Bootstrap 5
- CSS
- vanilla JavaScript
- JSON file loading via fetch

Do not use:
- backend
- database
- localStorage CRUD for official data
- jQuery
- React/Vue/Angular
- GitHub API

# Output

Create or update these files:

```txt
index.html
data/exercises.json
data/workout-plans.json
assets/css/main.css
assets/js/utils.js
assets/js/data-loader.js
assets/js/plans-view.js
assets/js/app.js
```

# Implementation details

## `index.html`

Required UI:
- Bootstrap navbar
- Page title
- Short description explaining data comes from JSON files
- Plan cards grid
- Empty state: `No workout plans found`
- Link/button to Exercises page
- Link/button to Data Manager page

Each plan card:
- plan name
- description
- number of days
- Open Detail button

## `data-loader.js`

Implement:

```js
async function loadJsonFile(path, fallbackValue) {}

async function loadExercises() {}

async function loadWorkoutPlans() {}
```

Behavior:
- Use `fetch()`.
- If JSON cannot load or parse, return fallback value.
- Show safe console warning.

## `utils.js`

Implement:

```js
function escapeHtml(value) {}

function getQueryParam(name) {}

function isArray(value) {}

function formatCount(count, singular, plural) {}
```

## `plans-view.js`

Implement:

```js
async function renderPlanList() {}
```

The page should call `renderPlanList()` on DOMContentLoaded.

# Manual test scenarios

1. Open `index.html`.
2. Confirm plan cards load from `data/workout-plans.json`.
3. Confirm each card links to `plan-detail.html?planId=<id>`.
4. Temporarily break the JSON path and confirm a friendly warning/empty state appears.
5. Confirm page works without backend/server code.

# Stop rules

Before coding:
- Inspect the current project structure.
- Reuse existing files if present.
- Do not rewrite unrelated files.

If the project is empty:
- create the files listed above.

After coding:
- provide a short summary of changed files.
- provide manual test steps.
- list assumptions.
