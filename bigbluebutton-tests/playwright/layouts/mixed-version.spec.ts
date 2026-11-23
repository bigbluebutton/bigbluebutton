import { Browser, expect, TestInfo } from '@playwright/test';

import { clientBuildLabel } from '../core/clientBuild';
import { test } from '../core/setup/fixtures';
import { waitForStableGeometry } from './geometry/regions';
import {
  DOCK_HANDLE,
  dockPosition,
  dockSize,
  minimizePresentation,
  moveDock,
  openClient,
  resizeBy,
  restorePresentation,
  shareWebcam,
} from './layoutDriver';

// Old and new clients in one meeting, both as presenter and as follower: the push assertions of
// push-layout.spec.ts with each page served a different build (core/clientBuild.ts). Runs only when
// BBB_CLIENT_DIST_OLD and BBB_CLIENT_DIST_NEW are set; with both set to the same build it proves the
// harness.

const OLD = process.env.BBB_CLIENT_DIST_OLD;
const NEW = process.env.BBB_CLIENT_DIST_NEW;
const PX = 2;

async function pushIsFollowed(browser: Browser, testInfo: TestInfo, presenterDist: string, viewerDist: string) {
  const presenter = await openClient(browser, testInfo, { fullName: 'Presenter', clientDist: presenterDist });
  await shareWebcam(presenter);
  const viewer = await openClient(browser, testInfo, {
    fullName: 'Viewer',
    isModerator: false,
    meetingId: presenter.meetingId,
    clientDist: viewerDist,
  });
  await viewer.page.locator('#cameraDock').waitFor();
  const viewport = viewer.page.viewportSize()!;

  await minimizePresentation(presenter);
  await expect.poll(() => viewer.page.locator('[data-test="presentationContainer"]').isVisible()).toBe(false);
  await restorePresentation(presenter);
  await expect.poll(() => viewer.page.locator('[data-test="presentationContainer"]').isVisible()).toBe(true);

  await moveDock(presenter.page, 'contentBottom');
  await expect.poll(() => dockPosition(viewer.page)).toBe('contentBottom');

  await resizeBy(presenter.page, DOCK_HANDLE, '#cameraDock', 150);
  const size = await dockSize(presenter.page);
  await waitForStableGeometry(viewer.page);
  // the same bound as push-layout.spec.ts: the rate's two-decimal rounding of the window height
  await expect
    .poll(async () => Math.abs((await dockSize(viewer.page)) - size))
    .toBeLessThanOrEqual(0.005 * viewport.height + PX);
}

test.describe('Mixed client versions in one meeting', { tag: ['@layout', '@media'] }, () => {
  test.skip(!OLD || !NEW, 'BBB_CLIENT_DIST_OLD and BBB_CLIENT_DIST_NEW are not both set');

  test('An old presenter and a new viewer', async ({ browser }, testInfo) => {
    testInfo.annotations.push({
      type: 'builds',
      description: `presenter ${clientBuildLabel(OLD!)}, viewer ${clientBuildLabel(NEW!)}`,
    });
    await pushIsFollowed(browser, testInfo, OLD!, NEW!);
  });

  test('A new presenter and an old viewer', async ({ browser }, testInfo) => {
    testInfo.annotations.push({
      type: 'builds',
      description: `presenter ${clientBuildLabel(NEW!)}, viewer ${clientBuildLabel(OLD!)}`,
    });
    await pushIsFollowed(browser, testInfo, NEW!, OLD!);
  });
});
