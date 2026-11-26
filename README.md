# Patrimoine app

The single version of the dashboard, for both the computer and the iPhone.

- **On the computer:** open `index.html` (double-click). The old link `patrimoine-private-bank-v3.html` one folder up redirects here.
- **On the iPhone:** the same files, published through GitHub.

## How the code is organised

- `index.html`: page structure (sidebar, pages, dialogs)
- `styles.css`: the look (design tokens at the top: colours, type scale, radii)
- `app.js`: all logic (calculations, rendering, sync with the data file)

Every change is recorded with git in the parent folder (`git log` shows the history).

## Updating the iPhone version

1. Make the change in `index.html`, `styles.css` or `app.js`.
2. In `service-worker.js`, bump `CACHE_NAME` by one (for example `v27` → `v28`).
3. Upload the changed files to GitHub (see below).

## Files to upload to GitHub

- `index.html`
- `styles.css`
- `app.js`
- `manifest.json`
- `service-worker.js`
- `icons/`
- `assets/` (bank logos)

Never upload:

- `patrimoine-data.json` or any data / backup JSON file
- the `archives` or `backups` folders

Browser-side API keys cannot be fully secret. If your Finnhub key is stored in imported JSON/localStorage, keep the site URL and repository private.

## iPhone install

1. Open the HTTPS URL in Safari on iPhone.
2. Tap Share.
3. Tap Add to Home Screen.
4. Launch Patrimoine from the home screen.
5. Tap Load patrimoine-data.json and choose your private JSON from Files, iCloud Drive, OneDrive, or Downloads.
