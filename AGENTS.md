# Repository Guidelines

## Project Structure & Module Organization
This repository is currently a small static web app. The main entry point is `index.html`, which renders the workout page and wires in Bootstrap from a CDN. The page expects supporting files under `assets/css/`, `assets/js/`, `assets/images/`, and `assets/videos/`; keep new frontend assets in those folders so references stay predictable. `README.md` is minimal, so update it when setup or scope changes materially.

## Build, Test, and Development Commands
There is no build pipeline committed in this repo. For local development:

- `python -m http.server 8000` runs a simple local server from the repository root.
- Open `http://localhost:8000` to verify layout, media paths, and form behavior.
- `Get-ChildItem -Recurse` is useful for confirming expected asset files exist before editing HTML references.

If you add a package manager or bundler later, document the new commands here and in `README.md`.

## Coding Style & Naming Conventions
Use 2-space indentation in HTML, matching `index.html`. Prefer semantic HTML and clear Bootstrap utility usage over deeply nested markup. Use lowercase kebab-case for asset filenames such as `pushup-guide.mp4` and `workout-image`. Keep JavaScript filenames simple and descriptive, for example `app.js`, and prefer small DOM-focused functions over large inline scripts.

## Testing Guidelines
No automated tests are configured yet. Until a test framework is added, treat manual browser checks as required:

- verify the page loads without missing asset errors
- confirm images, video, and table content render correctly
- submit the daily log form and check the saved-log UI behavior

When adding automated tests, place them in a dedicated `tests/` folder or next to the related script, and document the command used to run them.

## Commit & Pull Request Guidelines
Recent commits use short, imperative subjects such as `add index` and `Initial commit`. Follow that pattern: keep commit titles brief, present tense, and scoped to one change. Pull requests should include a short summary, screenshots for visible UI changes, and notes about added assets or manual test steps.
