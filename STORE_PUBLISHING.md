# Store Publishing Guide

## Store Name

Reddit Sign-In Popup Blocker

## Short Description

Removes Reddit's blocking sign-in popup while browsing logged out.

## Long Description

Reddit Sign-In Popup Blocker removes Reddit's client-side blocking sign-in popup from otherwise publicly accessible Reddit pages and restores normal scrolling when the dialog locks the page.

The extension runs only on `reddit.com` pages. It uses a small content script and CSS file to hide and remove the specific logged-out blocking sign-in popup, including known selectors such as `#desktop-dynamic-upsell-dialog` and `rpl-dialog-sheet#desktop-dynamic-upsell`.

It does not bypass private communities, account-only features, authentication, bans, rate limits, or Reddit API access controls. It only changes the local presentation of public pages in the browser.

The project is open source, contains no remote code, does not minify or obfuscate source files, and collects no user data.

This project is not affiliated with, endorsed by, or sponsored by Reddit, Inc. Reddit is a trademark of its respective owner.

## Single-Purpose Statement

Remove Reddit's logged-out blocking sign-in popup from otherwise accessible public Reddit pages and restore scrolling when the dialog locks the page.

## Privacy Answers

No user data is collected, transmitted, sold, or shared.

The extension has:

- No analytics
- No telemetry
- No tracking
- No advertising
- No user accounts
- No backend service
- No external API calls
- No remote code

## Permissions Explanation

The extension needs access to `https://www.reddit.com/*` and `https://reddit.com/*` so its content script and CSS can run on Reddit pages, detect the logged-out blocking sign-in popup, remove it, and restore scrolling.

It does not request `tabs`, `storage`, `cookies`, `webRequest`, `history`, or other broad extension API permissions.

## Chrome Web Store Reviewer Notes

This extension consists of:

- `src/content.css`: hides the known blocking upsell early to reduce flashing.
- `src/blocker.js`: removes narrowly targeted upsell DOM nodes, removes `body.rpl-scroll-lock`, and observes future DOM inserts.
- `src/content.js`: installs the content script once per page.

The code does not modify network requests, does not read credentials, does not collect user data, and does not attempt to access private Reddit content.

Submit:

```text
release/reddit-sign-in-popup-blocker-chrome.zip
```

## Firefox AMO Notes

The Firefox manifest includes the stable Gecko ID:

```text
reddit-sign-in-popup-blocker@ariorostami.github.io
```

AMO reviewer summary:

- No remote code
- No analytics
- No network requests
- No obfuscation or minification
- Content script and CSS only
- Local DOM modifications on `reddit.com`
- No broad extension permissions

Submit:

```text
release/reddit-sign-in-popup-blocker-firefox.zip
```
