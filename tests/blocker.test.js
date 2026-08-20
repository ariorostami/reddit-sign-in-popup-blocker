import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { JSDOM } from "jsdom";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const blocker = require("../src/blocker");

let dom;

function setup(html) {
  dom = new JSDOM(html, { url: "https://www.reddit.com/r/test/" });
  dom.window.requestAnimationFrame = function requestAnimationFrame(callback) {
    return dom.window.setTimeout(callback, 0);
  };
  return dom.window.document;
}

function waitForObserver() {
  return new Promise(function wait(resolve) {
    dom.window.setTimeout(resolve, 10);
  });
}

beforeEach(function resetDom() {
  vi.useRealTimers();
});

afterEach(function cleanupDom() {
  if (dom) {
    dom.window.close();
    dom = undefined;
  }
});

describe("Reddit logged-out upsell blocker", function suite() {
  it("removes the blocker and restores body scrolling", function test() {
    const doc = setup("<body class=\"rpl-scroll-lock\"><div id=\"desktop-dynamic-upsell-dialog\"></div></body>");

    const result = blocker.cleanup(doc);

    expect(result.removed).toBe(1);
    expect(doc.querySelector("#desktop-dynamic-upsell-dialog")).toBeNull();
    expect(doc.body.classList.contains("rpl-scroll-lock")).toBe(false);
  });

  it("leaves a normal page unchanged", function test() {
    const doc = setup("<body><main><button>Log in</button><p>Public post</p></main></body>");
    const before = doc.body.innerHTML;

    const result = blocker.cleanup(doc);

    expect(result.removed).toBe(0);
    expect(doc.body.innerHTML).toBe(before);
  });

  it("removes a blocker inserted later", async function test() {
    const doc = setup("<body><main>Public post</main></body>");
    const installed = blocker.install(dom.window);

    const modal = doc.createElement("div");
    modal.id = "desktop-dynamic-upsell-dialog";
    doc.body.classList.add("rpl-scroll-lock");
    doc.body.appendChild(modal);

    await waitForObserver();

    expect(doc.querySelector("#desktop-dynamic-upsell-dialog")).toBeNull();
    expect(doc.body.classList.contains("rpl-scroll-lock")).toBe(false);
    installed.disconnect();
  });

  it("handles duplicate blocker inserts without errors", async function test() {
    const doc = setup("<body><main>Public post</main></body>");
    const installed = blocker.install(dom.window);

    for (let index = 0; index < 3; index += 1) {
      const modal = doc.createElement("desktop-dynamic-upsell-modal");
      doc.body.appendChild(modal);
    }

    await waitForObserver();

    expect(doc.querySelectorAll("desktop-dynamic-upsell-modal")).toHaveLength(0);
    installed.disconnect();
  });

  it("does not remove unrelated Reddit modals", function test() {
    const doc = setup("<body><div id=\"unrelated-modal\" role=\"dialog\"><button>Log in</button></div></body>");

    const result = blocker.cleanup(doc);

    expect(result.removed).toBe(0);
    expect(doc.querySelector("#unrelated-modal")).not.toBeNull();
  });

  it("continues working after simulated client-side navigation", async function test() {
    const doc = setup("<body><main>First route</main></body>");
    const installed = blocker.install(dom.window);

    dom.window.history.pushState({}, "", "/r/test/comments/abc/");
    dom.window.dispatchEvent(new dom.window.Event("locationchange"));

    const modal = doc.createElement("rpl-dialog-sheet");
    modal.id = "desktop-dynamic-upsell";
    doc.body.classList.add("rpl-scroll-lock");
    doc.body.appendChild(modal);

    await waitForObserver();

    expect(doc.querySelector("rpl-dialog-sheet#desktop-dynamic-upsell")).toBeNull();
    expect(doc.body.classList.contains("rpl-scroll-lock")).toBe(false);
    installed.disconnect();
  });
});
