import { expect, Response } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } from '../../core/constants';
import { elements as e } from '../../core/elements';
import { MultiUsers } from '../../user/multiusers';

export class BlockNoteSharedNotes extends MultiUsers {
  // Regression for https://github.com/bigbluebutton/bigbluebutton/issues/25122:
  // exporting an empty BlockNote shared note must return a file, not an error
  // page ("Export failed: Document is empty...").
  async exportEmptyNotesAsPDF() {
    const { sharedNotesEnabled } = this.modPage.settings || {};

    if (!sharedNotesEnabled) {
      await this.modPage.hasElement(e.chatButton, 'should display the public chat button');
      await this.modPage.wasRemoved(e.sharedNotes, 'should not display the shared notes button');
      return;
    }

    const { page } = this.modPage;

    // Open the (empty) BlockNote shared notes panel. Nothing is typed, so the
    // document stays empty.
    await this.modPage.waitAndClick(e.sharedNotes, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasElement(
      e.sharedNotesBackground,
      'should display the shared notes panel',
      ELEMENT_WAIT_LONGER_TIME,
    );

    // Open the notes options menu and export as PDF. "Export as PDF" is a
    // window.open navigation that returns the file; capture its response.
    // Promise.all keeps a single, handled rejection path and lets
    // waitForEvent own the timeout / listener cleanup.
    await this.modPage.waitAndClick(e.notesOptions, ELEMENT_WAIT_TIME);
    const [pdfResponse] = await Promise.all([
      page.context().waitForEvent('response', {
        predicate: (response: Response) => response.url().includes('/export/pdf'),
        timeout: ELEMENT_WAIT_LONGER_TIME,
      }),
      this.modPage.waitAndClick(e.exportNotesAsPDF, ELEMENT_WAIT_TIME),
    ]);

    expect(pdfResponse.status(), 'empty shared notes PDF export should return 200, not an error').toBe(200);
    expect(
      pdfResponse.headers()['content-type'] || '',
      'empty shared notes PDF export should return a PDF document',
    ).toContain('application/pdf');

    // Issue #25122 is general ("empty page should not be an error"), so every
    // export format must treat an empty document as a valid empty file. Reuse
    // the authenticated export URL and assert via API requests, which are
    // browser-independent (no download-navigation semantics).
    const exportUrl = pdfResponse.url();
    const formats: Array<{ format: string; contentType: string; body?: (text: string) => void }> = [
      { format: 'html', contentType: 'text/html' },
      { format: 'txt', contentType: 'text/plain' },
      { format: 'md', contentType: 'text/plain' },
      {
        format: 'json',
        contentType: 'application/json',
        body: (text) => expect(text.trim(), 'empty JSON export should be []').toBe('[]'),
      },
      { format: 'yjs', contentType: 'text/plain' },
    ];

    for (const { format, contentType, body } of formats) {
      // eslint-disable-next-line no-await-in-loop
      const response = await page.request.get(exportUrl.replace('/export/pdf', `/export/${format}`));
      expect(response.status(), `empty shared notes ${format} export should return 200`).toBe(200);
      expect(
        response.headers()['content-type'] || '',
        `empty shared notes ${format} export should return ${contentType}`,
      ).toContain(contentType);
      // eslint-disable-next-line no-await-in-loop
      if (body) body(await response.text());
    }
  }
}
