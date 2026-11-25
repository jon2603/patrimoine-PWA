# Patrimoine app

The single version of the dashboard, for both the computer and the iPhone.

- **On the computer:** open `index.html` (double-click). The old link `patrimoine-private-bank-v3.html` one folder up redirects here.
- **On the iPhone:** the same files, published through GitHub.

## Updating the iPhone version

1. Make the change in `index.html`.
2. In `service-worker.js`, bump `CACHE_NAME` by one (for example `v23` → `v24`). Without this, the iPhone keeps the old version.
3. Upload the contents of this folder to GitHub (see below).

## Files to upload to GitHub

- `index.html`
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
