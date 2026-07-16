import { expect, Response } from '@playwright/test';
import fs from 'fs';
import path from 'path';

import { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } from '../../core/constants';
import { elements as e } from '../../core/elements';
import { Page } from '../../core/page';
import { MultiUsers } from '../../user/multiusers';

const IMAGE_FIXTURE = 'chatImage.png';

function fixtureAsDataUrl(fileName: string, mimeType: string): string {
  const buffer = fs.readFileSync(path.join(__dirname, `../../core/media/${fileName}`));
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

// Simulates a paste of an image file into the BlockNote editor by building a
// DataTransfer with a synthesized File and dispatching a paste event onto the
// ProseMirror contenteditable, which is how a user's clipboard reaches
// BlockNote's uploadFile path.
async function pasteImageIntoEditor(testPage: Page): Promise<void> {
  await testPage.page.waitForSelector(e.blockNoteEditor, { state: 'visible' });
  await testPage.page.locator(e.blockNoteEditor).click();
  await testPage.page.evaluate(
    async ({ selector, mimeType, fileName, url }) => {
      const blob = await (await fetch(url)).blob();
      const syntheticFile = new File([blob], fileName, { type: mimeType });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(syntheticFile);
      const element = document.querySelector(selector);
      if (!element) throw new Error(`element not found: ${selector}`);
      element.dispatchEvent(
        new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dataTransfer }),
      );
    },
    {
      selector: e.blockNoteEditor,
      mimeType: 'image/png',
      fileName: IMAGE_FIXTURE,
      url: fixtureAsDataUrl(IMAGE_FIXTURE, 'image/png'),
    },
  );
}

async function openNotes(testPage: Page): Promise<void> {
  await testPage.waitAndClick(e.sharedNotesSidebarButton, ELEMENT_WAIT_LONGER_TIME);
  await testPage.hasElement(e.sharedNotesBackground, 'should display the shared notes panel', ELEMENT_WAIT_LONGER_TIME);
}

// Asserting the <img> is present is not enough: a 401 (missing sessionToken on
// the file-upload GET) still leaves a broken <img> in the DOM. naturalWidth is 0
// for an image that failed to decode and > 0 only once the bytes actually loaded,
// so this proves the pasted image really renders. Retried, because the fetch and
// decode are async.
async function expectImageRendered(testPage: Page, description: string): Promise<void> {
  const image = testPage.page.locator(e.blockNoteImage).first();
  await expect(async () => {
    const naturalWidth = await image.evaluate((el: HTMLImageElement) => el.naturalWidth);
    expect(naturalWidth, description).toBeGreaterThan(0);
  }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });
}

export class BlockNoteImagePaste extends MultiUsers {
  // Paste an image into the notes: with the feature on it becomes an image
  // block that every participant sees; with the feature off it is a no-op.
  async pasteRendersImageBlock() {
    const { sharedNotesImagePasteEnabled } = this.modPage.settings || {};
    await openNotes(this.modPage);

    if (!sharedNotesImagePasteEnabled) {
      await pasteImageIntoEditor(this.modPage);
      await this.modPage.wasRemoved(e.blockNoteImage, 'should not insert an image block when image paste is disabled');
      return;
    }

    await pasteImageIntoEditor(this.modPage);
    await this.modPage.hasElement(
      e.blockNoteImage,
      'should render the pasted image block for the author',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await expectImageRendered(this.modPage, 'the pasted image should actually load for the author (naturalWidth > 0)');

    // The block syncs over Yjs, so a second participant with notes open sees it.
    await openNotes(this.userPage);
    await this.userPage.hasElement(
      e.blockNoteImage,
      'should render the pasted image block for the second user',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await expectImageRendered(
      this.userPage,
      'the pasted image should actually load for the second user (naturalWidth > 0)',
    );

    // The stored source must be same-origin (relative to bbb-file-upload), never
    // an external URL.
    const src = await this.modPage.page.locator(e.blockNoteImage).first().getAttribute('src');
    expect(src, 'the image block should reference a same-origin upload URL').toMatch(/^\/bigbluebutton\/fileUpload\//);
  }

  // Even with the Embed tab removed from the file panel, an external image URL
  // can still reach the document (pasted HTML, or a crafted client writing the
  // Yjs doc directly). The display-time gate (resolveFileUrl) must resolve it
  // to an empty source, so no participant's browser ever contacts the external
  // host (IP leak / tracking pixel).
  async externalImageUrlIsBlocked() {
    const { sharedNotesImagePasteEnabled } = this.modPage.settings || {};
    if (!sharedNotesImagePasteEnabled) return;

    // .invalid never resolves, but the request attempt (what must not happen)
    // would still be observable through the page's request events.
    const externalHost = 'tracking-pixel.invalid';
    const externalRequests: string[] = [];
    this.modPage.page.on('request', (request) => {
      if (request.url().includes(externalHost)) externalRequests.push(request.url());
    });

    await openNotes(this.modPage);
    await this.modPage.page.waitForSelector(e.blockNoteEditor, { state: 'visible' });
    await this.modPage.page.locator(e.blockNoteEditor).click();
    await this.modPage.page.evaluate(
      ({ selector, imgUrl }) => {
        const dataTransfer = new DataTransfer();
        dataTransfer.setData('text/html', `<p>before-marker</p><img src="${imgUrl}"><p>after-marker</p>`);
        const element = document.querySelector(selector);
        if (!element) throw new Error(`element not found: ${selector}`);
        element.dispatchEvent(
          new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dataTransfer }),
        );
      },
      { selector: e.blockNoteEditor, imgUrl: `https://${externalHost}/pixel.png` },
    );

    // The paste is processed asynchronously; the trailing paragraph landing in
    // the editor proves the whole clipboard payload went through the parser.
    await expect(
      this.modPage.page.locator(e.blockNoteEditor),
      'the pasted HTML around the image should land in the editor',
    ).toContainText('after-marker', { timeout: ELEMENT_WAIT_LONGER_TIME });

    await expect(
      this.modPage.page.locator(`img[src*="${externalHost}"]`),
      'no rendered image may point at the external host',
    ).toHaveCount(0);
    expect(externalRequests, 'no request may be made to the external host').toHaveLength(0);
  }

  // The exported HTML and PDF must contain the image. The PDF runs in a sandboxed
  // wkhtmltopdf that cannot fetch over the network, so the image is embedded as a
  // base64 data URI; the relative upload URL must not survive into the export.
  async exportEmbedsImageAsBase64() {
    const { sharedNotesImagePasteEnabled } = this.modPage.settings || {};
    if (!sharedNotesImagePasteEnabled) return;

    const { page } = this.modPage;
    await openNotes(this.modPage);
    await pasteImageIntoEditor(this.modPage);
    await this.modPage.hasElement(
      e.blockNoteImage,
      'should render the pasted image block before exporting',
      ELEMENT_WAIT_LONGER_TIME,
    );

    await this.modPage.waitAndClick(e.notesOptions, ELEMENT_WAIT_TIME);
    const [pdfResponse] = await Promise.all([
      page.context().waitForEvent('response', {
        predicate: (response: Response) => response.url().includes('/export/pdf'),
        timeout: ELEMENT_WAIT_LONGER_TIME,
      }),
      this.modPage.waitAndClick(e.exportNotesAsPDF, ELEMENT_WAIT_TIME),
    ]);
    expect(pdfResponse.status(), 'PDF export with an image should return 200').toBe(200);
    expect(pdfResponse.headers()['content-type'] || '', 'PDF export should return a PDF document').toContain(
      'application/pdf',
    );

    // HTML export is browser-independent, so assert its content via an API
    // request on the same authenticated export URL.
    const htmlUrl = pdfResponse.url().replace('/export/pdf', '/export/html');
    const htmlResponse = await page.request.get(htmlUrl);
    expect(htmlResponse.status(), 'HTML export should return 200').toBe(200);
    const html = await htmlResponse.text();
    expect(html, 'HTML export should embed the image as an inline base64 data URI').toContain('data:image/png;base64,');
    expect(html, 'the relative upload URL must be inlined, not left in the export').not.toContain(
      '/bigbluebutton/fileUpload/',
    );
  }
}
