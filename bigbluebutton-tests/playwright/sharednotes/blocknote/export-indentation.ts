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

// Horizontal slack for boundingBox comparisons (sub-pixel rounding / font metrics).
const X_EPSILON = 4;

interface SeedBlock {
  id: string;
  type: string;
  props: Record<string, unknown>;
  content: { type: 'text'; text: string; styles: Record<string, unknown> }[];
  children: SeedBlock[];
}

// Builds a BlockNote block in the shape documented for sharedNotesInitialContentJson
// (see docs/development/api.md and the markdown spec's jsonModule helper).
function block(id: string, type: string, text: string, children: SeedBlock[] = []): SeedBlock {
  const props: Record<string, unknown> = { textAlignment: 'left', backgroundColor: 'default', textColor: 'default' };
  if (type === 'heading') props.level = 2;
  return { id, type, props, content: [{ type: 'text', text, styles: {} }], children };
}

// A document that exercises the bug: paragraphs nested by Tab (levels 0/1/2) and a
// paragraph flattened out from under a bullet, plus a real nested bullet to guard
// against list double-indentation.
function seedModule(): string {
  const blocks: SeedBlock[] = [
    block('00000000-0000-0000-0000-000000000001', 'paragraph', L0, [
      block('00000000-0000-0000-0000-000000000002', 'paragraph', L1, [
        block('00000000-0000-0000-0000-000000000003', 'paragraph', L2),
      ]),
    ]),
    block('00000000-0000-0000-0000-000000000004', 'bulletListItem', BULLET_PARENT, [
      block('00000000-0000-0000-0000-000000000005', 'bulletListItem', BULLET_CHILD),
      block('00000000-0000-0000-0000-000000000006', 'paragraph', PARA_UNDER_BULLET),
    ]),
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
      const leftEdge = async (tag: string, text: string): Promise<number> => {
        const box = await probe.locator(`${tag}:text-is("${text}")`).first().boundingBox();
        expect(box, `"${text}" should be present in the exported HTML`).not.toBeNull();
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
    } finally {
      await context.close();
    }
  }
}
