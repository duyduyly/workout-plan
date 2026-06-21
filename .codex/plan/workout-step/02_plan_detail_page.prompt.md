# Step 2 Prompt — Build Plan Detail Page With Day Accordion

Role: You are a senior frontend engineer building the Plan Detail page for a static JSON-driven workout planner. Your job is to display one selected workout plan, its days, workouts, and linked exercise details by `exerciseId`.

# Personality

Be practical, careful, and implementation-focused. Keep the page read-only, responsive, clean, and easy to understand.

# Goal

Create `plan-detail.html`.

The page must:
- Read `planId` from the URL query string.
- Load plans from `data/workout-plans.json`.
- Load exercises from `data/exercises.json`.
- Find the selected plan.
- Show selected plan title and description.
- Show all workout days as collapsible Bootstrap 5 accordion items.
- Resolve each workout's `exerciseId` into exercise details.
- Show workouts inside each day accordion body.
- Show workout detail using a modal or detail panel.
- Use an Instagram-style image story slideshow for exercise images.
- Display YouTube tutorial separately from images.

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

1. `plan-detail.html?planId=<plan.id>` opens and renders the selected plan.
2. If `planId` is missing or invalid, show a friendly message and a Back to Home button.
3. The page displays:
    - plan title
    - plan description
    - days
    - day notes
    - workout count per day
    - workouts under each day
4. Each workout day is rendered as a Bootstrap 5 accordion item.
5. The day accordion header displays:
    - day name
    - day note or short summary
    - workout count badge, for example `4 workouts`
    - expand/collapse indicator from Bootstrap accordion behavior
6. The day accordion body displays all workouts for that day.
7. By default:
    - the first workout day should be expanded
    - the other workout days should be collapsed
8. User can click each day header to expand/collapse the workout list.
9. Only one day should be open at a time unless a simpler independent-collapse implementation already exists.
10. Each workout item displays:
- exercise name
- exercise main target
- muscle groups
- sets
- reps
- weight
- note
- View Detail button
11. Workout detail view displays:
- exercise name
- description
- main target
- muscle groups
- sets
- reps
- weight
- note
- image tutorial slideshow
- YouTube embed or external link
12. If `exerciseId` is missing from `data/exercises.json`, show `Missing exercise reference` clearly.
13. Image slideshow is image-only.
14. YouTube video is not inside the image slideshow.
15. The page is read-only.
16. There are no create/edit/delete buttons.
17. No backend, database, jQuery, GitHub API, or localStorage CRUD is used.

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
- external carousel/story libraries
- React/Vue/Angular

# Output

Create or update these files:

```txt
plan-detail.html
assets/js/plans-view.js
assets/js/story-slider.js
assets/js/utils.js
assets/css/main.css
```

Reuse existing:

```txt
assets/js/data-loader.js
data/exercises.json
data/workout-plans.json
```

# Implementation details

## `plan-detail.html`

Required UI:
- Bootstrap navbar
- Back to Home button
- Plan title
- Plan description
- Summary stats, optional but recommended:
    - total days
    - total workouts
- Bootstrap accordion for workout days
- Workout items inside each day accordion body
- Workout detail modal or side panel

## Day accordion requirements

Render each workout day as a Bootstrap 5 accordion item.

Use this structure conceptually:

```html
<div class="accordion" id="planDaysAccordion">
  <div class="accordion-item workout-day-accordion">
    <h2 class="accordion-header" id="heading-day-1">
      <button
        class="accordion-button"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#collapse-day-1"
        aria-expanded="true"
        aria-controls="collapse-day-1"
      >
        <span>
          <strong>Day 1 - Back + Shoulder</strong>
          <small>Focus on back strength and shoulder stability.</small>
        </span>
        <span class="badge text-bg-primary ms-auto">4 workouts</span>
      </button>
    </h2>

    <div
      id="collapse-day-1"
      class="accordion-collapse collapse show"
      aria-labelledby="heading-day-1"
      data-bs-parent="#planDaysAccordion"
    >
      <div class="accordion-body">
        <!-- workout items here -->
      </div>
    </div>
  </div>
</div>
```

Important details:
- The first day should use `collapse show` and `aria-expanded="true"`.
- Other days should use `collapse` and `aria-expanded="false"`.
- Use unique IDs for accordion heading and collapse panels.
- The accordion header should be easy to click on desktop and mobile.
- The workout count badge should remain visible in the header.
- The accordion body should have enough spacing between workout items.
- Do not put create/edit/delete controls inside the accordion.

## Workout item render

For each workout:
- Look up `exercise = exercises.find(e => e.id === workout.exerciseId)`.
- If found, show exercise info.
- If missing, show warning badge.

Workout items must store/use only:
- exerciseId
- sets
- reps
- weight
- note

Do not copy full exercise objects into workout items.

Recommended workout item layout:
- Left area:
    - small icon or thumbnail placeholder
    - exercise name
    - main target badge
    - muscle group badges
    - note
- Right area:
    - sets stat box
    - reps stat box
    - weight stat box
    - View Detail button

On mobile:
- Stack content vertically.
- Keep the View Detail button full width or easy to tap.
- Keep sets/reps/weight readable.

## Workout detail modal or panel

When user clicks `View Detail`:
- Open a Bootstrap modal or a detail panel.
- Pass the selected workout and resolved exercise.
- Display workout-specific values from the workout item.
- Display exercise-specific values from the exercise library.

Show:
- exercise name
- full description
- mainTarget
- muscleGroups
- sets
- reps
- weight
- workout note
- image story slider
- YouTube tutorial section

## `story-slider.js`

Implement:

```js
function renderStorySlider(container, exercise) {}
```

Requirements:
- Use Bootstrap 5 Carousel as base.
- Only support images.
- Show one image at a time.
- Display story progress bars at the top.
- Each image auto-slides after 5 seconds.
- Active progress bar animates from 0% to 100%.
- Completed bars stay full.
- Future bars stay empty.
- Use `object-fit: cover`.
- If one image, hide controls/progress.
- If no images, show placeholder.

## YouTube display

Implement or reuse:

```js
function isYoutubeUrl(value) {}

function getYoutubeEmbedUrl(url) {}
```

Behavior:
- Convert YouTube watch links to embed URLs when possible.
- Display iframe when possible.
- Otherwise show external link.
- YouTube tutorial must be displayed separately from the image story slider.
- Do not place YouTube iframe inside the carousel.

## Safe rendering

Use safe HTML escaping for user-facing values from JSON.

Required helper functions, if missing:

```js
function escapeHtml(value) {}
function getQueryParam(name) {}
function isArray(value) {}
function formatCount(count, singular, plural) {}
```

# Manual test scenarios

1. Open `index.html`.
2. Click a plan's Open Detail button.
3. Confirm the selected plan renders.
4. Confirm the first workout day accordion is expanded by default.
5. Confirm other workout days are collapsed by default.
6. Click a day header and confirm it expands/collapses correctly.
7. Confirm the day header shows day name, note, and workout count badge.
8. Confirm workouts render inside the correct day accordion body.
9. Confirm workout detail modal opens.
10. Confirm exercise detail is resolved by `exerciseId`.
11. Confirm missing `exerciseId` shows `Missing exercise reference` warning.
12. Confirm image story slider works.
13. Confirm YouTube tutorial displays separately.
14. Confirm no create/edit/delete UI exists.
15. Confirm the page works locally and on GitHub Pages without backend/server code.

# Stop rules

Before coding:
- Inspect existing Step 1 files.
- Inspect existing Step 2 files if present.
- Reuse existing data loader/utilities.
- Reuse or extend existing `story-slider.js`; do not duplicate it.
- Do not rewrite Home page unless necessary.
- Do not rewrite unrelated pages or unrelated data files.

If required helper functions are missing:
- Add them to `utils.js` or the appropriate existing JS file.

If existing code already renders day cards:
- Convert day cards into Bootstrap 5 accordion items without changing the data model.

After coding:
- Provide a short summary of changed files.
- Provide manual test steps.
- List assumptions.
