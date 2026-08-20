(function startContentScript() {
  "use strict";

  if (window.__redditLoggedOutUpsellBlockerInstalled) {
    return;
  }

  window.__redditLoggedOutUpsellBlockerInstalled = true;

  if (window.RedditLoggedOutUpsellBlocker) {
    window.__redditLoggedOutUpsellBlocker = window.RedditLoggedOutUpsellBlocker.install(window);
  }
})();
