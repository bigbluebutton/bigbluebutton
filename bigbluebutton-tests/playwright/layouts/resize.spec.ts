import { expect } from '@playwright/test';

import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { test } from '../core/setup/fixtures';
import { waitForStableGeometry } from './geometry/regions';
import {
  box,
  DOCK_HANDLE,
  DOCK_POSITIONS,
  DockPosition,
  dockSize,
  findHandle,
  minimizePresentation,
  moveDock,
  MULTI_FUNCTIONAL_MODE,
  openAuxiliaryWithUserList,
  openClient,
  resizeBy,
  restorePresentation,
  shareWebcam,
  SIDEBAR_AUX_HANDLE,
  SIDEBAR_CONTENT_HANDLE,
} from './layoutDriver';

// Characterization of every resize handle as it behaves today. Measurements are rendered boxes,
// so the same assertions hold for the CSS layout.

const PRESENTATION = '[data-test="presentationContainer"]';
const SIDEBAR_PANEL = '[data-test="sidebarContentMain"]';
const AUX_PANEL = '[data-test="sidebarContentAuxiliary"]';
const PX = 2;

const isHorizontal = (position: DockPosition) => position === 'contentLeft' || position === 'contentRight';

// When a resize stops, the dock stores the size it rendered as a share of its area (BBB_cameraDockSize),
// so it stays where the drag left it. (Until then a left/right dock ended 1vw short of the drag.)

// The box that gives way when the dock grows: the presentation, or the sidebar panel for the sidebar dock
async function counterpartSize(page: Page, position: DockPosition): Promise<number> {
  if (position === 'sidebarContentBottom') return (await box(page.page, SIDEBAR_PANEL))!.height;
  const presentation = (await box(page.page, PRESENTATION))!;
  return isHorizontal(position) ? presentation.width : presentation.height;
}

async function presenterWithCamera(
  browser: Parameters<typeof openClient>[0],
  testInfo: Parameters<typeof openClient>[1],
  options = {},
) {
  const mod = await openClient(browser, testInfo, { fullName: 'Presenter', ...options });
  await shareWebcam(mod);
  return mod;
}

test.describe('Camera dock resize', { tag: ['@layout', '@media'] }, () => {
  for (const position of DOCK_POSITIONS) {
    test(`At ${position}, the dock follows the handle and the counterpart gives way`, async ({ browser }, testInfo) => {
      const mod = await presenterWithCamera(browser, testInfo);
      await moveDock(mod.page, position);
      const dock0 = await dockSize(mod.page);
      const other0 = await counterpartSize(mod, position);

      await resizeBy(mod.page, DOCK_HANDLE, '#cameraDock', 120);
      const dock1 = await dockSize(mod.page);
      const other1 = await counterpartSize(mod, position);
      expect(Math.abs(dock1 - dock0 - 120), 'the dock grows by the drag').toBeLessThanOrEqual(PX);
      expect(Math.abs(other0 - other1 - (dock1 - dock0)), 'the counterpart shrinks by as much').toBeLessThanOrEqual(PX);

      await resizeBy(mod.page, DOCK_HANDLE, '#cameraDock', -60);
      const dock2 = await dockSize(mod.page);
      expect(Math.abs(dock1 - dock2 - 60), 'the dock shrinks by the drag').toBeLessThanOrEqual(PX);
      expect(Math.abs((await counterpartSize(mod, position)) - other1 - (dock1 - dock2))).toBeLessThanOrEqual(PX);
    });
  }

  test('Top and bottom docks clamp at 120 px and at 80% of the media height', async ({ browser }, testInfo) => {
    const mod = await presenterWithCamera(browser, testInfo);
    for (const position of ['contentTop', 'contentBottom'] as DockPosition[]) {
      // eslint-disable-next-line no-await-in-loop
      await moveDock(mod.page, position);
      // the media area is the dock, the 10 px gap and the presentation
      // eslint-disable-next-line no-await-in-loop
      const media = (await dockSize(mod.page)) + 10 + (await counterpartSize(mod, position));
      // eslint-disable-next-line no-await-in-loop
      await resizeBy(mod.page, DOCK_HANDLE, '#cameraDock', 1200);
      // eslint-disable-next-line no-await-in-loop
      expect(Math.abs((await dockSize(mod.page)) - 0.8 * media), `${position} max`).toBeLessThanOrEqual(PX);
      // eslint-disable-next-line no-await-in-loop
      await resizeBy(mod.page, DOCK_HANDLE, '#cameraDock', -1500);
      // eslint-disable-next-line no-await-in-loop
      expect(Math.abs((await dockSize(mod.page)) - 120), `${position} min`).toBeLessThanOrEqual(PX);
    }
  });

  test("Left and right docks clamp at 120 px and at the presenter's limit", async ({ browser }, testInfo) => {
    const mod = await presenterWithCamera(browser, testInfo);
    const vw = mod.page.viewportSize()!.width;
    for (const position of ['contentRight', 'contentLeft'] as DockPosition[]) {
      // eslint-disable-next-line no-await-in-loop
      await moveDock(mod.page, position);
      // the media area is the dock, the 20 px gap and the presentation
      // eslint-disable-next-line no-await-in-loop
      const media = (await dockSize(mod.page)) + 20 + (await counterpartSize(mod, position));
      // eslint-disable-next-line no-await-in-loop
      await resizeBy(mod.page, DOCK_HANDLE, '#cameraDock', 1500);
      // the whiteboard toolbar (430 px) and a 10 px gap stay free, minus the 1vw sidebar margin
      const presenterMax = media - 440 - 0.01 * vw;
      // eslint-disable-next-line no-await-in-loop
      expect(Math.abs((await dockSize(mod.page)) - presenterMax), `${position} presenter max`).toBeLessThanOrEqual(PX);
      // eslint-disable-next-line no-await-in-loop
      await resizeBy(mod.page, DOCK_HANDLE, '#cameraDock', -1500);
      // eslint-disable-next-line no-await-in-loop
      expect(Math.abs((await dockSize(mod.page)) - 120), `${position} min`).toBeLessThanOrEqual(PX);
    }
  });

  test('The sidebar dock clamps at 120 px and at the window height minus 300 px', async ({ browser }, testInfo) => {
    const mod = await presenterWithCamera(browser, testInfo);
    await moveDock(mod.page, 'sidebarContentBottom');
    await resizeBy(mod.page, DOCK_HANDLE, '#cameraDock', 1500);
    expect(Math.abs((await dockSize(mod.page)) - (mod.page.viewportSize()!.height - 300))).toBeLessThanOrEqual(PX);
    await resizeBy(mod.page, DOCK_HANDLE, '#cameraDock', -1500);
    expect(Math.abs((await dockSize(mod.page)) - 120)).toBeLessThanOrEqual(PX);
  });

  test('The resized dock size persists in the tab across a new join (BBB_cameraDockSize)', async ({
    browser,
  }, testInfo) => {
    const mod = await presenterWithCamera(browser, testInfo);
    await resizeBy(mod.page, DOCK_HANDLE, '#cameraDock', 150);
    const resized = await dockSize(mod.page);
    const stored = await mod.page.evaluate(() => sessionStorage.getItem('BBB_cameraDockSize'));
    const { height } = JSON.parse(stored ?? 'null') as { height: number };
    expect(height, 'the size is stored, as a share of the dock area, when the resize stops').toBeGreaterThan(0);
    expect(height).toBeLessThanOrEqual(1);
    // a join token is single-use, so the "reload" is a new join in the same tab: sessionStorage stays
    const again = new Page(browser, mod.page, testInfo);
    await again.init(true, { testInfo, meetingId: mod.meetingId, fullName: 'Presenter' });
    await shareWebcam(again);
    expect(
      Math.abs((await dockSize(again.page)) - resized),
      'the dock comes back at the stored size',
    ).toBeLessThanOrEqual(PX);
  });

  for (const position of ['contentLeft', 'contentRight'] as const) {
    test(`A ${position} dock keeps its width across a presentation minimize and restore`, async ({
      browser,
    }, testInfo) => {
      // While the presentation is minimized the dock fills the media area; no side-dock limit applies
      // there, and nothing may be stored as the user's size.
      const mod = await presenterWithCamera(browser, testInfo);
      await moveDock(mod.page, position);
      const before = await dockSize(mod.page);
      await minimizePresentation(mod);
      await waitForStableGeometry(mod.page);
      await restorePresentation(mod);
      await waitForStableGeometry(mod.page);
      await mod.page.waitForTimeout(1000);
      expect(Math.abs((await dockSize(mod.page)) - before), 'the dock comes back at its width').toBeLessThanOrEqual(PX);
    });
  }

  test('With two cameras, a top dock taller than its grid snaps down to the grid', async ({ browser }, testInfo) => {
    const mod = await presenterWithCamera(browser, testInfo);
    const attendee = await openClient(browser, testInfo, {
      isModerator: false,
      fullName: 'Attendee',
      meetingId: mod.meetingId,
    });
    await shareWebcam(attendee);
    await expect(mod.page.locator(e.webcamVideoItem)).toHaveCount(2, { timeout: 30_000 });
    await waitForStableGeometry(mod.page);
    const media = (await dockSize(mod.page)) + 10 + (await counterpartSize(mod, 'contentTop'));
    await resizeBy(mod.page, DOCK_HANDLE, '#cameraDock', 1200);
    // the snap runs 100 ms after the resize stops
    await mod.page.waitForTimeout(300);
    await waitForStableGeometry(mod.page);
    const dock = (await box(mod.page, '#cameraDock'))!;
    const tiles = mod.page.locator(e.webcamVideoItem);
    const tileHeight = (await tiles.first().boundingBox())!.height;
    expect(dock.height, 'snapped below the 80% maximum').toBeLessThan(0.8 * media - 12);
    expect(dock.height - tileHeight, 'the dock hugs its grid').toBeLessThanOrEqual(12);
  });
});

test.describe('Sidebar resize', { tag: ['@layout', '@ci'] }, () => {
  test('The sidebar content resizes between 283.2 and 800 px, less the 1vw margin', async ({ browser }, testInfo) => {
    const mod = await openClient(browser, testInfo);
    const vw = mod.page.viewportSize()!.width;
    const handle = await findHandle(mod.page, SIDEBAR_CONTENT_HANDLE, SIDEBAR_PANEL);
    expect(handle?.edge, 'the handle sits on the inline-end edge').toBe('right');
    const before = (await box(mod.page, SIDEBAR_PANEL))!;
    const presentation0 = (await box(mod.page, PRESENTATION))!;
    await resizeBy(mod.page, SIDEBAR_CONTENT_HANDLE, SIDEBAR_PANEL, 120);
    const grown = (await box(mod.page, SIDEBAR_PANEL))!;
    expect(Math.abs(grown.width - before.width - 120)).toBeLessThanOrEqual(PX);
    expect(
      Math.abs(presentation0.width - (await box(mod.page, PRESENTATION))!.width - 120),
      'the media gives way',
    ).toBeLessThanOrEqual(PX);
    await resizeBy(mod.page, SIDEBAR_CONTENT_HANDLE, SIDEBAR_PANEL, 1500);
    expect(Math.abs((await box(mod.page, SIDEBAR_PANEL))!.width - (800 - 0.01 * vw)), 'max').toBeLessThanOrEqual(PX);
    await resizeBy(mod.page, SIDEBAR_CONTENT_HANDLE, SIDEBAR_PANEL, -1500);
    expect(Math.abs((await box(mod.page, SIDEBAR_PANEL))!.width - (283.2 - 0.01 * vw)), 'min').toBeLessThanOrEqual(PX);
  });

  test('The auxiliary sidebar resizes with the same limits', async ({ browser }, testInfo) => {
    const mod = await openClient(browser, testInfo, { clientSettingsOverrides: MULTI_FUNCTIONAL_MODE });
    await openAuxiliaryWithUserList(mod);
    const vw = mod.page.viewportSize()!.width;
    await resizeBy(mod.page, SIDEBAR_AUX_HANDLE, AUX_PANEL, 1500);
    expect(Math.abs((await box(mod.page, AUX_PANEL))!.width - (800 - 0.01 * vw)), 'max').toBeLessThanOrEqual(PX);
    // nothing protects the media area: with both panels wide the presentation narrows a lot
    expect((await box(mod.page, PRESENTATION))!.width).toBeLessThan(200);
    await resizeBy(mod.page, SIDEBAR_AUX_HANDLE, AUX_PANEL, -1500);
    expect(Math.abs((await box(mod.page, AUX_PANEL))!.width - (283.2 - 0.01 * vw)), 'min').toBeLessThanOrEqual(PX);
  });

  test('In RTL the sidebar handle sits on the left edge and mirrors the drag', async ({ browser }, testInfo) => {
    const mod = await openClient(browser, testInfo, { joinParameter: 'userdata-bbb_override_default_locale=ar' });
    const handle = await findHandle(mod.page, SIDEBAR_CONTENT_HANDLE, SIDEBAR_PANEL);
    expect(handle?.edge).toBe('left');
    const before = (await box(mod.page, SIDEBAR_PANEL))!;
    await resizeBy(mod.page, SIDEBAR_CONTENT_HANDLE, SIDEBAR_PANEL, 120);
    const after = (await box(mod.page, SIDEBAR_PANEL))!;
    expect(Math.abs(after.width - before.width - 120)).toBeLessThanOrEqual(PX);
    expect(Math.abs(after.x + after.width - (before.x + before.width)), 'the right edge stays').toBeLessThanOrEqual(PX);
  });
});

test.describe('Resize and drag by device', { tag: ['@layout', '@media'] }, () => {
  test('RTL: a dock at contentRight sits on the left and grows rightwards', async ({ browser }, testInfo) => {
    const mod = await presenterWithCamera(browser, testInfo, {
      joinParameter: 'userdata-bbb_override_default_locale=ar',
    });
    await moveDock(mod.page, 'contentRight');
    const dock = (await box(mod.page, '#cameraDock'))!;
    expect(dock.x, 'contentRight is mirrored to the left').toBeLessThan(mod.page.viewportSize()!.width / 2);
    expect((await findHandle(mod.page, DOCK_HANDLE, '#cameraDock'))?.edge).toBe('right');
    const before = await dockSize(mod.page);
    await resizeBy(mod.page, DOCK_HANDLE, '#cameraDock', 100);
    expect(Math.abs((await dockSize(mod.page)) - before - 100)).toBeLessThanOrEqual(PX);
  });

  test('Tablet (1024x768): the sidebar resizes and the dock resizes and drags', async ({ browser }, testInfo) => {
    const mod = await presenterWithCamera(browser, testInfo, { profile: { width: 1024, height: 768 } });
    const panel = (await box(mod.page, SIDEBAR_PANEL))!;
    await resizeBy(mod.page, SIDEBAR_CONTENT_HANDLE, SIDEBAR_PANEL, 80);
    expect(Math.abs((await box(mod.page, SIDEBAR_PANEL))!.width - panel.width - 80)).toBeLessThanOrEqual(PX);
    const dock = await dockSize(mod.page);
    await resizeBy(mod.page, DOCK_HANDLE, '#cameraDock', 80);
    expect(Math.abs((await dockSize(mod.page)) - dock - 80)).toBeLessThanOrEqual(PX);
    await moveDock(mod.page, 'contentLeft');
  });

  test('Phone: no sidebar handle; the dock handle exists but the top dock keeps its default height', async ({
    browser,
  }, testInfo) => {
    const mod = await presenterWithCamera(browser, testInfo, { profile: { width: 390, height: 844, phone: true } });
    await expect(mod.page.locator(SIDEBAR_CONTENT_HANDLE)).toHaveCount(0);
    const handle = await findHandle(mod.page, DOCK_HANDLE, '#cameraDock');
    expect(handle?.edge, 'the handle is rendered').toBe('bottom');
    const before = await dockSize(mod.page);
    await resizeBy(mod.page, DOCK_HANDLE, '#cameraDock', 150);
    expect(Math.abs((await dockSize(mod.page)) - before), 'the drag has no effect').toBeLessThanOrEqual(PX);
    // and the dock cannot be dragged
    await expect(mod.page.locator('#cameraDock')).not.toHaveAttribute('draggable', 'true');
  });
});
