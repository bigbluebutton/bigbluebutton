import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { uploadSinglePresentation } from '../presentation/util';
import { MultiUsers } from '../user/multiusers';
import { getTldrawCamera, getTldrawEditor, type TldrawCamera } from './util';

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

    const zoomIn = async (times: number) => {
      for (let index = 0; index < times; index += 1) {
        await this.modPage.page.locator(e.zoomInButton).evaluate((button: HTMLButtonElement) => button.click());
        await this.modPage.page.waitForTimeout(700);
      }
    };
    await zoomIn(2);
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
    await zoomIn(1);
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
}
