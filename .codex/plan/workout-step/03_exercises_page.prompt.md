# Step 3 Prompt — Build Exercises Page

Role: You are a senior frontend engineer building the Exercises page for a static JSON-driven workout planner. Your job is to display the official exercise library from JSON with search, filter, detail view, image story slider, and YouTube tutorial support.

# Personality

Be practical, careful, and implementation-focused. Keep the UI clean, read-only, responsive, and easy to browse.

# Goal

Create `exercises.html`.

The page must:
- Load official exercises from `data/exercises.json`.
- Show exercise cards.
- Support search by exercise name.
- Support filter by muscle group.
- Show exercise detail modal or panel.
- Show tutorial images using the story slider.
- Show YouTube tutorial separately.
- Link to Data Manager for editing/export workflow.

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

1. `exercises.html` opens locally and on GitHub Pages.
2. Exercises load from `data/exercises.json`.
3. Exercise cards display:
   - name
   - description summary
   - main target
   - muscle groups
   - image count
   - YouTube availability
   - View Detail button
4. User can search exercises by name.
5. User can filter exercises by muscle group.
6. Exercise detail view displays:
   - name
   - full description
   - main target
   - muscle groups
   - image tutorial slideshow
   - YouTube tutorial link or embed
7. If no exercises match search/filter, show `No exercises found`.
8. The page is read-only.
9. There are no create/edit/delete buttons.
10. The page links to `data-manager.html`.
11. No backend, database, jQuery, GitHub API, or localStorage CRUD is used.

# Constraints

Use only:
- HTML
- Bootstrap 5
- CSS
- vanilla JavaScript
- JSON loading through existing `data-loader.js`

Do not use:
- backend
- database
- jQuery
- localStorage CRUD
- external libraries

# Output

Create or update these files:

```txt
exercises.html
assets/js/exercises-view.js
assets/js/story-slider.js
assets/js/utils.js
assets/css/main.css
```

Reuse existing:
```txt
assets/js/data-loader.js
data/exercises.json
```

# Implementation details

## `exercises.html`

Required UI:
- Navbar
- Page title
- Search input
- Muscle group filter select
- Exercise cards grid
- Exercise detail modal or side panel
- Link/button to Data Manager

## Search

Search should match:
- exercise name

Optional but useful:
- exercise ID
- mainTarget
- muscleGroups

## Muscle group filter

Build options dynamically from all exercise `muscleGroups`.

## Exercise detail

Use:

```js
function renderExerciseDetail(exercise) {}
```

Show:
- name
- full description
- mainTarget
- muscleGroups
- images through `renderStorySlider(container, exercise)`
- YouTube embed or external link

## Data safety

Use safe HTML escaping for user-facing values from JSON.

# Manual test scenarios

1. Open `exercises.html`.
2. Confirm exercises load from `data/exercises.json`.
3. Search for an exercise by name.
4. Filter by Back/Chest/Shoulder or any available muscle group.
5. Open exercise detail.
6. Confirm image story slider works.
7. Confirm YouTube tutorial displays separately.
8. Confirm no create/edit/delete buttons are visible.
9. Confirm Data Manager link works.

# Stop rules

Before coding:
- Inspect existing Step 1 and Step 2 files.
- Reuse existing story slider and utility functions.
- Do not rewrite unrelated pages.

If `story-slider.js` already exists:
- reuse or extend it, do not duplicate it.

After coding:
- provide a short summary of changed files.
- provide manual test steps.
- list assumptions.
