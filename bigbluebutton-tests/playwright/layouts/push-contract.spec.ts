import { expect } from '@playwright/test';

import { test } from '../core/setup/fixtures';
import {
  DOCK_HANDLE,
  dockShareOfArea,
  LayoutPropsMessage,
  minimizePresentation,
  moveDock,
  newDeviceContext,
  openClient,
  recordLayoutProps,
  resizeBy,
  restorePresentation,
  shareWebcam,
} from './layoutDriver';

// The push-layout wire contract: the meetingLayoutSetProps variables. The dock size is a fraction (0-1)
// of the area the dock sits in, along its axis (0 = not set), sent once when a resize ends. Kept apart
// from the behaviour tests (push-layout.spec.ts) because a change of the push contract rewrites these and
// nothing else. The server clamp is covered in layouts.spec.ts. Needs a server with the matching backend.

async function presenterRecording(
  browser: Parameters<typeof openClient>[0],
  testInfo: Parameters<typeof openClient>[1],
) {
  const context = await newDeviceContext(browser);
  const sent = await recordLayoutProps(context);
  const presenter = await openClient(browser, testInfo, { context, fullName: 'Presenter' });
  return { presenter, sent };
}

const settle = (page: import('@playwright/test').Page) => page.waitForTimeout(2000);

test.describe('Push layout contract', { tag: ['@layout', '@media'] }, () => {
  test('The variables of a push carry the unified layout state', async ({ browser }, testInfo) => {
    const { presenter, sent } = await presenterRecording(browser, testInfo);
    await shareWebcam(presenter);
    await settle(presenter.page);
    expect(sent.length, 'the presenter pushes after joining').toBeGreaterThan(0);
    const last = sent[sent.length - 1];
    expect(Object.keys(last).sort()).toEqual(
      [
        'cameraDockSize',
        'cameraPosition',
        'focusedCamera',
        'layout',
        'presentationIsOpen',
        'syncWithPresenterLayout',
      ].sort(),
    );
    expect(last).toMatchObject({
      layout: 'unified',
      syncWithPresenterLayout: true,
      presentationIsOpen: true,
      cameraPosition: 'contentTop',
      focusedCamera: 'none',
      // never resized: not set, the CSS default
      cameraDockSize: 0,
    });
  });

  test('A dock resize sends one push, when it ends, with the share of the area', async ({ browser }, testInfo) => {
    const { presenter, sent } = await presenterRecording(browser, testInfo);
    await shareWebcam(presenter);
    await settle(presenter.page);
    const before = sent.length;
    await resizeBy(presenter.page, DOCK_HANDLE, '#cameraDock', 150);
    await settle(presenter.page);
    const pushes = sent.slice(before);
    expect(pushes, 'nothing during the drag, one push on release').toHaveLength(1);
    // for top, bottom and sidebar docks the size is the dock height over the media area height
    expect(pushes[0].cameraDockSize).toBeCloseTo(await dockShareOfArea(presenter.page), 3);
    expect(pushes[0].cameraDockSize).toBeGreaterThan(0);
    expect(pushes[0].cameraDockSize).toBeLessThanOrEqual(1);
  });

  test('For left and right docks the size is a share of the media area width', async ({ browser }, testInfo) => {
    const { presenter, sent } = await presenterRecording(browser, testInfo);
    await shareWebcam(presenter);
    await moveDock(presenter.page, 'contentLeft');
    await resizeBy(presenter.page, DOCK_HANDLE, '#cameraDock', 100);
    await settle(presenter.page);
    const last: LayoutPropsMessage = sent[sent.length - 1];
    expect(last.cameraPosition).toBe('contentLeft');
    expect(last.cameraDockSize).toBeCloseTo(await dockShareOfArea(presenter.page), 3);
  });

  test('Minimize and restore push presentationIsOpen once each', async ({ browser }, testInfo) => {
    // The number and timing of presentationIsOpen pushes show up in recordings (LayoutBroadcastedEvent).
    const { presenter, sent } = await presenterRecording(browser, testInfo);
    await settle(presenter.page);
    let before = sent.length;
    await minimizePresentation(presenter);
    await settle(presenter.page);
    const onMinimize = sent.slice(before);
    before = sent.length;
    await restorePresentation(presenter);
    await settle(presenter.page);
    const onRestore = sent.slice(before);
    // the avatar dock opening or closing no longer changes the pushed size (the stored share is 0)
    expect(onMinimize.map((m) => [m.presentationIsOpen, m.cameraDockSize])).toEqual([[false, 0]]);
    expect(onRestore.map((m) => [m.presentationIsOpen, m.cameraDockSize])).toEqual([[true, 0]]);
  });
});
