import { expect, Page as PlaywrightPage } from '@playwright/test';

import { elements as e } from '../core/elements';
import { test } from '../core/setup/fixtures';
import { captureGeometry, waitForStableGeometry } from './geometry/regions';
import { box, closeToasts, dockPosition, openClient, shareWebcam, webcamsFullscreen } from './layoutDriver';

// Characterization of the layout across device breakpoints, phone orientations, RTL and fullscreen.

const PX = 2;

// Viewport width that gives documentElement.clientWidth exactly `width` (the breakpoints read clientWidth)
async function setClientWidth(page: PlaywrightPage, width: number, height = 768) {
  await page.setViewportSize({ width, height });
  const scrollbar = await page.evaluate(() => window.innerWidth - document.documentElement.clientWidth);
  if (scrollbar) await page.setViewportSize({ width: width + scrollbar, height });
  await waitForStableGeometry(page);
  expect(await page.evaluate(() => document.documentElement.clientWidth)).toBe(width);
}

const isPhoneLayout = (page: PlaywrightPage) => page.locator(e.toggleSidebarNavigation).isVisible();

test.describe('Device breakpoints', { tag: ['@layout', '@ci'] }, () => {
  test('Crossing 599/600, 899/900 and 1199/1200 keeps each side of the breakpoint consistent', async ({
    browser,
  }, testInfo) => {
    const mod = await openClient(browser, testInfo);
    for (const width of [1200, 1199, 900, 899, 600, 599, 600, 1200]) {
      // eslint-disable-next-line no-await-in-loop
      await setClientWidth(mod.page, width);
      // eslint-disable-next-line no-await-in-loop
      const phone = await isPhoneLayout(mod.page);
      expect(phone, `${width}px: phone layout`).toBe(width < 600);
      if (!phone) {
        // eslint-disable-next-line no-await-in-loop
        const { regions } = await captureGeometry(mod.page);
        // the sidebar keeps its clamp(283.2px, 20vw, 800px) box on every non-phone width
        const expected = Math.min(800, Math.max(283.2, 0.2 * width));
        expect(Math.abs(regions.sidebarContent!.width - expected), `${width}px: sidebar width`).toBeLessThanOrEqual(PX);
        expect(regions.sidebarNavigation?.visible, `${width}px: navigation rail`).toBe(true);
      }
    }
  });
});

test.describe('Phone orientation', { tag: ['@layout', '@media'] }, () => {
  test('Turning a phone sideways docks the cameras on the right, and back on top', async ({ browser }, testInfo) => {
    const mod = await openClient(browser, testInfo, { profile: { width: 390, height: 844, phone: true } });
    await shareWebcam(mod);
    expect(await dockPosition(mod.page)).toBe('contentTop');
    await mod.page.setViewportSize({ width: 844, height: 390 });
    await waitForStableGeometry(mod.page);
    await expect.poll(() => dockPosition(mod.page), { message: 'side by side in landscape' }).toBe('contentRight');
    const dock = (await box(mod.page, '#cameraDock'))!;
    const presentation = (await box(mod.page, '[data-test="presentationContainer"]'))!;
    expect(dock.x, 'the dock is on the right of the presentation').toBeGreaterThan(
      presentation.x + presentation.width - PX,
    );
    await mod.page.setViewportSize({ width: 390, height: 844 });
    await waitForStableGeometry(mod.page);
    await expect.poll(() => dockPosition(mod.page), { message: 'back on top in portrait' }).toBe('contentTop');
  });
});

test.describe('RTL', { tag: ['@layout', '@ci'] }, () => {
  test('An RTL locale mirrors the regions', async ({ browser }, testInfo) => {
    const mod = await openClient(browser, testInfo, { joinParameter: 'userdata-bbb_override_default_locale=ar' });
    const { regions, viewport } = await captureGeometry(mod.page);
    expect(await mod.page.evaluate(() => document.documentElement.dir || document.body.dir)).toBe('rtl');
    const nav = regions.sidebarNavigation!;
    const panel = regions.sidebarContent!;
    const media = regions.presentation!;
    expect(nav.x + nav.width, 'the navigation rail is on the right').toBeGreaterThan(viewport.width - 100);
    expect(panel.x + panel.width, 'the panel is left of the rail').toBeLessThanOrEqual(nav.x + PX);
    expect(media.x + media.width, 'the media area is left of the panel').toBeLessThanOrEqual(panel.x + PX);
  });
});

test.describe('Fullscreen', { tag: ['@layout', '@media'] }, () => {
  test('Presentation fullscreen fills the window', async ({ browser }, testInfo) => {
    const mod = await openClient(browser, testInfo);
    await closeToasts(mod.page);
    await mod.waitAndClick(e.whiteboardOptionsButton);
    await mod.waitAndClick(e.presentationFullscreen);
    await expect.poll(() => mod.page.evaluate(() => !!document.fullscreenElement)).toBe(true);
    await waitForStableGeometry(mod.page);
    const presentation = (await box(mod.page, '[data-test="presentationContainer"]'))!;
    const viewport = mod.page.viewportSize()!;
    expect(Math.abs(presentation.width - viewport.width)).toBeLessThanOrEqual(PX);
    expect(Math.abs(presentation.height - viewport.height)).toBeLessThanOrEqual(PX);
  });

  test('Webcams fullscreen: the dock covers the window', async ({ browser }, testInfo) => {
    const mod = await openClient(browser, testInfo);
    await shareWebcam(mod);
    await webcamsFullscreen(mod);
    const dock = (await box(mod.page, '#cameraDock'))!;
    const viewport = mod.page.viewportSize()!;
    expect(dock).toMatchObject({ x: 0, y: 0, width: viewport.width, height: viewport.height });
    // and it is on top: the element at the centre of the window belongs to the dock
    expect(
      await mod.page.evaluate(() =>
        document
          .querySelector('#cameraDock')!
          .contains(document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2)),
      ),
    ).toBe(true);
  });
});
