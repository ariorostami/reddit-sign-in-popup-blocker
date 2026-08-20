/* global window, document, MutationObserver */
(function initRedditUpsellBlocker(root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.RedditLoggedOutUpsellBlocker = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : window, function createBlocker() {
  "use strict";

  const VERSION = "1.0.0";
  const SCROLL_LOCK_CLASS = "rpl-scroll-lock";
  const BLOCKER_SELECTORS = [
    "#desktop-dynamic-upsell-dialog",
    "rpl-dialog-sheet#desktop-dynamic-upsell",
    "desktop-dynamic-upsell-modal"
  ];
  const DEFERRED_BLOCKER_SELECTORS = [
    "[name='desktop_auth_blocking_upsell']",
    "[data-name='desktop_auth_blocking_upsell']",
    "[id='desktop_auth_blocking_upsell']",
    "[name='deferred-desktop_auth_blocking_upsell']",
    "[data-name='deferred-desktop_auth_blocking_upsell']",
    "[id='deferred-desktop_auth_blocking_upsell']",
    "shreddit-async-loader[bundlename='desktop_auth_blocking_upsell']",
    "shreddit-async-loader[bundlename='deferred-desktop_auth_blocking_upsell']",
    "shreddit-async-loader[feature='desktop_auth_blocking_upsell']",
    "shreddit-async-loader[feature='deferred-desktop_auth_blocking_upsell']"
  ];
  const QUERY_SELECTOR = BLOCKER_SELECTORS.concat(DEFERRED_BLOCKER_SELECTORS).join(",");
  const ROUTE_EVENTS = ["popstate", "pushstate", "replacestate", "locationchange"];

  function isElement(node) {
    return node && node.nodeType === 1;
  }

  function matchesSelector(element, selector) {
    return isElement(element) && element.matches(selector);
  }

  function matchesAny(element, selectors) {
    return selectors.some(function eachSelector(selector) {
      return matchesSelector(element, selector);
    });
  }

  function queryAllWithin(rootNode, selector) {
    if (!rootNode) {
      return [];
    }

    const matches = [];
    if (isElement(rootNode) && rootNode.matches(selector)) {
      matches.push(rootNode);
    }

    if (rootNode.querySelectorAll) {
      rootNode.querySelectorAll(selector).forEach(function addMatch(element) {
        matches.push(element);
      });
    }

    return matches;
  }

  function looksLikeBlockingUpsell(element) {
    if (!isElement(element)) {
      return false;
    }

    if (matchesAny(element, BLOCKER_SELECTORS)) {
      return true;
    }

    return false;
  }

  function looksLikeDeferredBlockingUpsell(element) {
    if (!isElement(element) || !matchesAny(element, DEFERRED_BLOCKER_SELECTORS)) {
      return false;
    }

    const marker = [
      element.id,
      element.getAttribute("name"),
      element.getAttribute("data-name"),
      element.getAttribute("bundlename"),
      element.getAttribute("feature")
    ]
      .filter(Boolean)
      .join(" ");

    return /(?:deferred-)?desktop_auth_blocking_upsell/.test(marker);
  }

  function removeElement(element) {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
      return true;
    }

    return false;
  }

  function restoreScroll(doc) {
    const body = doc.body;
    const html = doc.documentElement;
    let changed = false;

    if (body && body.classList.contains(SCROLL_LOCK_CLASS)) {
      body.classList.remove(SCROLL_LOCK_CLASS);
      changed = true;
    }

    [body, html].forEach(function restoreElement(element) {
      if (!element || !element.style) {
        return;
      }

      if (element.dataset && element.dataset.rlubOriginalOverflow !== undefined) {
        element.style.overflow = element.dataset.rlubOriginalOverflow;
        delete element.dataset.rlubOriginalOverflow;
        changed = true;
      }

      if (element.dataset && element.dataset.rlubOriginalPosition !== undefined) {
        element.style.position = element.dataset.rlubOriginalPosition;
        delete element.dataset.rlubOriginalPosition;
        changed = true;
      }
    });

    return changed;
  }

  function suppressScrollLockSideEffects(doc) {
    const body = doc.body;
    const html = doc.documentElement;

    [body, html].forEach(function markElement(element) {
      if (!element || !element.style || !element.dataset) {
        return;
      }

      if (element.style.overflow === "hidden" && element.dataset.rlubOriginalOverflow === undefined) {
        element.dataset.rlubOriginalOverflow = "";
      }

      if (element.style.position === "fixed" && element.dataset.rlubOriginalPosition === undefined) {
        element.dataset.rlubOriginalPosition = "";
      }
    });
  }

  function cleanup(doc, roots) {
    const documentRef = doc || document;
    const scanRoots = roots && roots.length ? roots : [documentRef];
    let removed = 0;

    scanRoots.forEach(function scanRoot(rootNode) {
      queryAllWithin(rootNode, QUERY_SELECTOR).forEach(function inspect(element) {
        if (looksLikeBlockingUpsell(element) || looksLikeDeferredBlockingUpsell(element)) {
          if (removeElement(element)) {
            removed += 1;
          }
        }
      });
    });

    if (removed > 0) {
      suppressScrollLockSideEffects(documentRef);
    }

    const scrollRestored = restoreScroll(documentRef);
    return { removed: removed, scrollRestored: scrollRestored };
  }

  function install(win) {
    const windowRef = win || window;
    const documentRef = windowRef.document;
    let scheduled = false;

    function scheduleCleanup(roots) {
      if (scheduled) {
        return;
      }

      scheduled = true;
      windowRef.requestAnimationFrame(function runScheduledCleanup() {
        scheduled = false;
        cleanup(documentRef, roots);
      });
    }

    cleanup(documentRef);

    const observer = new windowRef.MutationObserver(function handleMutations(mutations) {
      const addedRoots = [];
      let shouldRestoreScroll = false;

      mutations.forEach(function inspectMutation(mutation) {
        if (mutation.type === "attributes" && mutation.target === documentRef.body) {
          shouldRestoreScroll = mutation.attributeName === "class" || mutation.attributeName === "style";
          return;
        }

        mutation.addedNodes.forEach(function inspectAddedNode(node) {
          if (!isElement(node)) {
            return;
          }

          if (node.matches && node.matches(QUERY_SELECTOR)) {
            addedRoots.push(node);
            return;
          }

          if (node.querySelector && node.querySelector(QUERY_SELECTOR)) {
            addedRoots.push(node);
          }
        });
      });

      if (addedRoots.length || shouldRestoreScroll) {
        scheduleCleanup(addedRoots.length ? addedRoots : undefined);
      }
    });

    const observeTarget = documentRef.documentElement || documentRef;
    observer.observe(observeTarget, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"]
    });

    ROUTE_EVENTS.forEach(function addRouteListener(eventName) {
      windowRef.addEventListener(eventName, function routeChanged() {
        scheduleCleanup();
      });
    });

    return {
      cleanup: function runCleanup() {
        return cleanup(documentRef);
      },
      disconnect: function disconnect() {
        observer.disconnect();
      }
    };
  }

  return {
    VERSION: VERSION,
    BLOCKER_SELECTORS: BLOCKER_SELECTORS.slice(),
    DEFERRED_BLOCKER_SELECTORS: DEFERRED_BLOCKER_SELECTORS.slice(),
    cleanup: cleanup,
    install: install
  };
});
