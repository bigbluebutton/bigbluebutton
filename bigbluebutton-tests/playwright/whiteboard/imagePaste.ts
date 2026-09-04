import { expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

import { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { MultiUsers } from '../user/multiusers';

const IMAGE_FIXTURE = 'chatImage.png';

function fixtureAsDataUrl(fileName: string, mimeType: string): string {
  const buffer = fs.readFileSync(path.join(__dirname, `../core/media/${fileName}`));
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

// Ctrl+V is intercepted by BBB before tldraw can route it through the drop
// handler, so the whiteboard paste handler reads the async clipboard itself.
// Stub navigator.clipboard.read with our fixture image and press Ctrl+V, which
// exercises the real upload + shape-insert path.
// `force` skips Playwright's actionability checks on the canvas click. A viewer
// without write access has the canvas covered by the read-only interaction
// blocker (an absolutely positioned overlay at z-index 300), so a plain click
// never passes the hit-target check and the test fails before it can assert
// anything. The click only exists to put focus on the whiteboard for the
// Ctrl+V that follows, which forcing still does.
async function pasteImageViaClipboard(testPage: Page, mimeType: string, dataUrl: string, force = false): Promise<void> {
  await testPage.page.evaluate(
    async ({ type, url }) => {
      const blob = await (await fetch(url)).blob();
      // Minimal ClipboardItem-like stub matching what the handler reads.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigator.clipboard as any).read = async () => [
        {
          types: [type],
          getType: async () => blob,
        },
      ];
    },
    { type: mimeType, url: dataUrl },
  );

  await testPage.page.locator(e.whiteboard).click({ force });
  await testPage.page.keyboard.press('ControlOrMeta+v');
}

// Counting image shapes is not enough: a shape whose background image fails to
// load (e.g. a 401 on the file-upload GET) is still counted. A tldraw image shape
// renders its bytes as a CSS background-image, so we read that URL back and load
// it through a fresh Image() to check it actually decodes (naturalWidth > 0).
// Asserting at least `minLoaded` shapes decode proves the pasted image really
// renders, on top of the slide-background image that is always present.
async function expectLoadedImageShapes(testPage: Page, minLoaded: number, description: string): Promise<void> {
  await expect(async () => {
    const loaded = await testPage.page.locator(`${e.wbImageShape} .tl-image`).evaluateAll((divs) =>
      Promise.all(
        divs.map(
          (div) =>
            new Promise<boolean>((resolve) => {
              const bg = getComputedStyle(div as HTMLElement).backgroundImage;
              const [, url] = /url\(["']?(.*?)["']?\)/.exec(bg) ?? [];
              if (!url || url === 'none') {
                resolve(false);
                return;
              }
              const img = new Image();
              img.onload = () => resolve(img.naturalWidth > 0);
              img.onerror = () => resolve(false);
              img.src = url;
            }),
        ),
      ).then((results) => results.filter(Boolean).length),
    );
    expect(loaded, description).toBeGreaterThanOrEqual(minLoaded);
  }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });
}

// Exports the current slide through the whiteboard options menu and returns the
// downloaded PNG as base64. handleDownload reads the file as utf8, which would
// corrupt binary content, so the bytes are read again from the download path.
async function exportSlideSnapshot(testPage: Page): Promise<string> {
  await testPage.waitAndClick(e.whiteboardOptionsButton);
  const { download } = await testPage.handleDownload(testPage.page.locator(e.presentationSnapshot));
  const filePath = await download.path();
  return fs.readFileSync(filePath!).toString('base64');
}

// The exported snapshot covers the whole slide, so the pasted image is located
// by color rather than by position. The fixture is a single flat color and it
// is sampled from the fixture itself at runtime, so no color is hardcoded here.
async function countFixtureColorPixels(testPage: Page, snapshotBase64: string): Promise<number> {
  const fixtureBase64 = fs.readFileSync(path.join(__dirname, `../core/media/${IMAGE_FIXTURE}`)).toString('base64');

  return testPage.page.evaluate(
    async ({ snapshot, fixture }) => {
      const decode = async (base64: string): Promise<ImageData> => {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => reject(new Error('could not decode PNG'));
          img.src = `data:image/png;base64,${base64}`;
        });
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const context = canvas.getContext('2d')!;
        context.drawImage(img, 0, 0);
        return context.getImageData(0, 0, canvas.width, canvas.height);
      };

      const fixtureData = await decode(fixture);
      const middleRow = Math.floor(fixtureData.height / 2);
      const middleColumn = Math.floor(fixtureData.width / 2);
      const middle = (middleRow * fixtureData.width + middleColumn) * 4;
      const red = fixtureData.data[middle];
      const green = fixtureData.data[middle + 1];
      const blue = fixtureData.data[middle + 2];

      // Small tolerance: the interior of a flat region survives rasterization
      // untouched, only the edges get blended with the background.
      const TOLERANCE = 4;
      const snapshotData = await decode(snapshot);
      let count = 0;
      for (let i = 0; i < snapshotData.data.length; i += 4) {
        if (
          Math.abs(snapshotData.data[i] - red) <= TOLERANCE &&
          Math.abs(snapshotData.data[i + 1] - green) <= TOLERANCE &&
          Math.abs(snapshotData.data[i + 2] - blue) <= TOLERANCE
        ) {
          count += 1;
        }
      }
      return count;
    },
    { snapshot: snapshotBase64, fixture: fixtureBase64 },
  );
}

export class WhiteboardImagePaste extends MultiUsers {
  async pasteImage() {
    const { whiteboardImagePasteEnabled } = this.modPage.settings || {};
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard);

    // The slide background is itself an image shape, so assert on the delta.
    const baseline = await this.modPage.page.locator(e.wbImageShape).count();

    // Feature off: pasting an image must not add an image shape.
    if (!whiteboardImagePasteEnabled) {
      await pasteImageViaClipboard(this.modPage, 'image/png', fixtureAsDataUrl(IMAGE_FIXTURE, 'image/png'));
      await this.modPage.page.waitForTimeout(ELEMENT_WAIT_TIME);
      await this.modPage.hasElementCount(
        e.wbImageShape,
        baseline,
        'should not add an image shape when image paste is disabled',
      );
      return;
    }

    await pasteImageViaClipboard(this.modPage, 'image/png', fixtureAsDataUrl(IMAGE_FIXTURE, 'image/png'));
    await this.modPage.hasElementCount(
      e.wbImageShape,
      baseline + 1,
      'should insert the pasted image as a whiteboard shape for the presenter',
    );
    await expectLoadedImageShapes(
      this.modPage,
      baseline + 1,
      'the pasted image shape should actually decode for the presenter (naturalWidth > 0)',
    );
    await this.userPage.hasElementCount(
      e.wbImageShape,
      baseline + 1,
      'should render the pasted image for the second user',
    );
    await expectLoadedImageShapes(
      this.userPage,
      baseline + 1,
      'the pasted image shape should actually decode for the second user (naturalWidth > 0)',
    );
  }

  async viewerCannotPasteImage() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard);

    // userPage is a viewer without whiteboard write access.
    const baseline = await this.userPage.page.locator(e.wbImageShape).count();
    await pasteImageViaClipboard(this.userPage, 'image/png', fixtureAsDataUrl(IMAGE_FIXTURE, 'image/png'), true);
    await this.userPage.page.waitForTimeout(ELEMENT_WAIT_TIME);
    await this.userPage.hasElementCount(
      e.wbImageShape,
      baseline,
      'a viewer without whiteboard write access should not be able to paste an image',
    );
  }

  async snapshotKeepsPastedImage() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    // Export once before pasting. Asserting on the delta rather than on an
    // absolute count keeps the test honest whatever colors the slide
    // background itself carries.
    const baselineMatches = await countFixtureColorPixels(this.modPage, await exportSlideSnapshot(this.modPage));

    const shapeBaseline = await this.modPage.page.locator(e.wbImageShape).count();
    await pasteImageViaClipboard(this.modPage, 'image/png', fixtureAsDataUrl(IMAGE_FIXTURE, 'image/png'));
    await this.modPage.hasElementCount(
      e.wbImageShape,
      shapeBaseline + 1,
      'should insert the pasted image before exporting the snapshot',
    );
    await expectLoadedImageShapes(
      this.modPage,
      shapeBaseline + 1,
      'the pasted image shape should decode before exporting the snapshot',
    );

    // The upload toast covers the whiteboard options button.
    await this.modPage.closeAllToastNotifications();
    const matches = await countFixtureColorPixels(this.modPage, await exportSlideSnapshot(this.modPage));

    // The fixture is 64x64 at natural size in page units (paste only scales
    // images down), so a correct export carries a few thousand of its pixels.
    // The floor is deliberately low: the point is that the color is there at
    // all. Before the fix the export replaced the pasted image with a copy of
    // the slide background, leaving zero.
    expect(
      matches - baselineMatches,
      'the exported snapshot should show the pasted image itself, not the slide background',
    ).toBeGreaterThan(500);
  }
}
