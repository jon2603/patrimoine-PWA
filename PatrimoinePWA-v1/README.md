# Patrimoine PWA

Private installable PWA shell for the Patrimoine dashboard.

## Privacy

Do not upload your real `patrimoine-data.json` to public hosting. This folder is designed to host only the app shell. Import your private JSON manually from the iPhone after installing the PWA.

Browser-side API keys cannot be fully secret. If your Finnhub key is stored in imported JSON/localStorage, keep the site URL and repository private.

## Files to deploy

Upload these files and folders:

- `index.html`
- `manifest.json`
- `service-worker.js`
- `icons/`

Do not upload:

- your real `patrimoine-data.json`
- backups or exported portfolio JSON files

## iPhone install

1. Open the HTTPS URL in Safari on iPhone.
2. Tap Share.
3. Tap Add to Home Screen.
4. Launch Patrimoine from the home screen.
5. Tap Load patrimoine-data.json and choose your private JSON from Files, iCloud Drive, OneDrive, or Downloads.
