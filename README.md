# Reddit Sign-In Popup Blocker

A lightweight Chrome and Firefox extension that keeps public Reddit pages readable when browsing logged out.

It removes Reddit's blocking sign-in popup, restores page scrolling, and stays out of the way of normal Reddit features.

## Why This Exists

Reddit sometimes interrupts logged-out browsing with a full-page sign-in prompt, even on public content. This extension solves that small but annoying problem for people who just want to read public pages without creating an account.

## Highlights

- Works on Chrome, Chromium browsers, and Firefox.
- Runs only on Reddit pages.
- Uses minimal extension permissions.
- Collects no user data.
- Includes automated DOM tests.
- Ships with reproducible Chrome and Firefox builds.

## Privacy

The extension has no analytics, telemetry, tracking, ads, backend service, remote code, or external API calls. Everything runs locally in the browser.

See [PRIVACY.md](PRIVACY.md).

## Install From Source

```bash
npm install
npm run build
```

Chrome:

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click "Load unpacked".
4. Select `dist/chrome`.

Firefox:

1. Open `about:debugging#/runtime/this-firefox`.
2. Click "Load Temporary Add-on".
3. Select `dist/firefox/manifest.json`.

## Development

```bash
npm test
npm run build
```

Release packages are generated in `release/`.

## Notes

This extension is intended only for otherwise publicly accessible Reddit pages. It does not access private content, change network requests, automate Reddit activity, or bypass account-only functionality.

This project is not affiliated with, endorsed by, or sponsored by Reddit, Inc. Reddit is a trademark of its respective owner.

## License

MIT. See [LICENSE](LICENSE).
