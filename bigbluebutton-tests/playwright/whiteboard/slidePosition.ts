import { expect, type Page as PlaywrightPage } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { uploadSinglePresentation } from '../presentation/util';
import { MultiUsers } from '../user/multiusers';
import { getTldrawCamera, getTldrawEditor, type TldrawCamera } from './util';

// Toggling fit-to-width remounts the editor and its mount code moves the camera again
// about a second later; wait for the camera to stop changing.
async function waitForSettledCamera(page: PlaywrightPage, label: string) {
  await expect
    .poll(
      async () => {
        const before = await getTldrawCamera(page);
        await page.waitForTimeout(800);
        const after = await getTldrawCamera(page);
        return JSON.stringify(before) === JSON.stringify(after);
      },
      {
        message: label,
        timeout: ELEMENT_WAIT_LONGER_TIME,
      },
    )
    .toBe(true);
}

export class SlidePosition extends MultiUsers {
  private async waitForExactCamera(pageNumber: number, expected: TldrawCamera[], label: string) {
    const pages = [
      ['presenter', this.modPage.page],
      ['viewer', this.userPage.page],
    ] as const;
    for (const [index, [role, page]] of pages.entries()) {
      await expect
        .poll(async () => getTldrawCamera(page), {
          message: `${role} ${label}`,
          timeout: ELEMENT_WAIT_LONGER_TIME,
        })
        .toMatchObject({
          pageId: `page:${pageNumber}`,
          x: expect.closeTo(expected[index].x, 2),
          y: expect.closeTo(expected[index].y, 2),
          z: expect.closeTo(expected[index].z, 3),
        });
    }
  }

  private async waitForCamera(pageNumber: number, expectedY: number, label: string) {
    for (const [role, page] of [
      ['presenter', this.modPage.page],
      ['viewer', this.userPage.page],
    ] as const) {
      await expect
        .poll(async () => getTldrawCamera(page), {
          message: `${role} ${label}`,
          timeout: ELEMENT_WAIT_LONGER_TIME,
        })
        .toMatchObject({ pageId: `page:${pageNumber}` });
      await expect
        .poll(async () => (await getTldrawCamera(page))?.y, {
          message: `${role} ${label}`,
          timeout: ELEMENT_WAIT_LONGER_TIME,
        })
        .toBeCloseTo(expectedY, 0);
    }
  }

  private async zoomIn(times: number) {
    for (let index = 0; index < times; index += 1) {
      await this.modPage.page.locator(e.zoomInButton).evaluate((button: HTMLButtonElement) => button.click());
      await this.modPage.page.waitForTimeout(700);
    }
  }

  // Pans the presenter to a non-boundary y (wheel pans tend to stop at the pan clamp, which
  // would hide a wrong restore) and returns both cameras once the viewer has followed.
  private async panPresenterTo(y: number, label: string) {
    const editor = await getTldrawEditor(this.modPage.page);
    await editor.evaluate((value, targetY) => {
      const camera = value.getCamera();
      value.setCamera({ ...camera, y: targetY });
    }, y);
    await editor.dispose();
    await expect
      .poll(async () => (await getTldrawCamera(this.userPage.page))?.y, {
        message: `${label} reaches the viewer`,
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toBeCloseTo(y, 0);
    await this.waitForSettledPresenterCamera(`${label} settles for the presenter`);
    await waitForSettledCamera(this.userPage.page, `${label} settles for the viewer`);
    return (await Promise.all([
      getTldrawCamera(this.modPage.page),
      getTldrawCamera(this.userPage.page),
    ])) as TldrawCamera[];
  }

  private async waitForSettledPresenterCamera(label: string) {
    await waitForSettledCamera(this.modPage.page, label);
  }

  // Wheel pans always reach viewers; an API camera write in fit-to-width is only published
  // when the rounded zoom percentage matches the toolbar.
  private async wheelPresenterDown(ticks: number, label: string) {
    const bounds = await this.modPage.page.locator(e.whiteboard).boundingBox();
    if (!bounds) throw new Error('whiteboard bounding box not available');
    await this.modPage.page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    for (let i = 0; i < ticks; i += 1) await this.modPage.page.mouse.wheel(0, 100);
    await this.waitForSettledPresenterCamera(`${label} settles for the presenter`);
    const presenterY = (await getTldrawCamera(this.modPage.page))!.y;
    await expect
      .poll(async () => (await getTldrawCamera(this.userPage.page))?.y, {
        message: `${label} reaches the viewer`,
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toBeCloseTo(presenterY, 0);
    await waitForSettledCamera(this.userPage.page, `${label} settles for the viewer`);
    return (await Promise.all([
      getTldrawCamera(this.modPage.page),
      getTldrawCamera(this.userPage.page),
    ])) as TldrawCamera[];
  }

  // A toolbar zoom click right after a restore must still move the presenter camera.
  private async expectToolbarZoomStillApplies(restoredZ: number, label: string) {
    await this.zoomIn(1);
    await expect
      .poll(async () => (await getTldrawCamera(this.modPage.page))?.z, {
        message: label,
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toBeGreaterThan(restoredZ * 1.05);
  }

  private async scrollTo(direction: 'top' | 'bottom') {
    const whiteboard = this.modPage.page.locator(e.whiteboard);
    let bounds = null;
    for (let attempt = 0; attempt < 10 && !bounds; attempt += 1) {
      await whiteboard.waitFor({ state: 'visible', timeout: ELEMENT_WAIT_LONGER_TIME });
      bounds = await whiteboard.boundingBox();
      if (!bounds) await this.modPage.page.waitForTimeout(100);
    }
    if (!bounds) throw new Error('whiteboard bounding box not available');
    await this.modPage.page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    const delta = direction === 'bottom' ? 300 : -300;
    for (let i = 0; i < 25; i += 1) await this.modPage.page.mouse.wheel(0, delta);
  }

  async preservesEachSlidesLastPosition({ slowDecode = false, reducedMotion = false } = {}) {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    if (reducedMotion) {
      await Promise.all([
        this.modPage.page.emulateMedia({ reducedMotion: 'reduce' }),
        this.userPage.page.emulateMedia({ reducedMotion: 'reduce' }),
      ]);
    }
    await uploadSinglePresentation(this.modPage, e.nonDefaultRatioPresentationFileName);
    await this.userPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    if (slowDecode) {
      for (const page of [this.modPage.page, this.userPage.page]) {
        await page.route(/\/svg\/2(?:\?|$)/, async (route) => {
          await new Promise((resolve) => {
            setTimeout(resolve, 400);
          });
          await route.continue();
        });
      }
    }

    await this.modPage.waitAndClick(e.fitToWidthButton);
    await this.scrollTo('bottom');
    const pageOneBottom = (await getTldrawCamera(this.modPage.page))?.y;
    expect(pageOneBottom, 'page 1 should pan below its top').toBeLessThan(-100);
    await expect
      .poll(async () => (await getTldrawCamera(this.userPage.page))?.y, {
        message: 'page 1 position should reach the viewer before navigation',
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toBeCloseTo(pageOneBottom!, 0);

    await this.modPage.waitAndClick(e.nextSlide);
    await this.waitForCamera(2, 0, 'opens an unvisited page at its own top');
    await this.modPage.waitAndClick(e.fitToWidthButton);
    await this.modPage.waitAndClick(e.prevSlide);
    await this.waitForCamera(1, pageOneBottom!, 'restores page 1 last position');
    await this.modPage.waitAndClick(e.nextSlide);
    await this.waitForCamera(2, 0, 'restores page 2 own position');
  }

  async restoresFitToWidthPageAfterRemount() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await uploadSinglePresentation(this.modPage, e.nonDefaultRatioPresentationFileName);
    await this.modPage.waitAndClick(e.fitToWidthButton);
    await this.scrollTo('bottom');
    const bottomCamera = await getTldrawCamera(this.modPage.page);
    expect(bottomCamera?.y, 'page 1 should pan below its top').toBeLessThan(-100);
    await expect
      .poll(async () => (await getTldrawCamera(this.userPage.page))?.y, {
        message: 'page 1 position should reach the viewer before navigation',
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toBeCloseTo(bottomCamera!.y, 0);

    await this.modPage.waitAndClick(e.nextSlide);
    await this.waitForCamera(2, 0, 'keeps page 2 at fit-page top');
    await this.modPage.waitAndClick(e.prevSlide);
    await this.waitForCamera(1, bottomCamera!.y, 'restores FTW page after editor remount');
  }

  async restoresPositionsAcrossDifferentZooms() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await uploadSinglePresentation(this.modPage, e.nonDefaultRatioPresentationFileName);
    await this.userPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    await this.zoomIn(2);
    await expect
      .poll(async () => (await getTldrawCamera(this.modPage.page))?.z, {
        message: 'page 1 reaches toolbar zoom 150%',
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toBeGreaterThan(0.75);
    const pageOneEditor = await getTldrawEditor(this.modPage.page);
    await pageOneEditor.evaluate((editor) => {
      const camera = editor.getCamera();
      editor.setCamera({ ...camera, y: -250 });
    });
    await pageOneEditor.dispose();
    await expect
      .poll(async () => (await getTldrawCamera(this.userPage.page))?.y, {
        message: 'page 1 non-boundary pan reaches the viewer',
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toBeCloseTo(-250, 0);
    const pageOne = (await Promise.all([
      getTldrawCamera(this.modPage.page),
      getTldrawCamera(this.userPage.page),
    ])) as TldrawCamera[];

    await this.modPage.waitAndClick(e.nextSlide);
    await this.waitForCamera(2, 0, 'opens page 2 before changing its zoom');
    await this.zoomIn(1);
    await expect
      .poll(async () => (await getTldrawCamera(this.modPage.page))?.z, {
        message: 'page 2 reaches toolbar zoom 125%',
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toBeGreaterThan(0.6);
    const pageTwoEditor = await getTldrawEditor(this.modPage.page);
    await pageTwoEditor.evaluate((editor) => {
      const camera = editor.getCamera();
      editor.setCamera({ ...camera, y: -150 });
    });
    await pageTwoEditor.dispose();
    await expect
      .poll(async () => (await getTldrawCamera(this.userPage.page))?.y, {
        message: 'page 2 non-boundary pan reaches the viewer',
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toBeCloseTo(-150, 0);
    const pageTwo = (await Promise.all([
      getTldrawCamera(this.modPage.page),
      getTldrawCamera(this.userPage.page),
    ])) as TldrawCamera[];

    await this.modPage.waitAndClick(e.prevSlide);
    await this.waitForExactCamera(1, pageOne, 'restores the 150% page camera');
    await this.modPage.waitAndClick(e.nextSlide);
    await this.waitForExactCamera(2, pageTwo, 'restores the 125% page camera');
  }

  // The whiteboard editor is remounted when fit-to-width differs between the two pages, so
  // the restore must also hold on the new editor, toolbar zoom included.
  async restoresToolbarZoomAfterFitToWidthChange() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await uploadSinglePresentation(this.modPage, e.nonDefaultRatioPresentationFileName);
    await this.userPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    await this.modPage.waitAndClick(e.nextSlide);
    await this.waitForCamera(2, 0, 'opens page 2 at its own top');
    await this.zoomIn(2);
    await expect
      .poll(async () => (await getTldrawCamera(this.modPage.page))?.z, {
        message: 'page 2 reaches toolbar zoom 150%',
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toBeGreaterThan(0.75);
    const pageTwo = await this.panPresenterTo(-250, 'page 2 non-boundary pan');

    await this.modPage.waitAndClick(e.prevSlide);
    await expect
      .poll(async () => (await getTldrawCamera(this.modPage.page))?.pageId, {
        message: 'presenter is back on page 1',
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toBe('page:1');
    await this.modPage.waitAndClick(e.fitToWidthButton);
    await this.waitForSettledPresenterCamera('fit-to-width camera settles');

    await this.modPage.waitAndClick(e.nextSlide);
    await this.waitForExactCamera(2, pageTwo, 'restores the 150% page after leaving a fit-to-width page');
    await this.expectToolbarZoomStillApplies(pageTwo[0].z, 'toolbar zoom-in still applies after the restore');
  }

  async restoresFitToWidthPageWithToolbarZoom() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await uploadSinglePresentation(this.modPage, e.nonDefaultRatioPresentationFileName);
    await this.userPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    await this.modPage.waitAndClick(e.fitToWidthButton);
    await this.waitForCamera(1, 0, 'page 1 in fit-to-width at its top');
    await this.waitForSettledPresenterCamera('fit-to-width camera settles');
    const fitToWidthZ = (await getTldrawCamera(this.modPage.page))!.z;
    await this.zoomIn(1);
    await expect
      .poll(async () => (await getTldrawCamera(this.modPage.page))?.z, {
        message: 'page 1 reaches toolbar zoom 125% on top of fit-to-width',
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toBeGreaterThan(fitToWidthZ * 1.2);
    const pageOne = await this.wheelPresenterDown(4, 'page 1 partial pan');
    expect(pageOne[0].y, 'page 1 should pan below its top').toBeLessThan(-100);
    expect(pageOne[0].z, 'page 1 keeps its 125% toolbar zoom after the pan').toBeGreaterThan(fitToWidthZ * 1.2);

    await this.modPage.waitAndClick(e.nextSlide);
    await this.waitForCamera(2, 0, 'opens page 2 at its own top');
    await this.modPage.waitAndClick(e.prevSlide);
    await this.waitForExactCamera(1, pageOne, 'restores the zoomed fit-to-width page');
    // A late presenter publish used to move viewers ~1.5s after the restore.
    await this.modPage.page.waitForTimeout(3000);
    await this.waitForExactCamera(1, pageOne, 'keeps the restored camera after late camera syncs');
    await this.expectToolbarZoomStillApplies(pageOne[0].z, 'toolbar zoom-in still applies after the round trip');
  }
}
