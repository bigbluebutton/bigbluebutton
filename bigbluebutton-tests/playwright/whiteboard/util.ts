import { expect, type JSHandle, type Page as PlaywrightPage } from 'playwright/test';

import { CI } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';

export type TldrawCamera = { pageId: string; x: number; y: number; z: number };

export type TldrawEditor = {
  getCamera: () => { x: number; y: number; z: number };
  getCurrentPageId: () => string;
  getViewportScreenBounds: () => { w: number; h: number };
  setCamera: (camera: { x: number; y: number; z: number }, options?: { immediate?: boolean }) => void;
};

export async function getTldrawEditor(page: PlaywrightPage): Promise<JSHandle<TldrawEditor>> {
  const editor = await page.evaluateHandle(() => {
    const whiteboard = document.getElementById('whiteboard-element');
    if (!whiteboard) return null;
    const fiberKey = Object.keys(whiteboard as unknown as Record<string, unknown>).find((key) =>
      key.startsWith('__reactFiber'),
    );
    if (!fiberKey) return null;

    type Hook = { memoizedState: unknown; next: Hook | null };
    type Fiber = { memoizedState: Hook | null; return: Fiber | null };
    let fiber = (whiteboard as unknown as Record<string, unknown>)[fiberKey] as Fiber | null;
    while (fiber) {
      let hook = fiber.memoizedState;
      while (hook) {
        const state = hook.memoizedState as { current?: TldrawEditor } | null;
        if (state?.current && typeof state.current.setCamera === 'function') return state.current;
        hook = hook.next;
      }
      fiber = fiber.return;
    }
    return null;
  });
  const isNull = await editor.evaluate((value) => value === null);
  if (isNull) {
    await editor.dispose();
    throw new Error('tldraw editor not found in React fiber tree');
  }
  return editor as JSHandle<TldrawEditor>;
}

export async function getTldrawCamera(page: PlaywrightPage): Promise<TldrawCamera | null> {
  const editor = await getTldrawEditor(page);
  try {
    return await editor.evaluate((value) => ({
      pageId: value.getCurrentPageId(),
      ...value.getCamera(),
    }));
  } finally {
    await editor.dispose();
  }
}

// Drags across the whiteboard with the tool currently selected on `testPage`, from
// 30% to 60% of its width, between the given fractions of its height.
export async function dragAcrossWhiteboard(testPage: Page, fromY: number, toY: number) {
  const wbBox = await testPage.getElementBoundingBox(e.whiteboard);
  if (!wbBox) throw new Error('whiteboard bounding box not available');
  await testPage.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + fromY * wbBox.height);
  await testPage.page.mouse.down();
  await testPage.page.mouse.move(wbBox.x + 0.6 * wbBox.width, wbBox.y + toY * wbBox.height, { steps: 10 });
  await testPage.page.mouse.up();
}

// Leaves one stroke on the slide and the record of a newer, erased one in its
// history. The viewer draws, so every change the presenter's page shows has reached
// it through its own annotation-history stream: nothing is in flight on return.
export async function viewerDrawsTwoStrokesAndErasesOne(modPage: Page, userPage: Page) {
  await modPage.waitAndClick(e.multiUsersWhiteboardOn);
  await userPage.hasElement(e.wbToolbar, 'should display the whiteboard toolbar for the viewer');
  await userPage.waitAndClick(e.wbPencilShape);
  await dragAcrossWhiteboard(userPage, 0.2, 0.3);
  await modPage.waitUntilHaveCountSelector(e.wbDraw, 1);
  await dragAcrossWhiteboard(userPage, 0.6, 0.7);
  await modPage.waitUntilHaveCountSelector(e.wbDraw, 2);
  await userPage.waitAndClick(e.wbEraser);
  await dragAcrossWhiteboard(userPage, 0.6, 0.7);
  await modPage.waitUntilHaveCountSelector(e.wbDraw, 1);
}

export async function snapshotComparison(modPage: Page, userPage: Page, snapshotName: string) {
  if (!CI) {
    // close all toast notifications before taking the screenshot
    await modPage.closeAllToastNotifications();
    await userPage.closeAllToastNotifications();
    // compare the snapshots
    await expect(modPage.page).toHaveScreenshot(`moderator-${snapshotName}.png`, {
      maxDiffPixels: 1000,
    });
    await expect(userPage.page).toHaveScreenshot(`viewer-${snapshotName}.png`, {
      maxDiffPixels: 1000,
    });
  }
}
