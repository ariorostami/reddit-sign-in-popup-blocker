# Contributing

Thanks for helping keep this extension small, clear, and reviewer-friendly.

## Reporting Reddit Markup Breakage

Please include:

- Browser
- Browser version
- Reddit URL
- Logged in or logged out
- Screenshot, if possible
- Relevant DOM selector or HTML snippet
- Console errors

## Development

```bash
npm install
npm test
npm run build
```

Keep selector changes narrow. Do not add broad deletion rules for generic words such as `login`, `auth`, `modal`, or `upsell`.

## Pull Requests

- Keep changes scoped.
- Add or update DOM-level tests for behavior changes.
- Do not add analytics, tracking, remote code, network calls, or unnecessary permissions.
- Leave source files readable for browser extension reviewers.
