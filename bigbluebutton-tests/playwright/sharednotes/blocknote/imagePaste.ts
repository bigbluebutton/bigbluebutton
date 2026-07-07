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

    // The block syncs over Yjs, so a second participant with notes open sees it.
    await openNotes(this.userPage);
    await this.userPage.hasElement(
      e.blockNoteImage,
      'should render the pasted image block for the second user',
      ELEMENT_WAIT_LONGER_TIME,
    );

    // The stored source must be same-origin (relative to bbb-file-upload), never
    // an external URL.
    const src = await this.modPage.page.locator(e.blockNoteImage).first().getAttribute('src');
    expect(src, 'the image block should reference a same-origin upload URL').toMatch(/^\/bigbluebutton\/fileUpload\//);
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
