// Exposes a jsdom window's globals (document, HTMLElement, KeyboardEvent, ...) to Node so the
// tests can exercise PCUI's compiled output. Lives outside test/ so `node --test` does not run it.
import { JSDOM } from 'jsdom';

const { window } = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
    url: 'http://localhost/',
    pretendToBeVisual: true // provides requestAnimationFrame
});

// Copy anything Node doesn't already define, skipping jsdom internals
for (const key of Object.getOwnPropertyNames(window)) {
    if (!key.startsWith('_') && !(key in globalThis)) {
        globalThis[key] = window[key];
    }
}

globalThis.window = window;
globalThis.document = window.document;
