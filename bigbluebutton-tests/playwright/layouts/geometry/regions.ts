import type { Page as PlaywrightPage } from '@playwright/test';

// The page regions whose boxes the geometry goldens pin. Selectors use ids, data-test hooks and the
// documented bbb-* classes, which stay stable across the layout refactor.
export const REGIONS = {
  navBar: 'header#Navbar',
  actionsBar: 'section#ActionsBar',
  sidebarNavigation: '[data-test="navigationSidebarContainer"]',
  // the outer sidebar box, and the resizable inner panel (which carries bbb-sidebar-content__panel)
  sidebarContent: '.bbb-sidebar-content:has(> [data-test="sidebarContentMain"])',
  sidebarContentPanel: '[data-test="sidebarContentMain"]',
  sidebarContentAuxiliary: '.bbb-sidebar-content-auxiliary',
  sidebarContentAuxiliaryPanel: '[data-test="sidebarContentAuxiliary"]',
  cameraDock: '#cameraDock',
  presentation: '[data-test="presentationContainer"]',
  screenShare: '#screenshareContainer',
  externalVideo: '[data-test="videoPlayer"]',
  genericContent: '[data-test^="container-"]',
  pinnedNotes: '[data-test="notes"]',
} as const;

// Regions that can appear more than once: every match is captured, in DOM order.
export const MULTI_REGIONS = {
  banners: '[data-test="notificationBannerBar"]',
  dropZones: '[data-test^="dropArea-"]',
} as const;

export type RegionName = keyof typeof REGIONS | keyof typeof MULTI_REGIONS;

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  id?: string;
}

export interface Geometry {
  viewport: { width: number; height: number };
  attributes: Record<string, string>;
  regions: Partial<Record<keyof typeof REGIONS, Box | null>>;
  multi: Partial<Record<keyof typeof MULTI_REGIONS, Box[]>>;
}

/** Reads every region's box (rounded to whole px) and visibility, plus #layout's data attributes. */
export async function captureGeometry(page: PlaywrightPage): Promise<Geometry> {
  return page.evaluate(
    ({ single, multi }) => {
      const read = (element: Element): Box => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        const box: Box = {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          visible:
            rect.width > 0 &&
            rect.height > 0 &&
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            Number(style.opacity) > 0,
        };
        if (element.id) box.id = element.id;
        return box;
      };
      const regions: Record<string, Box | null> = {};
      Object.entries(single).forEach(([name, selector]) => {
        const element = document.querySelector(selector);
        regions[name] = element ? read(element) : null;
      });
      const multiBoxes: Record<string, Box[]> = {};
      Object.entries(multi).forEach(([name, selector]) => {
        multiBoxes[name] = Array.from(document.querySelectorAll(selector)).map(read);
      });
      const layout = document.querySelector<HTMLElement>('#layout');
      return {
        viewport: { width: window.innerWidth, height: window.innerHeight },
        attributes: layout ? ({ ...layout.dataset } as Record<string, string>) : {},
        regions,
        multi: multiBoxes,
      };
    },
    { single: REGIONS as Record<string, string>, multi: MULTI_REGIONS as Record<string, string> },
  ) as Promise<Geometry>;
}

/**
 * Waits until every region's box is unchanged for 3 consecutive animation frames and at least
 * 300 ms: the layout has settled. No fixed waits. Throws when it does not settle in `timeout` ms.
 */
export async function waitForStableGeometry(page: PlaywrightPage, timeout = 20_000): Promise<void> {
  const settled = await page.evaluate(
    async ({ selectors, limit }) => {
      const snapshot = () =>
        JSON.stringify(
          selectors.map((selector) =>
            Array.from(document.querySelectorAll(selector)).map((element) => {
              const rect = element.getBoundingClientRect();
              return [rect.x, rect.y, rect.width, rect.height].map(Math.round);
            }),
          ),
        );
      const nextFrame = () =>
        new Promise((resolve) => {
          requestAnimationFrame(resolve);
        });
      const start = performance.now();
      let last = snapshot();
      let sameFrames = 0;
      let stableSince = performance.now();
      while (performance.now() - start < limit) {
        // eslint-disable-next-line no-await-in-loop
        await nextFrame();
        const current = snapshot();
        if (current === last) {
          sameFrames += 1;
          if (sameFrames >= 3 && performance.now() - stableSince >= 300) return true;
        } else {
          last = current;
          sameFrames = 0;
          stableSince = performance.now();
        }
      }
      return false;
    },
    { selectors: [...Object.values(REGIONS), ...Object.values(MULTI_REGIONS)], limit: timeout },
  );
  if (!settled) throw new Error(`layout geometry did not settle within ${timeout} ms`);
}

// the documented #layout attributes custom CSS and the e2e suite may select (dataset keys)
const CONTRACT_ATTRIBUTES = ['layout', 'camPosition'];

export interface DiffEntry {
  region: string;
  expected: Box | null | undefined;
  actual: Box | null | undefined;
  reason: string;
}

/** Compares two geometries region by region; every edge may move by at most `tolerance` px. */
export function diffGeometry(
  expected: Geometry,
  actual: Geometry,
  tolerance = 2,
  perRegionTolerance: Record<string, number> = {},
): DiffEntry[] {
  const diffs: DiffEntry[] = [];
  const compare = (region: string, want: Box | null | undefined, got: Box | null | undefined) => {
    const limit = perRegionTolerance[region] ?? tolerance;
    if (!want || !got) {
      if (!!want !== !!got) diffs.push({ region, expected: want, actual: got, reason: 'presence differs' });
      return;
    }
    if (want.visible !== got.visible) {
      diffs.push({ region, expected: want, actual: got, reason: 'visibility differs' });
      return;
    }
    if (!want.visible) return; // a hidden region's box is not part of the contract
    // compare edges: left, top, right, bottom
    const edges = (b: Box) => [b.x, b.y, b.x + b.width, b.y + b.height];
    const [we, ge] = [edges(want), edges(got)];
    const moved = we.map((value, i) => Math.abs(value - ge[i]));
    if (moved.some((delta) => delta > limit)) {
      diffs.push({ region, expected: want, actual: got, reason: `an edge moved by ${Math.max(...moved)} px` });
    }
  };
  (Object.keys({ ...expected.regions, ...actual.regions }) as (keyof typeof REGIONS)[]).forEach((region) =>
    compare(region, expected.regions[region], actual.regions[region]),
  );
  (Object.keys({ ...expected.multi, ...actual.multi }) as (keyof typeof MULTI_REGIONS)[]).forEach((region) => {
    const want = expected.multi[region] ?? [];
    const got = actual.multi[region] ?? [];
    if (want.length !== got.length) {
      diffs.push({ region, expected: undefined, actual: undefined, reason: `count ${want.length} vs ${got.length}` });
      return;
    }
    want.forEach((box, i) => compare(`${region}[${box.id ?? i}]`, box, got[i]));
  });
  // #layout's contract attributes (data-layout, data-cam-position); attributes a build adds are not compared
  CONTRACT_ATTRIBUTES.forEach((name) => {
    if (expected.attributes[name] !== actual.attributes[name]) {
      diffs.push({
        region: `#layout[data-${name}]`,
        expected: undefined,
        actual: undefined,
        reason: `${expected.attributes[name]} vs ${actual.attributes[name]}`,
      });
    }
  });
  return diffs;
}
