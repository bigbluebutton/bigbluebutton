import fs from 'fs';
import path from 'path';

import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { MultiUsers } from '../user/multiusers';
import { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } from '../core/constants';

const IMAGE_FIXTURE = 'chatImage.png';

function fixtureAsDataUrl(fileName: string, mimeType: string): string {
  const buffer = fs.readFileSync(path.join(__dirname, `../core/media/${fileName}`));
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

// Ctrl+V is intercepted by BBB before tldraw can route it through the drop
// handler, so the whiteboard paste handler reads the async clipboard itself.
// Stub navigator.clipboard.read with our fixture image and press Ctrl+V, which
// exercises the real upload + shape-insert path.
async function pasteImageViaClipboard(testPage: Page, mimeType: string, dataUrl: string): Promise<void> {
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

  await testPage.page.locator(e.whiteboard).click();
  await testPage.page.keyboard.press('ControlOrMeta+v');
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
    await this.userPage.hasElementCount(
      e.wbImageShape,
      baseline + 1,
      'should render the pasted image for the second user',
    );
  }

  async viewerCannotPasteImage() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard);

    // userPage is a viewer without whiteboard write access.
    const baseline = await this.userPage.page.locator(e.wbImageShape).count();
    await pasteImageViaClipboard(this.userPage, 'image/png', fixtureAsDataUrl(IMAGE_FIXTURE, 'image/png'));
    await this.userPage.page.waitForTimeout(ELEMENT_WAIT_TIME);
    await this.userPage.hasElementCount(
      e.wbImageShape,
      baseline,
      'a viewer without whiteboard write access should not be able to paste an image',
    );
  }
}
