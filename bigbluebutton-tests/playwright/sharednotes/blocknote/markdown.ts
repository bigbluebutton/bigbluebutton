import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../../core/constants';
import { elements as e } from '../../core/elements';
import { createMeetingWithModules } from '../../core/helpers';
import { MultiUsers } from '../../user/multiusers';
import { enableMarkdownNotesOptions, getBlockNoteEditorLocator, startBlockNoteSharedNotes } from './util';

// Markdown seeded through the sharedNotesInitialContentMarkdown create parameter.
// Kept in sync with the value passed in markdown.spec.ts.
export const INIT_MARKDOWN_HEADING = 'Seeded Markdown Heading';
export const INIT_MARKDOWN_ITEM = 'seeded list item';

// Distinct texts so precedence can be asserted by which one renders.
export const JSON_WINS_TEXT = 'JSON content wins over markdown';
export const MARKDOWN_LOSER_HEADING = 'Markdown that should lose';
export const MARKDOWN_FALLBACK_HEADING = 'Markdown Fallback Heading';
export const PAYLOAD_MARKDOWN_HEADING = 'Payload Markdown Heading';

// A valid single-paragraph BlockNote document (same structure documented for
// the sharedNotesInitialContentJson module in docs/development/api.md).
function jsonModule(text: string): string {
  const blocks = [
    {
      id: '00000000-0000-0000-0000-000000000000',
      type: 'paragraph',
      props: { textAlignment: 'left', backgroundColor: 'default', textColor: 'default' },
      content: [{ type: 'text', text, styles: {} }],
      children: [],
    },
  ];
  const json = JSON.stringify(blocks);
  return `<modules><module name="sharedNotesInitialContentJson"><![CDATA[${json}]]></module></modules>`;
}

function invalidJsonModule(): string {
  const bad = 'this is not valid blocknote json {{{ ';
  return `<modules><module name="sharedNotesInitialContentJson"><![CDATA[${bad}]]></module></modules>`;
}

function markdownModule(markdown: string): string {
  return `<modules><module name="sharedNotesInitialContentMarkdown"><![CDATA[${markdown}]]></module></modules>`;
}

// Build the create query string that seeds shared notes from a raw markdown param.
export function markdownCreateParameter(markdown: string): string {
  return `sharedNotesEditor=blocknote&sharedNotesInitialContentMarkdown=${encodeURIComponent(markdown)}`;
}

export class MarkdownSharedNotes extends MultiUsers {
  // Feature: "Export as Markdown" kebab item downloads a .md file with the notes.
  async exportAsMarkdown() {
    await enableMarkdownNotesOptions(this.modPage);
    await startBlockNoteSharedNotes(this.modPage);

    const editor = getBlockNoteEditorLocator(this.modPage);
    await editor.click();
    const noteText = 'Hello Markdown Export';
    await this.modPage.page.keyboard.type(noteText);
    await expect(editor, 'the typed note should be visible in the editor').toContainText(noteText);

    await this.modPage.waitAndClick(e.notesOptions);
    const download = await this.modPage.handleDownload(
      this.modPage.page.locator(e.exportNotesAsMarkdown),
      undefined,
      ELEMENT_WAIT_LONGER_TIME,
    );

    if (!download?.download) throw new Error('Markdown export download did not start');
    const extension = download.download.suggestedFilename().split('.').pop();
    expect(extension, 'the exported file should have a .md extension').toBe('md');
    expect(download.content, 'the exported markdown should contain the typed note').toContain(noteText);
  }

  // Feature: a room created with sharedNotesInitialContentMarkdown renders the
  // converted blocks (heading + list) when the shared notes open.
  async initFromMarkdown() {
    await startBlockNoteSharedNotes(this.modPage);

    const editor = getBlockNoteEditorLocator(this.modPage);
    await expect(editor, 'should render the seeded heading').toContainText(INIT_MARKDOWN_HEADING, {
      timeout: ELEMENT_WAIT_LONGER_TIME,
    });
    await expect(editor, 'should render the seeded list item').toContainText(INIT_MARKDOWN_ITEM);
  }

  // Feature: importing in "Replace" mode overwrites a non-empty document with the
  // imported content, with no confirmation step.
  async importFromMarkdownReplace() {
    await enableMarkdownNotesOptions(this.modPage);
    await startBlockNoteSharedNotes(this.modPage);

    const editor = getBlockNoteEditorLocator(this.modPage);
    await editor.click();
    const originalText = 'Original content to be replaced';
    await this.modPage.page.keyboard.type(originalText);
    await expect(editor).toContainText(originalText);

    await this.modPage.waitAndClick(e.notesOptions);
    await this.modPage.waitAndClick(e.importNotesFromMarkdown);

    const importedMarkdown = '# Imported Heading\n\nImported paragraph body';
    await this.modPage.page.locator(e.notesImportMarkdownTextarea).fill(importedMarkdown);

    // Choose Replace, then import. There is no confirmation prompt anymore.
    await this.modPage.page.locator(e.notesImportMarkdownReplaceMode).check();
    await this.modPage.waitAndClick(e.notesImportMarkdownConfirm);

    await expect(editor, 'the imported heading should render').toContainText('Imported Heading', {
      timeout: ELEMENT_WAIT_LONGER_TIME,
    });
    await expect(editor, 'the imported paragraph should render').toContainText('Imported paragraph body');
    await expect(editor, 'the original content should have been replaced').not.toContainText(originalText);
  }

  // Feature: importing in "Append" mode (the default) keeps the existing content and
  // adds the imported content after it.
  async importFromMarkdownAppend() {
    await enableMarkdownNotesOptions(this.modPage);
    await startBlockNoteSharedNotes(this.modPage);

    const editor = getBlockNoteEditorLocator(this.modPage);
    await editor.click();
    const originalText = 'Original content to keep';
    await this.modPage.page.keyboard.type(originalText);
    await expect(editor).toContainText(originalText);

    await this.modPage.waitAndClick(e.notesOptions);
    await this.modPage.waitAndClick(e.importNotesFromMarkdown);

    // Append is the default; assert it is pre-selected so the default is never
    // silently destructive.
    await expect(
      this.modPage.page.locator(e.notesImportMarkdownAppendMode),
      'append should be the default mode',
    ).toBeChecked();

    const importedMarkdown = '# Appended Heading\n\nAppended paragraph body';
    await this.modPage.page.locator(e.notesImportMarkdownTextarea).fill(importedMarkdown);
    await this.modPage.waitAndClick(e.notesImportMarkdownConfirm);

    await expect(editor, 'the original content should be kept').toContainText(originalText, {
      timeout: ELEMENT_WAIT_LONGER_TIME,
    });
    await expect(editor, 'the appended heading should render').toContainText('Appended Heading');
    await expect(editor, 'the appended paragraph should render').toContainText('Appended paragraph body');
  }

  // Feature: cancelling the import modal closes it and leaves the document untouched;
  // nothing staged in the modal (textarea content, chosen mode) is imported.
  async importFromMarkdownCancel() {
    await enableMarkdownNotesOptions(this.modPage);
    await startBlockNoteSharedNotes(this.modPage);

    const editor = getBlockNoteEditorLocator(this.modPage);
    await editor.click();
    const originalText = 'Content that must survive a cancel';
    await this.modPage.page.keyboard.type(originalText);
    await expect(editor).toContainText(originalText);

    await this.modPage.waitAndClick(e.notesOptions);
    await this.modPage.waitAndClick(e.importNotesFromMarkdown);

    // Stage some markdown, then back out with Cancel instead of confirming.
    const discardedHeading = 'Heading that should never be imported';
    await this.modPage.page.locator(e.notesImportMarkdownTextarea).fill(`# ${discardedHeading}`);
    await this.modPage.waitAndClick(e.notesImportMarkdownCancel);

    // The modal closes and nothing is imported: the original content stays, and the
    // staged markdown never reaches the editor.
    await this.modPage.wasRemoved(e.notesImportMarkdownModal, 'the import modal should close on cancel');
    await expect(editor, 'the original content should be untouched').toContainText(originalText);
    await expect(editor, 'the discarded markdown should not have been imported').not.toContainText(discardedHeading);
  }

  // Feature: importing markdown propagates to every connected client through the
  // shared Yjs document (proves the client-side replace is collaborative).
  async importFromMarkdownPropagatesToOtherUser() {
    await enableMarkdownNotesOptions(this.modPage);
    await startBlockNoteSharedNotes(this.modPage);
    await startBlockNoteSharedNotes(this.userPage);

    await this.modPage.waitAndClick(e.notesOptions);
    await this.modPage.waitAndClick(e.importNotesFromMarkdown);

    const importedMarkdown = '# Shared Heading\n\nContent visible to everyone';
    await this.modPage.page.locator(e.notesImportMarkdownTextarea).fill(importedMarkdown);
    // The presenter's document starts empty, so import applies without confirmation.
    await this.modPage.waitAndClick(e.notesImportMarkdownConfirm);

    const userEditor = getBlockNoteEditorLocator(this.userPage);
    await expect(userEditor, 'the attendee should see the imported heading').toContainText('Shared Heading', {
      timeout: ELEMENT_WAIT_LONGER_TIME,
    });
    await expect(userEditor, 'the attendee should see the imported body').toContainText('Content visible to everyone');
  }

  // Opens shared notes and the "Import from Markdown" modal as moderator.
  private async openImportModal() {
    await enableMarkdownNotesOptions(this.modPage);
    await startBlockNoteSharedNotes(this.modPage);
    await this.modPage.waitAndClick(e.notesOptions);
    await this.modPage.waitAndClick(e.importNotesFromMarkdown);
  }

  // Loads a file into the dropzone via the hidden file input (drag is not simulated
  // because it is flaky; setInputFiles exercises the same onDrop path).
  private async importFromMarkdownUpload({
    name,
    mimeType,
    buffer,
  }: {
    name: string;
    mimeType: string;
    buffer: Buffer;
  }) {
    await this.modPage.page.setInputFiles(e.notesImportMarkdownFileInput, { name, mimeType, buffer });
  }

  // Feature: uploading a valid .md file loads its content and imports it into the editor.
  async importFromMarkdownUploadFile() {
    await this.openImportModal();

    const uploadedMarkdown = '# Uploaded Heading\n\nUploaded from a file';
    await this.importFromMarkdownUpload({
      name: 'notes.md',
      mimeType: 'text/markdown',
      buffer: Buffer.from(uploadedMarkdown),
    });

    // The loaded-file chip confirms the upload was accepted.
    await this.modPage.hasElement(e.notesImportMarkdownFileLoaded, 'the loaded-file chip should appear');

    // The presenter's document starts empty, so import applies without confirmation.
    await this.modPage.waitAndClick(e.notesImportMarkdownConfirm);

    const editor = getBlockNoteEditorLocator(this.modPage);
    await expect(editor, 'the uploaded heading should render').toContainText('Uploaded Heading', {
      timeout: ELEMENT_WAIT_LONGER_TIME,
    });
    await expect(editor, 'the uploaded body should render').toContainText('Uploaded from a file');
  }

  // Feature: uploading a non-markdown file surfaces an error and imports nothing.
  async importFromMarkdownUploadWrongType() {
    await this.openImportModal();

    await this.importFromMarkdownUpload({
      name: 'notes.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('this is not markdown'),
    });

    await this.modPage.hasElement(e.notesImportMarkdownError, 'a wrong-type error should be shown');
    await expect(
      this.modPage.page.locator(e.notesImportMarkdownConfirm),
      'import should stay disabled for a rejected file',
    ).toHaveAttribute('aria-disabled', 'true');
  }

  // Feature: uploading an empty markdown file shows the chip but keeps import disabled.
  async importFromMarkdownUploadEmptyFile() {
    await this.openImportModal();

    await this.importFromMarkdownUpload({
      name: 'empty.md',
      mimeType: 'text/markdown',
      buffer: Buffer.from(''),
    });

    await this.modPage.hasElement(e.notesImportMarkdownFileLoaded, 'the chip should appear for an empty file');
    await this.modPage.hasElement(e.notesImportMarkdownError, 'an empty-file notice should be shown');
    await expect(
      this.modPage.page.locator(e.notesImportMarkdownConfirm),
      'import should be disabled for an empty file',
    ).toHaveAttribute('aria-disabled', 'true');
  }

  // Creates a meeting with the given modules/params, then joins as moderator.
  private async createAndJoin(modulesXml: string, createParameter: string) {
    const meetingId = await createMeetingWithModules(modulesXml, createParameter);
    const context = await this.browser.newContext();
    const page = await context.newPage();
    await this.initModPage(page, { meetingId });
  }

  // Feature: when both JSON and Markdown initial content are supplied, the JSON
  // takes precedence and the Markdown is ignored.
  async precedenceJsonWinsOverMarkdown() {
    const markdown = `# ${MARKDOWN_LOSER_HEADING}`;
    const createParameter = markdownCreateParameter(markdown);
    await this.createAndJoin(jsonModule(JSON_WINS_TEXT), createParameter);

    await startBlockNoteSharedNotes(this.modPage);
    const editor = getBlockNoteEditorLocator(this.modPage);
    await expect(editor, 'the JSON initial content should be used').toContainText(JSON_WINS_TEXT, {
      timeout: ELEMENT_WAIT_LONGER_TIME,
    });
    await expect(editor, 'the markdown should be ignored when JSON is present').not.toContainText(
      MARKDOWN_LOSER_HEADING,
    );
  }

  // Feature: when the JSON initial content is invalid, seeding falls back to the
  // Markdown instead of leaving the document empty.
  async invalidJsonFallsBackToMarkdown() {
    const markdown = `# ${MARKDOWN_FALLBACK_HEADING}`;
    const createParameter = markdownCreateParameter(markdown);
    await this.createAndJoin(invalidJsonModule(), createParameter);

    await startBlockNoteSharedNotes(this.modPage);
    const editor = getBlockNoteEditorLocator(this.modPage);
    await expect(editor, 'the markdown fallback should render when JSON is invalid').toContainText(
      MARKDOWN_FALLBACK_HEADING,
      { timeout: ELEMENT_WAIT_LONGER_TIME },
    );
  }

  // Feature: Markdown initial content can also be provided in the POST body via the
  // sharedNotesInitialContentMarkdown xml module (for content too large for a query
  // string), mirroring sharedNotesInitialContentJson.
  async initFromMarkdownPayload() {
    const markdown = `# ${PAYLOAD_MARKDOWN_HEADING}\n\n- ${INIT_MARKDOWN_ITEM}`;
    await this.createAndJoin(markdownModule(markdown), 'sharedNotesEditor=blocknote');

    await startBlockNoteSharedNotes(this.modPage);
    const editor = getBlockNoteEditorLocator(this.modPage);
    await expect(editor, 'the markdown from the POST payload should seed the document').toContainText(
      PAYLOAD_MARKDOWN_HEADING,
      { timeout: ELEMENT_WAIT_LONGER_TIME },
    );
    await expect(editor, 'the markdown list item should render').toContainText(INIT_MARKDOWN_ITEM);
  }
}
