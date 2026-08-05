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
}
