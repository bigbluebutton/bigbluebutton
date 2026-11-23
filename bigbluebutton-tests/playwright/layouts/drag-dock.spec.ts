import { expect } from '@playwright/test';

import { test } from '../core/setup/fixtures';
import { waitForStableGeometry } from './geometry/regions';
import {
  box,
  DOCK_POSITIONS,
  moveDock,
  MULTI_FUNCTIONAL_MODE,
  openAuxiliaryWithUserList,
  openClient,
  shareWebcam,
  startDockDrag,
  toggleChatPanel,
} from './layoutDriver';

// Characterization of dragging the camera dock between its five drop zones.

const PX = 2;
const near = (a: number, b: number) => Math.abs(a - b) <= PX;

const zoneBoxes = (page: import('@playwright/test').Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('[data-test^="dropArea-"]')).map((zone) => {
      const r = zone.getBoundingClientRect();
      return { id: zone.id, visible: r.width > 0 && r.height > 0 && getComputedStyle(zone).display !== 'none' };
    }),
  );

test.describe('Camera dock drag', { tag: ['@layout', '@media'] }, () => {
  test('Each drop zone moves the dock there, next to the media area', async ({ browser }, testInfo) => {
    const mod = await openClient(browser, testInfo);
    await shareWebcam(mod);
    // today #layout carries data-cam-position only once the dock has moved
    expect(await mod.page.locator('#layout').getAttribute('data-cam-position')).toBeNull();
    for (const position of [
      'contentRight',
      'contentBottom',
      'contentLeft',
      'sidebarContentBottom',
      'contentTop',
    ] as const) {
      // eslint-disable-next-line no-await-in-loop
      await moveDock(mod.page, position);
      // eslint-disable-next-line no-await-in-loop
      await expect(mod.page.locator('#layout')).toHaveAttribute('data-cam-position', position);
      /* eslint-disable no-await-in-loop */
      const dock = (await box(mod.page, '#cameraDock'))!;
      const presentation = (await box(mod.page, '[data-test="presentationContainer"]'))!;
      const navBar = (await box(mod.page, 'header#Navbar'))!;
      const actionsBar = (await box(mod.page, 'section#ActionsBar'))!;
      const panel = (await box(mod.page, '[data-test="sidebarContentMain"]'))!;
      /* eslint-enable no-await-in-loop */
      const where = `dock at ${position}`;
      if (position === 'contentTop') {
        expect(near(dock.y, navBar.y + navBar.height), where).toBe(true);
        expect(near(presentation.y, dock.y + dock.height + 10), `${where}: 10 px gap`).toBe(true);
      } else if (position === 'contentBottom') {
        expect(near(dock.y + dock.height, actionsBar.y), where).toBe(true);
        // today the presentation then starts 10 px above the nav bar's bottom edge
        expect(near(presentation.y, navBar.y + navBar.height - 10), `${where}: presentation offset`).toBe(true);
        expect(near(presentation.y + presentation.height + 20, dock.y), `${where}: 20 px gap`).toBe(true);
      } else if (position === 'contentRight') {
        expect(near(dock.x + dock.width, navBar.x + navBar.width), where).toBe(true);
        expect(near(presentation.x + presentation.width + 20, dock.x), `${where}: 20 px gap`).toBe(true);
      } else if (position === 'contentLeft') {
        expect(near(dock.x, navBar.x), where).toBe(true);
        expect(near(dock.x + dock.width + 20, presentation.x), `${where}: 20 px gap`).toBe(true);
      } else {
        expect(near(dock.x, panel.x) && near(dock.width, panel.width), `${where}: under the sidebar panel`).toBe(true);
        expect(dock.y, `${where}: below the panel`).toBeGreaterThanOrEqual(panel.y + panel.height - PX);
        expect(near(presentation.width, navBar.width), `${where}: the media keeps its width`).toBe(true);
      }
    }
  });

  test('The drop zones show only while dragging, and the dock shrinks to one tile', async ({ browser }, testInfo) => {
    const mod = await openClient(browser, testInfo);
    await shareWebcam(mod);
    expect(await zoneBoxes(mod.page)).toEqual([]);
    await startDockDrag(mod.page);
    const zones = await zoneBoxes(mod.page);
    expect(zones.map((z) => z.id).sort()).toEqual([...DOCK_POSITIONS].sort());
    expect(zones.every((z) => z.visible)).toBe(true);
    const dragged = (await box(mod.page, '#cameraDock'))!;
    expect(await mod.page.evaluate(() => getComputedStyle(document.querySelector('#cameraDock')!).opacity)).toBe('0.5');
    expect(await mod.page.evaluate(() => getComputedStyle(document.body).overflow)).toBe('hidden');
    expect(dragged.width, 'one tile wide').toBeLessThan(200);
    await mod.page.mouse.up();
    await waitForStableGeometry(mod.page);
    expect(await zoneBoxes(mod.page)).toEqual([]);
  });

  test('The sidebar zone is not available while the sidebar is closed', async ({ browser }, testInfo) => {
    const mod = await openClient(browser, testInfo);
    await shareWebcam(mod);
    await toggleChatPanel(mod);
    await startDockDrag(mod.page);
    const zones = await zoneBoxes(mod.page);
    expect(zones.find((z) => z.id === 'sidebarContentBottom')?.visible ?? false).toBe(false);
    expect(
      zones
        .filter((z) => z.visible)
        .map((z) => z.id)
        .sort(),
    ).toEqual(['contentBottom', 'contentLeft', 'contentRight', 'contentTop']);
    await mod.page.mouse.up();
  });

  test('The sidebar zone is not available while the auxiliary panel is open', async ({ browser }, testInfo) => {
    const mod = await openClient(browser, testInfo, { clientSettingsOverrides: MULTI_FUNCTIONAL_MODE });
    await openAuxiliaryWithUserList(mod);
    await shareWebcam(mod);
    await startDockDrag(mod.page);
    const zones = await zoneBoxes(mod.page);
    expect(zones.find((z) => z.id === 'sidebarContentBottom')?.visible ?? false).toBe(false);
    await mod.page.mouse.up();
  });

  test('Moving the dock keeps its video elements (no remount)', async ({ browser }, testInfo) => {
    const mod = await openClient(browser, testInfo);
    await shareWebcam(mod);
    await mod.page.evaluate(() => {
      (
        document.querySelector('video[data-local-stream="true"]') as HTMLVideoElement & { layoutProbe?: string }
      ).layoutProbe = 'kept';
    });
    for (const position of [
      'contentRight',
      'contentBottom',
      'contentLeft',
      'sidebarContentBottom',
      'contentTop',
    ] as const) {
      // eslint-disable-next-line no-await-in-loop
      await moveDock(mod.page, position);
      // eslint-disable-next-line no-await-in-loop
      const kept = await mod.page.evaluate(
        () =>
          (document.querySelector('video[data-local-stream="true"]') as HTMLVideoElement & { layoutProbe?: string })
            ?.layoutProbe,
      );
      expect(kept, `the same video element after moving to ${position}`).toBe('kept');
    }
  });
});
