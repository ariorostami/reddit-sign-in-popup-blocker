# Reddit Logged-Out Upsell Blocker

A small Chrome and Firefox extension that removes Reddit's client-side blocking sign-in upsell from otherwise publicly accessible desktop pages and restores normal scrolling.

This project is not affiliated with, endorsed by, or sponsored by Reddit, Inc. Reddit is a trademark of its respective owner.

## What It Solves

Reddit can show logged-out desktop visitors a blocking "sign in / join Reddit to continue" upsell after some browsing. The dialog darkens the page and applies a scroll lock even when the page content is otherwise public.

This extension removes that specific client-side blocking upsell. It does not bypass private communities, account-only features, authentication, bans, rate limits, or Reddit API access controls.

## Screenshots

Screenshots can be added before store submission:

- Before: blocking logged-out upsell visible.
- After: public page visible and scrollable.

## How It Works

The extension uses a content script and CSS injected at `document_start` on:

- `https://www.reddit.com/*`
- `https://reddit.com/*`

The CSS hides known blocking upsell elements early to reduce flashing. JavaScript then removes the matching element, removes Reddit's `body.rpl-scroll-lock` class, and watches for future inserts with a `MutationObserver`.

The cleanup is idempotent, so repeated inserts or route changes are safe.

## Targeted Selectors

The current targeted modal selectors are:

```js
#desktop-dynamic-upsell-dialog
rpl-dialog-sheet#desktop-dynamic-upsell
desktop-dynamic-upsell-modal
```

The extension also narrowly removes deferred loaders/triggers that explicitly identify:

```text
desktop_auth_blocking_upsell
deferred-desktop_auth_blocking_upsell
```

It intentionally does not delete every element containing broad words such as `login`, `auth`, `modal`, or `upsell`.

## Browser Support

- Google Chrome and Chromium browsers using Manifest V3.
- Firefox using WebExtensions Manifest V3 with a stable Gecko extension ID.

## Install From Source

### Chrome / Chromium

1. Run `npm run build`.
2. Open `chrome://extensions`.
3. Enable Developer mode.
4. Choose "Load unpacked".
5. Select `dist/chrome`.

### Firefox

1. Run `npm run build`.
2. Open `about:debugging#/runtime/this-firefox`.
3. Choose "Load Temporary Add-on".
4. Select `dist/firefox/manifest.json`.

For AMO submission, upload `release/reddit-upsell-blocker-firefox.zip`.

## Build

```bash
npm install
npm test
npm run build
```

The build creates:

- `dist/chrome/`
- `dist/firefox/`
- `release/reddit-upsell-blocker-chrome.zip`
- `release/reddit-upsell-blocker-firefox.zip`

The JavaScript is not minified or obfuscated.

## Privacy

This extension collects no user data. It has no analytics, telemetry, ads, user accounts, backend service, external API calls, or remote code. See `PRIVACY.md`.

## Troubleshooting

If Reddit changes the blocking modal markup, open an issue with:

- Browser version
- Reddit URL
- Whether you are logged in or logged out
- Screenshot, if possible
- Relevant DOM selector or HTML snippet
- Console errors, if any

Most breakage can be fixed by updating the selector lists in `src/blocker.js` and the anti-flash CSS in `src/content.css`.

## Permissions

The extension requests no broad extension API permissions such as `tabs`, `storage`, `cookies`, `webRequest`, `history`, or network access. It only injects a content script and CSS on Reddit pages.

## Security Boundary

This extension does not:

- Steal or manipulate credentials
- Impersonate a logged-in user
- Forge Reddit authentication
- Modify Reddit API responses
- Access private-community content
- Evade bans or rate limits
- Automate voting, posting, or scraping private content

It only changes local page presentation for the logged-out blocking upsell on public Reddit pages.

## Contributing

Bug reports for changed Reddit markup are welcome. Please include enough DOM detail to reproduce and update the targeted selectors conservatively.

## License

MIT. See `LICENSE`.
