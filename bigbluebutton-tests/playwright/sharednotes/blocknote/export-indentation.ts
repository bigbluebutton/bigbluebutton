import { expect } from '@playwright/test';

import { elements as e } from '../../core/elements';
import { createMeetingWithModules } from '../../core/helpers';
import { MultiUsers } from '../../user/multiusers';
import { startBlockNoteSharedNotes } from './util';

// Distinct texts so each block can be located by an exact text match.
const L0 = 'IndentLevelZero';
const L1 = 'IndentLevelOne';
const L2 = 'IndentLevelTwo';
const BULLET_PARENT = 'BulletParent';
const BULLET_CHILD = 'BulletChild';
const PARA_UNDER_BULLET = 'ParagraphUnderBullet';
const HEADING_PARENT = 'HeadingParent';
const NESTED_HEADING = 'NestedHeading';
const QUOTE_PARENT = 'QuoteParent';
const NESTED_QUOTE = 'NestedQuote';
const CODE_PARENT = 'CodeParent';
const NESTED_CODE = 'nestedCodeLine';
const OL_PARENT = 'OrderedParent';
const OL_CHILD = 'OrderedChild';
// Deep paragraph chain to exercise the depth cap (indent stops growing beyond
// MAX_NESTING_LEVEL). L9/L10 straddle the cap; L11 must clamp to L10's indent.
const CLAMP_L9 = 'ClampLevelNine';
const CLAMP_L10 = 'ClampLevelTen';
const CLAMP_L11 = 'ClampLevelEleven';

// Horizontal slack for boundingBox comparisons (sub-pixel rounding / font metrics).
const X_EPSILON = 4;

interface SeedBlock {
  id: string;
  type: string;
  props: Record<string, unknown>;
  content: { type: 'text'; text: string; styles: Record<string, unknown> }[];
  children: SeedBlock[];
}

// Deterministic, unique block ids so the seed payload is stable across runs.
function uuid(n: number): string {
  return `00000000-0000-0000-0000-${n.toString().padStart(12, '0')}`;
}

// Builds a BlockNote block in the shape documented for sharedNotesInitialContentJson
// (see docs/development/api.md and the markdown spec's jsonModule helper). Props are
// filled per type so each block validates against the default BlockNote schema.
function block(id: string, type: string, text: string, children: SeedBlock[] = []): SeedBlock {
  let props: Record<string, unknown> = { textAlignment: 'left', backgroundColor: 'default', textColor: 'default' };
  if (type === 'heading') props.level = 2;
  if (type === 'codeBlock') props = { language: 'javascript' };
  return { id, type, props, content: [{ type: 'text', text, styles: {} }], children };
}

// A single paragraph nested `depth` levels deep (levels 9/10/11 carry marker texts) so the
// depth cap can be measured: the exported blocks step right until the cap, then stop.
function deepParagraphChain(): SeedBlock {
  const label = (level: number): string => {
    if (level === 9) return CLAMP_L9;
    if (level === 10) return CLAMP_L10;
    if (level === 11) return CLAMP_L11;
    return `ClampFiller${level}`;
  };
  let node = block(uuid(111), 'paragraph', label(11));
  for (let level = 10; level >= 0; level--) {
    node = block(uuid(100 + level), 'paragraph', label(level), [node]);
  }
  return node;
}

// A document that exercises the bug across every block type blocksToHTMLLossy() flattens
// into data-nesting-level siblings: paragraphs nested by Tab, a paragraph flattened out from
// under a bullet, a real nested bullet (list double-indent guard), a nested heading, quote
// and code block, an ordered list, and a chain deeper than the indent cap.
function seedModule(): string {
  const blocks: SeedBlock[] = [
    block(uuid(1), 'paragraph', L0, [block(uuid(2), 'paragraph', L1, [block(uuid(3), 'paragraph', L2)])]),
    block(uuid(4), 'bulletListItem', BULLET_PARENT, [
      block(uuid(5), 'bulletListItem', BULLET_CHILD),
      block(uuid(6), 'paragraph', PARA_UNDER_BULLET),
    ]),
    block(uuid(7), 'paragraph', HEADING_PARENT, [block(uuid(8), 'heading', NESTED_HEADING)]),
    block(uuid(9), 'paragraph', QUOTE_PARENT, [block(uuid(10), 'quote', NESTED_QUOTE)]),
    block(uuid(11), 'paragraph', CODE_PARENT, [block(uuid(12), 'codeBlock', NESTED_CODE)]),
    block(uuid(13), 'numberedListItem', OL_PARENT, [block(uuid(14), 'numberedListItem', OL_CHILD)]),
    deepParagraphChain(),
  ];
  const json = JSON.stringify(blocks);
  return `<modules><module name="sharedNotesInitialContentJson"><![CDATA[${json}]]></module></modules>`;
}

export class ExportIndentationSharedNotes extends MultiUsers {
  // Creates a meeting seeded with the nested document, then joins as moderator.
  private async createAndJoinSeeded() {
    const meetingId = await createMeetingWithModules(seedModule(), 'sharedNotesEditor=blocknote');
    const context = await this.browser.newContext();
    const page = await context.newPage();
    await this.initModPage(page, { meetingId });
  }

  // Reproduces the product's "Export as PDF" action to obtain the export URL, then
  // fetches the sibling HTML export (same handler, same generated HTML) so the layout
  // can be measured in a real browser. Returns the exported HTML document.
  private async fetchExportedHtml(): Promise<string> {
    // The menu item calls window.open(...export/pdf...); stub it to capture the URL
    // instead of spawning a popup/download.
    await this.modPage.page.evaluate(() => {
      (window as unknown as { bbbExportUrls: string[] }).bbbExportUrls = [];
      window.open = ((url?: string | URL) => {
        (window as unknown as { bbbExportUrls: string[] }).bbbExportUrls.push(String(url));
        return null;
      }) as typeof window.open;
    });

    await this.modPage.waitAndClick(e.notesOptions);
    await this.modPage.page.locator(e.exportNotesAsPDF).click();

    const pdfUrl = await this.modPage.page.evaluate(
      () => (window as unknown as { bbbExportUrls: string[] }).bbbExportUrls[0],
    );
    expect(pdfUrl, 'clicking Export as PDF should open the export URL').toContain('/export/pdf');

    // The PDF is rendered from this same HTML; measuring the HTML export is the
    // faithful, headless way to assert the indentation the PDF will carry.
    const htmlUrl = pdfUrl.replace('/export/pdf', '/export/html');
    const response = await this.modPage.page.request.get(htmlUrl);
    expect(response.ok(), `the HTML export should be served (GET ${htmlUrl})`).toBeTruthy();
    return response.text();
  }

  async nestedBlocksKeepIndentationInExport() {
    await this.createAndJoinSeeded();
    await startBlockNoteSharedNotes(this.modPage);

    const html = await this.fetchExportedHtml();

    // Render the exported HTML in an isolated page and read each block's left edge.
    const context = await this.browser.newContext();
    const probe = await context.newPage();
    try {
      await probe.setContent(html);
      // Left edge of the first element matching the CSS selector that also contains `text`.
      const leftEdge = async (selector: string, text: string): Promise<number> => {
        const box = await probe.locator(selector, { hasText: text }).first().boundingBox();
        expect(box, `"${text}" should be present in the exported HTML (${selector})`).not.toBeNull();
        return box!.x;
      };

      const xL0 = await leftEdge('p', L0);
      const xL1 = await leftEdge('p', L1);
      const xL2 = await leftEdge('p', L2);
      const xBulletParent = await leftEdge('p', BULLET_PARENT);
      const xBulletChild = await leftEdge('p', BULLET_CHILD);
      const xParaUnderBullet = await leftEdge('p', PARA_UNDER_BULLET);

      // The bug: nested paragraphs collapse to the same left margin. Fixed: each Tab
      // level steps further right.
      expect(xL1, 'a once-nested paragraph should be indented past its parent').toBeGreaterThan(xL0 + X_EPSILON);
      expect(xL2, 'a twice-nested paragraph should be indented past the first level').toBeGreaterThan(xL1 + X_EPSILON);

      // The issue's "further left than its own bullet": a paragraph flattened out from
      // under a bullet used to sit at the page margin. It must now be indented at least
      // to the bullet's content column.
      expect(
        xParaUnderBullet,
        'a paragraph nested under a bullet should not render at the page margin',
      ).toBeGreaterThan(xL0 + X_EPSILON);
      expect(
        xParaUnderBullet,
        'a paragraph under a bullet should align with the bullet content, not fall short of it',
      ).toBeGreaterThanOrEqual(xBulletParent - X_EPSILON);

      // No regression: a real nested list item stays indented by exactly one list level
      // (the ~32px list padding), not two. A margin rule that leaked onto <li> would
      // roughly double this gap (~64px), so anything under 60px proves it did not.
      const oneListLevel = xBulletChild - xBulletParent;
      expect(oneListLevel, 'a nested bullet should still be indented past its parent').toBeGreaterThan(X_EPSILON);
      expect(
        oneListLevel,
        'a nested bullet should be indented by a single list level (no double-indentation)',
      ).toBeLessThan(60);

      // A nested heading and blockquote are flattened into data-nesting-level siblings too;
      // both must indent past their (level-0) parent instead of rendering flush left.
      const xHeadingParent = await leftEdge('p', HEADING_PARENT);
      const xNestedHeading = await leftEdge('h2', NESTED_HEADING);
      expect(xNestedHeading, 'a nested heading should be indented past its parent').toBeGreaterThan(
        xHeadingParent + X_EPSILON,
      );

      const xQuoteParent = await leftEdge('p', QUOTE_PARENT);
      const xNestedQuote = await leftEdge('blockquote', NESTED_QUOTE);
      expect(xNestedQuote, 'a nested blockquote should be indented past its parent').toBeGreaterThan(
        xQuoteParent + X_EPSILON,
      );

      // A nested code block is flattened into <pre data-nesting-level>; it must indent too
      // (this is exactly the case that regressed because <pre> was missing from the rules).
      const xCodeParent = await leftEdge('p', CODE_PARENT);
      const xNestedCode = await leftEdge('pre', NESTED_CODE);
      expect(xNestedCode, 'a nested code block should be indented past its parent').toBeGreaterThan(
        xCodeParent + X_EPSILON,
      );

      // An ordered list mirrors the bullet guard: the nested item steps right by exactly one
      // list level, not two (the margin rule must not leak onto <li>).
      const xOrderedParent = await leftEdge('p', OL_PARENT);
      const xOrderedChild = await leftEdge('p', OL_CHILD);
      const oneOrderedLevel = xOrderedChild - xOrderedParent;
      expect(oneOrderedLevel, 'a nested ordered item should be indented past its parent').toBeGreaterThan(X_EPSILON);
      expect(
        oneOrderedLevel,
        'a nested ordered item should be indented by a single list level (no double-indentation)',
      ).toBeLessThan(60);

      // The depth cap: indentation grows up to MAX_NESTING_LEVEL (level 10) and then stops.
      // Level 10 must sit further right than level 9, and level 11 must clamp to level 10.
      const xClampL9 = await leftEdge('p', CLAMP_L9);
      const xClampL10 = await leftEdge('p', CLAMP_L10);
      const xClampL11 = await leftEdge('p', CLAMP_L11);
      expect(xClampL10, 'indentation should still grow up to the cap').toBeGreaterThan(xClampL9 + X_EPSILON);
      expect(
        Math.abs(xClampL11 - xClampL10),
        'a depth beyond the cap should clamp to the maximum indent, not keep growing',
      ).toBeLessThanOrEqual(X_EPSILON);
    } finally {
      await context.close();
    }
  }
}
