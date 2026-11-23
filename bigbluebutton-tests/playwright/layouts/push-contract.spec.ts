import { expect } from '@playwright/test';

import { test } from '../core/setup/fixtures';
import {
  DOCK_HANDLE,
  dockSize,
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

// The push-layout wire contract as today's client sends it: the meetingLayoutSetProps variables.
// Kept apart from the behaviour tests (push-layout.spec.ts) because a change of the push contract
// rewrites these and nothing else. The server clamp is covered in layouts.spec.ts.

const round2 = (value: number) => parseFloat(value.toFixed(2));

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
        'cameraPosition',
        'focusedCamera',
        'isResizing',
        'layout',
        'presentationIsOpen',
        'presentationVideoRate',
        'syncWithPresenterLayout',
      ].sort(),
    );
    expect(last).toMatchObject({
      layout: 'unified',
      syncWithPresenterLayout: true,
      presentationIsOpen: true,
      isResizing: false,
      cameraPosition: 'contentTop',
      focusedCamera: 'none',
    });
    expect(typeof last.presentationVideoRate).toBe('number');
  });

  test('A dock resize sends isResizing true, then false with the final rate', async ({ browser }, testInfo) => {
    const { presenter, sent } = await presenterRecording(browser, testInfo);
    await shareWebcam(presenter);
    await settle(presenter.page);
    const before = sent.length;
    await resizeBy(presenter.page, DOCK_HANDLE, '#cameraDock', 150);
    await settle(presenter.page);
    const pushes = sent.slice(before);
    expect(pushes[0].isResizing, 'the first push starts the resize').toBe(true);
    expect(pushes[pushes.length - 1].isResizing, 'the last push ends it').toBe(false);
    expect(
      pushes.filter((m) => !m.isResizing),
      'exactly one push after the resize stops',
    ).toHaveLength(1);
    // for top, bottom and sidebar docks the rate is the dock height over the window height
    const innerHeight = await presenter.page.evaluate(() => window.innerHeight);
    expect(pushes[pushes.length - 1].presentationVideoRate).toBe(
      round2((await dockSize(presenter.page)) / innerHeight),
    );
    pushes.forEach((m) => {
      expect(m.presentationVideoRate).toBe(round2(m.presentationVideoRate));
      expect(m.presentationVideoRate).toBeGreaterThanOrEqual(0);
      expect(m.presentationVideoRate).toBeLessThanOrEqual(1);
    });
  });

  test('For left and right docks the rate is the dock width over the window width', async ({ browser }, testInfo) => {
    const { presenter, sent } = await presenterRecording(browser, testInfo);
    await shareWebcam(presenter);
    await moveDock(presenter.page, 'contentLeft');
    await resizeBy(presenter.page, DOCK_HANDLE, '#cameraDock', 100);
    await settle(presenter.page);
    const last: LayoutPropsMessage = sent[sent.length - 1];
    const innerWidth = await presenter.page.evaluate(() => window.innerWidth);
    expect(last.cameraPosition).toBe('contentLeft');
    expect(last.isResizing).toBe(false);
    expect(last.presentationVideoRate).toBe(round2((await dockSize(presenter.page)) / innerWidth));
  });

  test('Minimize and restore push presentationIsOpen, with a fixed number of pushes', async ({ browser }, testInfo) => {
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
    expect(onMinimize.map((m) => [m.presentationIsOpen, m.presentationVideoRate])).toEqual(MINIMIZE_PUSHES);
    expect(onRestore.map((m) => [m.presentationIsOpen, m.presentationVideoRate])).toEqual(RESTORE_PUSHES);
  });
});

// [presentationIsOpen, presentationVideoRate] measured on the unchanged client (dist-base), 3 of 3 runs, at
// 1366x768 with no cameras: each change sends the new state first, then again once the avatar dock
// opens or closes and its rate follows.
const MINIMIZE_PUSHES = [
  [false, 0],
  [false, 0.81],
];
const RESTORE_PUSHES = [
  [true, 0.81],
  [true, 0],
];
