import { expect, Response } from '@playwright/test';

import { ELEMENT_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME } from '../../core/constants';
import { elements as e } from '../../core/elements';
import { MultiUsers } from '../../user/multiusers';

export class BlockNoteSharedNotes extends MultiUsers {
  // Dismiss any modal overlay (audio settings, "Session Details" welcome, ...)
  // that could intercept clicks on the shared notes controls.
  async dismissModals() {
    const page = this.modPage.page;
    for (let i = 0; i < 6; i += 1) {
      const overlay = page.locator('.ReactModal__Overlay').first();
      // eslint-disable-next-line no-await-in-loop
      if (!(await overlay.isVisible({ timeout: 1000 }).catch(() => false))) return;
      const close = page.locator(
        '[data-test="closeModal"], .ReactModal__Overlay button[aria-label="Close"]',
      ).first();
      // eslint-disable-next-line no-await-in-loop
      if (await close.isVisible({ timeout: 800 }).catch(() => false)) {
        // eslint-disable-next-line no-await-in-loop
        await close.click({ timeout: 2000 }).catch(() => {});
      } else {
        // eslint-disable-next-line no-await-in-loop
        await page.keyboard.press('Escape').catch(() => {});
      }
      // eslint-disable-next-line no-await-in-loop
      await page.waitForTimeout(800);
    }
  }

  // Regression for https://github.com/bigbluebutton/bigbluebutton/issues/25122:
  // exporting an empty BlockNote shared note as PDF must return a PDF, not an
  // error page ("Export failed: Document is empty...").
  async exportEmptyNotesAsPDF() {
    const page = this.modPage.page;
    const context = page.context();

    await this.dismissModals();

    // Open the (empty) shared notes panel.
    await this.modPage.waitAndClick(e.sharedNotesButton, ELEMENT_WAIT_TIME);
    await this.modPage.hasElement(e.sharedNotesBackground, 'should display the shared notes panel', ELEMENT_WAIT_LONGER_TIME);

    // Open the notes options menu (do not type anything: the document stays empty).
    await this.modPage.waitAndClick(e.notesOptions, ELEMENT_WAIT_TIME);

    // "Export as PDF" opens a popup (window.open) that navigates to the export
    // endpoint. Listen at the context level (covers every page in the context)
    // and register before clicking to avoid a race with the popup's response.
    const exportResponse = new Promise<Response>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('PDF export response not received')), ELEMENT_WAIT_LONGER_TIME);
      context.on('response', (response: Response) => {
        if (response.url().includes('/export/pdf')) {
          clearTimeout(timer);
          resolve(response);
        }
      });
    });

    await this.modPage.waitAndClick(e.exportNotesAsPDF, ELEMENT_WAIT_TIME);
    const response = await exportResponse;

    expect(
      response.status(),
      'exporting an empty shared note as PDF should succeed, not return an error',
    ).toBe(200);
    expect(
      response.headers()['content-type'] || '',
      'exporting an empty shared note as PDF should return a PDF document',
    ).toContain('application/pdf');
  }
}
