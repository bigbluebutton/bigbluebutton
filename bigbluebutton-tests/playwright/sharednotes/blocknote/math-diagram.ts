import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../../core/constants';
import { elements as e } from '../../core/elements';
import { Page } from '../../core/page';
import { MultiUsers } from '../../user/multiusers';
import { enableMarkdownNotesOptions, getBlockNoteEditorLocator, startBlockNoteSharedNotes } from './util';

const EQUATION = String.raw`\int_0^1 x^2 \, dx = \frac{1}{3}`;
// Formula sources that look like HTML to the TXT export. KaTeX cannot parse
// the second one (& outside a table), which exports through its error path.
const TEXT_EXPORT_BLOCK_EQUATION = String.raw`x<y \quad a \& b`;
const TEXT_EXPORT_EDGE_CASE = String.raw`\text{&lt;} <b>`;
const DIAGRAM_LINES = ['graph TD', 'A[Agenda] --> B{Decision}', 'B -->|yes| C[Ship]'];
// Script chunks of the client (`<id>.bundle.<hash>.js`), as opposed to the
// bundle itself (`bundle.<hash>.js`)
const CHUNK_URL = /\/[^/]+\.bundle\.[^/]+\.js$/;

// Types placeholder lines, one per block the test inserts afterwards.
async function typeSlots(testPage: Page, slots: string[]): Promise<void> {
  await getBlockNoteEditorLocator(testPage).click();
  for (const [index, slot] of slots.entries()) {
    if (index > 0) await testPage.page.keyboard.press('Enter');
    await testPage.page.keyboard.type(slot);
  }
}

// Replaces a placeholder line with a block picked from the slash menu.
async function insertFromSlashMenu(testPage: Page, slot: string, title: string): Promise<void> {
  const editor = getBlockNoteEditorLocator(testPage);
  await editor.locator('.bn-block-content', { hasText: slot }).click();
  await testPage.page.keyboard.press('End');
  await testPage.page.keyboard.press('Shift+Home');
  await testPage.page.keyboard.press('Backspace');
  await testPage.page.keyboard.type(`/${title}`);
  const item = testPage.page.locator(e.blockNoteSlashMenuItem, { hasText: title }).first();
  await expect(item, `the slash menu should offer "${title}"`).toBeVisible();
  await testPage.page.keyboard.press('Enter');
}

interface DiagramColors {
  boxLuminance: number;
  labelLuminance: number;
  styleKeptFromDarkReader: boolean;
}

// Relative luminance (0 dark .. 1 light) of the first node box and node label
// of the diagram, and whether its stylesheet is kept out of DarkReader.
async function readDiagramColors(testPage: Page): Promise<DiagramColors | null> {
  return testPage.page.evaluate((selector) => {
    const svg = document.querySelector(`${selector} svg`);
    const box = svg?.querySelector('.node rect, .node polygon');
    const label = svg?.querySelector('.nodeLabel, .node text');
    if (!svg || !box || !label) return null;
    const luminance = (color: string) => {
      const [r, g, b] = (color.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map((c) => Number(c) / 255);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    return {
      boxLuminance: luminance(getComputedStyle(box).fill),
      labelLuminance: luminance(getComputedStyle(label).fill),
      // DarkReader adds its own `darkreader darkreader--*` styles next to the
      // ones it recolors; the diagram's own sheet carries the bare class.
      styleKeptFromDarkReader: Array.from(svg.querySelectorAll('style')).some(
        (style) => style.getAttribute('class') === 'darkreader',
      ),
    };
  }, e.blockNoteDiagram);
}

// Same steps as the dark mode option test (options/options.ts): Settings,
// the dark mode switch, save. The settings panel replaces the notes panel.
async function toggleDarkMode(testPage: Page): Promise<void> {
  await testPage.waitAndClick(e.settingsSidebarButton);
  await testPage.waitAndClick(e.darkModeToggleBtn);
  await testPage.waitAndClick(e.saveSettingsButton);
  if (!(await getBlockNoteEditorLocator(testPage).isVisible())) await startBlockNoteSharedNotes(testPage);
}

async function insertBlockEquation(testPage: Page, slot: string): Promise<void> {
  await insertFromSlashMenu(testPage, slot, 'Block Equation');
  await testPage.page.keyboard.type(EQUATION);
  await testPage.page.keyboard.press('Escape');
}

async function typeInlineEquation(testPage: Page, source: string): Promise<void> {
  await testPage.page.keyboard.type(source);
  await testPage.page.keyboard.press('Escape');
  await testPage.page.keyboard.press('End');
}

async function insertDiagram(testPage: Page, slot: string): Promise<void> {
  await insertFromSlashMenu(testPage, slot, 'Diagram');
  const diagram = testPage.page.locator(e.blockNoteDiagram).last();
  await expect(diagram.locator('svg'), 'a new diagram should render its sample source').toBeVisible({
    timeout: ELEMENT_WAIT_LONGER_TIME,
  });
  // Open the source popup and replace the sample source
  await diagram.click();
  await testPage.page.keyboard.press('Control+A');
  for (const [index, line] of DIAGRAM_LINES.entries()) {
    if (index > 0) await testPage.page.keyboard.press('Enter');
    await testPage.page.keyboard.type(line);
  }
  await testPage.page.keyboard.press('Escape');
}

export class MathDiagramSharedNotes extends MultiUsers {
  async blockEquationRendersForEveryone() {
    await startBlockNoteSharedNotes(this.modPage);
    await startBlockNoteSharedNotes(this.userPage);
    await typeSlots(this.modPage, ['equation slot']);
    await insertBlockEquation(this.modPage, 'equation slot');

    for (const [who, testPage] of [
      ['moderator', this.modPage],
      ['attendee', this.userPage],
    ] as const) {
      await expect(
        testPage.page.locator(`${e.blockNoteMathBlock} .katex`),
        `the ${who} should see the equation typeset`,
      ).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });
    }
  }

  // Mermaid is not part of the client bundle: each participant downloads it
  // (as separate script chunks) only when a diagram is first drawn.
  async diagramRendersForEveryone() {
    const chunkRequests = { moderator: [] as string[], attendee: [] as string[] };
    for (const [who, testPage] of [
      ['moderator', this.modPage],
      ['attendee', this.userPage],
    ] as const) {
      testPage.page.on('response', (response) => {
        if (CHUNK_URL.test(response.url()) && response.ok()) chunkRequests[who].push(response.url());
      });
    }
    await startBlockNoteSharedNotes(this.modPage);
    await startBlockNoteSharedNotes(this.userPage);
    await typeSlots(this.modPage, ['diagram slot']);
    const chunksBeforeDiagram = { moderator: chunkRequests.moderator.length, attendee: chunkRequests.attendee.length };
    await insertDiagram(this.modPage, 'diagram slot');

    for (const [who, testPage] of [
      ['moderator', this.modPage],
      ['attendee', this.userPage],
    ] as const) {
      await expect(
        testPage.page.locator(`${e.blockNoteDiagram} svg`, { hasText: 'Decision' }),
        `the ${who} should see the diagram drawn from the new source`,
      ).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });
      expect(
        chunkRequests[who].length,
        `the ${who} should download Mermaid only once a diagram is drawn`,
      ).toBeGreaterThan(chunksBeforeDiagram[who]);
    }
  }

  // The notes server must know the math and diagram blocks: a block missing from
  // its schema is silently dropped from every export and recording.
  async markdownExportKeepsEquationsAndDiagrams() {
    await enableMarkdownNotesOptions(this.modPage);
    await startBlockNoteSharedNotes(this.modPage);
    await typeSlots(this.modPage, ['equation slot', 'diagram slot']);
    await insertBlockEquation(this.modPage, 'equation slot');
    await insertDiagram(this.modPage, 'diagram slot');

    await this.modPage.waitAndClick(e.notesOptions);
    const download = await this.modPage.handleDownload(
      this.modPage.page.locator(e.exportNotesAsMarkdown),
      undefined,
      ELEMENT_WAIT_LONGER_TIME,
    );
    if (!download?.download) throw new Error('Markdown export download did not start');
    expect(download.content, 'the export should keep the equation as LaTeX').toContain(`$$\n${EQUATION}\n$$`);
    expect(download.content, 'the export should keep the diagram as Mermaid source').toContain(
      ['```mermaid', ...DIAGRAM_LINES, '```'].join('\n'),
    );
  }

  // The TXT export (also read by recordings to tell empty notes apart) strips
  // every <...> span after writing the LaTeX source back into the HTML, so a
  // formula with < or > lost the text up to the next >.
  async textExportKeepsFormulaSymbols() {
    await startBlockNoteSharedNotes(this.modPage);
    await typeSlots(this.modPage, ['inline slot', 'edge slot', 'equation slot']);
    await insertFromSlashMenu(this.modPage, 'inline slot', 'Inline Equation');
    await typeInlineEquation(this.modPage, 'a<b');
    await this.modPage.page.keyboard.type(' then ');
    await this.modPage.page.keyboard.type('/Inline Equation');
    await this.modPage.page.keyboard.press('Enter');
    await typeInlineEquation(this.modPage, 'c>d');
    await this.modPage.page.keyboard.type(' end.');
    await insertFromSlashMenu(this.modPage, 'edge slot', 'Inline Equation');
    await typeInlineEquation(this.modPage, TEXT_EXPORT_EDGE_CASE);
    await insertFromSlashMenu(this.modPage, 'equation slot', 'Block Equation');
    await this.modPage.page.keyboard.type(TEXT_EXPORT_BLOCK_EQUATION);
    await this.modPage.page.keyboard.press('Escape');
    await expect(this.modPage.page.locator(`${e.blockNoteMathBlock} .katex`)).toBeVisible({
      timeout: ELEMENT_WAIT_LONGER_TIME,
    });

    // "Export as PDF" opens the authenticated export URL; reuse it for TXT
    await this.modPage.waitAndClick(e.notesOptions);
    const [pdfRequest] = await Promise.all([
      this.modPage.page.context().waitForEvent('request', {
        predicate: (request) =>
          request.url().includes('/hocuspocus/api/documents/') && request.url().includes('/export/pdf'),
        timeout: ELEMENT_WAIT_LONGER_TIME,
      }),
      this.modPage.waitAndClick(e.exportNotesAsPDF),
    ]);
    const textUrl = pdfRequest.url().replace('/export/pdf', '/export/txt');
    // the export reads the stored document, which follows the editor shortly
    await expect
      .poll(async () => (await this.modPage.page.request.get(textUrl)).text(), {
        message: 'the TXT export should keep every formula whole',
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toContain(`$$${TEXT_EXPORT_BLOCK_EQUATION}$$`);
    const text = await (await this.modPage.page.request.get(textUrl)).text();
    expect(text, 'a formula with < should keep its end').toContain('$a<b$');
    expect(text, 'a formula with > should stay whole').toContain('$c>d$');
    expect(text, 'the text after the formulas should stay').toContain('end.');
    expect(text, 'a literal entity and a tag-like source should stay as typed').toContain(`$${TEXT_EXPORT_EDGE_CASE}$`);
  }

  // DarkReader lightens SVG fills like text, which left light labels on light
  // boxes. In dark mode a diagram is drawn with Mermaid's dark theme and its
  // stylesheet is kept out of DarkReader (mermaid-on-demand.ts); switching the
  // theme redraws it. Guards the DarkReader and Mermaid internals this relies on.
  async diagramsFollowDarkMode() {
    await startBlockNoteSharedNotes(this.modPage);
    await typeSlots(this.modPage, ['diagram slot']);
    await insertDiagram(this.modPage, 'diagram slot');
    await expect(this.modPage.page.locator(`${e.blockNoteDiagram} svg`, { hasText: 'Decision' })).toBeVisible({
      timeout: ELEMENT_WAIT_LONGER_TIME,
    });

    await toggleDarkMode(this.modPage);
    await expect
      .poll(() => readDiagramColors(this.modPage), {
        message: 'in dark mode the diagram should have dark boxes, light labels and its own stylesheet',
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toMatchObject({ styleKeptFromDarkReader: true });
    const dark = await readDiagramColors(this.modPage);
    expect(dark!.boxLuminance, 'dark mode boxes should be darker than their labels').toBeLessThan(
      dark!.labelLuminance - 0.4,
    );

    await toggleDarkMode(this.modPage);
    await expect
      .poll(() => readDiagramColors(this.modPage), {
        message: 'back in light mode the diagram should be redrawn with the light theme',
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toMatchObject({ styleKeptFromDarkReader: false });
    const light = await readDiagramColors(this.modPage);
    expect(light!.boxLuminance, 'light mode boxes should be lighter than their labels').toBeGreaterThan(
      light!.labelLuminance + 0.4,
    );
  }

  // Typing amounts such as "R$ 10 e R$ 20" must not turn the text between the
  // dollar signs into inline math. BlockNote 0.56 does not register the $...$
  // shortcut of the inline equation; if it starts doing so, this fails.
  async typedPricesStayText() {
    await startBlockNoteSharedNotes(this.modPage);
    const editor = getBlockNoteEditorLocator(this.modPage);
    await editor.click();
    const prices = 'Custa R$ 10 e R$ 20 por pessoa.';
    await this.modPage.page.keyboard.type(prices);
    await expect(editor, 'the prices should stay as typed').toContainText(prices);
    await expect(this.modPage.page.locator(e.blockNoteInlineMath), 'no inline math should be created').toHaveCount(0);
  }
}
