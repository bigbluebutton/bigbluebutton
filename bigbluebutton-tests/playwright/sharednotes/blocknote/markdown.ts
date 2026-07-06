import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../../core/constants';
import { elements as e } from '../../core/elements';
import { createMeetingWithModules } from '../../core/helpers';
import { MultiUsers } from '../../user/multiusers';
import { getBlockNoteEditorLocator, startBlockNoteSharedNotes } from './util';

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

  // Feature: "Import from Markdown" replaces a non-empty document, but only after
  // an explicit confirmation.
  async importFromMarkdownReplacesWithConfirmation() {
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

    // Document is not empty, so the first click only asks for confirmation.
    await this.modPage.waitAndClick(e.notesImportMarkdownConfirm);
    await this.modPage.hasElement(e.notesImportMarkdownWarning, 'should warn before replacing a non-empty document');

    // Confirming applies the replacement.
    await this.modPage.waitAndClick(e.notesImportMarkdownConfirm);

    await expect(editor, 'the imported heading should render').toContainText('Imported Heading', {
      timeout: ELEMENT_WAIT_LONGER_TIME,
    });
    await expect(editor, 'the imported paragraph should render').toContainText('Imported paragraph body');
    await expect(editor, 'the original content should have been replaced').not.toContainText(originalText);
  }

  // Feature: importing markdown propagates to every connected client through the
  // shared Yjs document (proves the client-side replace is collaborative).
  async importFromMarkdownPropagatesToOtherUser() {
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
