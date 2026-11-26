import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import fs from 'fs';
import path from 'path';
import { afterEach, vi } from 'vitest';
import { parse } from 'yaml';

// The client reads its settings from window.meetingClientSettings, which the settings loader fills
// from the server (settings-loader/component.tsx). Tests get the defaults shipped in settings.yml.
const settingsPath = path.resolve(__dirname, '../private/config/settings.yml');
const defaultSettings = parse(fs.readFileSync(settingsPath, 'utf8'));

export const resetMeetingClientSettings = () => {
  (window as unknown as { meetingClientSettings: unknown }).meetingClientSettings = structuredClone(defaultSettings);
};
resetMeetingClientSettings();

// jsdom has no matchMedia: every query answers "no match" unless a test overrides it.
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// A ResizeObserver whose entries the test triggers: `ResizeObserverMock.trigger(element, { width, height })`.
type Size = { width: number; height: number };
export class ResizeObserverMock {
  static instances = new Set<ResizeObserverMock>();

  private targets = new Set<Element>();

  constructor(private callback: ResizeObserverCallback) {
    ResizeObserverMock.instances.add(this);
  }

  observe(target: Element) {
    this.targets.add(target);
  }

  unobserve(target: Element) {
    this.targets.delete(target);
  }

  disconnect() {
    this.targets.clear();
    ResizeObserverMock.instances.delete(this);
  }

  static trigger(target: Element, size: Size) {
    ResizeObserverMock.instances.forEach((observer) => {
      if (!observer.targets.has(target)) return;
      const entry = {
        target,
        contentRect: {
          ...size, x: 0, y: 0, top: 0, left: 0, right: size.width, bottom: size.height,
        },
        borderBoxSize: [{ inlineSize: size.width, blockSize: size.height }],
        contentBoxSize: [{ inlineSize: size.width, blockSize: size.height }],
      } as unknown as ResizeObserverEntry;
      observer.callback([entry], observer as unknown as ResizeObserver);
    });
  }
}
Object.defineProperty(window, 'ResizeObserver', { configurable: true, writable: true, value: ResizeObserverMock });

// requestAnimationFrame runs on fake-timer-friendly setTimeout so tests can flush frames with timers.
window.requestAnimationFrame = (cb: FrameRequestCallback) => window.setTimeout(() => cb(performance.now()), 16);
window.cancelAnimationFrame = (id: number) => window.clearTimeout(id);

afterEach(() => {
  // Testing Library auto-cleans only when the runner exposes globals, which this config does not.
  cleanup();
  resetMeetingClientSettings();
  sessionStorage.clear();
  localStorage.clear();
  vi.useRealTimers();
});
