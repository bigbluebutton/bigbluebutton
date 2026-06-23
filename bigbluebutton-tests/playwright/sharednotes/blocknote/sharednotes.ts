import { expect, Response } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } from '../../core/constants';
import { elements as e } from '../../core/elements';
import { MultiUsers } from '../../user/multiusers';

// BlockNote-internal selectors (the editor library does not expose data-test
// attributes for these). The static formatting toolbar lives in the custom
// `.bn-toolbar-row` container (see bn-shared-notes/component.tsx); each
// BasicTextStyleButton renders with `data-test=<style>` (e.g. "bold").
const blockNote = {
  editor: '.bn-editor',
  // Second toolbar line: BasicTextStyleButton renders with data-test=<style>.
  toolbarBoldButton: '.bn-toolbar-row [data-test="bold"]',
  // First toolbar line: color and nest buttons. Custom wrappers keep these
  // mounted (inert) on the content-less LaTeX block; the native components hide
  // them. They render with a stable `data-test` on both the native (text block)
  // and the inert (LaTeX block) path, so they are reliable handles for "the
  // first toolbar line is present". Each is separate so the test fails pointing
  // at whichever button regressed. (The block-type select trigger has no stable
  // selector - BlockNote's `.bn-select` class is on the open dropdown only.)
  toolbarColorsButton: '.bn-toolbar-row [data-test="colors"]',
  toolbarNestButton: '.bn-toolbar-row [data-test="nestBlock"]',
  slashMenu: '.bn-suggestion-menu',
  slashMenuItem: '.bn-suggestion-menu-item',
  latexTextarea: '.latex-block-textarea',
};

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

  // Reproduces the bug where editing a LaTeX block hides the BlockNote
  // formatting toolbar. The toolbar buttons (BasicTextStyleButton) only render
  // when the active selection contains a block with editable text content
  // (`content !== undefined`). The LaTeX custom block is declared `content:
  // 'none'`, so as soon as it becomes the active block the bold/italic/etc.
  // buttons return null and the toolbar disappears. It should stay visible.
  async latexBlockKeepsFormattingToolbar() {
    const { sharedNotesEnabled } = this.modPage.settings || {};

    if (!sharedNotesEnabled) {
      await this.modPage.hasElement(e.chatButton, 'should display the public chat button');
      await this.modPage.wasRemoved(e.sharedNotes, 'should not display the shared notes button');
      return;
    }

    const { page } = this.modPage;

    // Open the BlockNote shared notes panel and wait for the editor.
    await this.modPage.waitAndClick(e.sharedNotes, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasElement(
      e.sharedNotesBackground,
      'should display the shared notes panel',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.modPage.hasElement(blockNote.editor, 'should display the BlockNote editor', ELEMENT_WAIT_LONGER_TIME);

    // Baseline: editing a normal text block keeps the full formatting toolbar
    // visible. This also proves the selectors are correct (the toolbar exists
    // and these are the right handles for "the formatting toolbar"). Both lines
    // must be present: the second line (bold) and the first line (block type
    // select, colors, nest).
    await this.modPage.waitAndClick(blockNote.editor);
    await page.keyboard.type('Baseline paragraph');
    await this.modPage.hasElement(
      blockNote.toolbarBoldButton,
      'baseline: the second toolbar line (bold button) should be visible when editing a text block',
    );
    await this.modPage.hasElement(
      blockNote.toolbarColorsButton,
      'baseline: the first toolbar line (color button) should be visible when editing a text block',
    );
    await this.modPage.hasElement(
      blockNote.toolbarNestButton,
      'baseline: the first toolbar line (nest button) should be visible when editing a text block',
    );

    // Insert a LaTeX block via the slash menu (/latex -> "LaTeX Formula").
    await page.keyboard.press('Enter');
    await page.keyboard.type('/latex');
    await this.modPage.hasElement(blockNote.slashMenu, 'should display the slash command menu');
    await page.locator(blockNote.slashMenuItem, { hasText: 'LaTeX Formula' }).first().click();

    // A freshly inserted LaTeX block has an empty formula, so it opens directly
    // in editing mode (its textarea is rendered and focused). Click it to make
    // sure the LaTeX block is the active/edited block.
    await this.modPage.hasElement(
      blockNote.latexTextarea,
      'should display the LaTeX block editing textarea',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.modPage.waitAndClick(blockNote.latexTextarea);

    // Capture the editor state at the assertion point (toolbar should be here).
    const screenshotPath = 'test-results/latex-formatting-toolbar.png';
    await page.screenshot({ path: screenshotPath });
    if (this.modPage.testInfo) {
      await this.modPage.testInfo.attach('latex-block-editing', { path: screenshotPath });
    }

    // The bug: while editing the LaTeX block the toolbar lines disappear because
    // the LaTeX block is `content: 'none'` and the stock toolbar components hide
    // on content-less blocks. Both lines must remain visible: the second line
    // (bold) and the first line (block type select, colors, nest).
    await this.modPage.hasElement(
      blockNote.toolbarBoldButton,
      'the second toolbar line (bold button) should remain visible while editing a LaTeX block',
    );
    await this.modPage.hasElement(
      blockNote.toolbarColorsButton,
      'the first toolbar line (color button) should remain visible while editing a LaTeX block',
    );
    await this.modPage.hasElement(
      blockNote.toolbarNestButton,
      'the first toolbar line (nest button) should remain visible while editing a LaTeX block',
    );
  }
}
