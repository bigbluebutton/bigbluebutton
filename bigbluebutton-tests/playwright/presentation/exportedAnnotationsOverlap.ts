import { execFileSync } from 'child_process';
import { expect, type TestInfo } from '@playwright/test';
import { ELEMENT_WAIT_LONGER_TIME, UPLOAD_PDF_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Presentation } from './presentation';

// Regression coverage for issue #24566 (text overlap in "export with annotations").
//
// A width-constrained text annotation (autoSize=false, i.e. the user dragged the
// width handle) is re-wrapped by bbb-export-annotations using opentype.js glyph
// advances, while the live client wraps via browser text layout. The two disagree
// by a few px per line, so at certain width/content combinations the export gains
// an extra line and spills into the annotation placed below it.
//
// The (synthetic) text and target width below sit in a measured divergence band
// (w=648..658, font "draw", size m, on v4.0.x-develop as of 2026-09-01) where the
// export renders one line more than the browser did. With the second annotation
// placed half a line height below the first, the extra exported line makes their
// PDF word boxes intersect, while the live shapes remain disjoint.
const WRAPPING_TEXT = 'a) - mehrere Beispielwörter ergeben zusammen eine lange Übungszeile\n'
  + '- weitere Zeilen prüfen die Umbruchbreite gründlich und zuverlässig\n'
  + '- Prüfkriterien für die Textbreite und die Zeilenhöhe\n'
  + '- übliche Übungswörter mit Umlauten\n'
  + '- Beispieltexte werden mehrfach geprüft';
const NEIGHBOR_TEXT = 'ZWEITE MARKER Zeile darunter bleibt frei';
const TARGET_PAGE_WIDTH = 653; // middle of the divergence band
const WIDTH_TOLERANCE = 4; // band is 648..658; converge must land within it
const LINE_HEIGHT_PAGE = 24 * 1.35; // size m font, tldraw line height

type Box = { x1: number; y1: number; x2: number; y2: number };

export class ExportedAnnotationsOverlap extends Presentation {
  async textAnnotationsDoNotOverlapInExport(testInfo: TestInfo) {
    try {
      execFileSync('pdftotext', ['-v'], { stdio: 'ignore' });
    } catch {
      testInfo.skip(true, 'pdftotext (poppler-utils) is not installed');
      return;
    }
    const { presentationWithAnnotationsDownloadable } = this.modPage.settings || {};
    if (!presentationWithAnnotationsDownloadable) {
      testInfo.skip(true, 'presentation.allowDownloadWithAnnotations is disabled');
      return;
    }

    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    const wbBox = await this.modPage.page.locator(e.whiteboard).boundingBox();
    if (!wbBox) throw new Error('whiteboard boundingBox is null');

    // First annotation: top-left area, then constrained to the divergence width
    await this.drawTextAnnotation(wbBox.x + wbBox.width * 0.1, wbBox.y + wbBox.height * 0.12, WRAPPING_TEXT);
    await this.resizeTextToPageWidth('Beispielwörter', TARGET_PAGE_WIDTH);

    // Second annotation: half a line height below the first one's live bottom
    const first = await this.getShapeScreenRect('Beispielwörter');
    const zoom = await this.getWhiteboardZoom('Beispielwörter');
    await this.drawTextAnnotation(first.x1, first.y2 + (LINE_HEIGHT_PAGE / 2) * zoom, NEIGHBOR_TEXT);

    // sanity: the two shapes must not overlap in the live session
    const liveFirst = await this.getShapeScreenRect('Beispielwörter');
    const liveSecond = await this.getShapeScreenRect('ZWEITE');
    expect(
      ExportedAnnotationsOverlap.boxesIntersect(liveFirst, liveSecond),
      'live annotations must be disjoint before exporting',
    ).toBe(false);

    // export in current state and download the annotated PDF
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.waitAndClick(e.managePresentations);
    await this.modPage.waitAndClick(e.presentationOptionsDownloadBtn);
    await this.modPage.waitAndClick(e.sendPresentationInCurrentStateBtn);
    await this.modPage.page.keyboard.press('Escape');
    const link = this.modPage.page.locator(e.downloadPresentation).last();
    await link.waitFor({ state: 'visible', timeout: UPLOAD_PDF_WAIT_TIME });
    const [download] = await Promise.all([
      this.modPage.page.waitForEvent('download'),
      link.click(),
    ]);
    const pdfPath = testInfo.outputPath('annotated-export.pdf');
    await download.saveAs(pdfPath);

    // locate both annotations' words in the PDF and assert their boxes are disjoint
    const words = ExportedAnnotationsOverlap.pdfWords(pdfPath);
    const boxFirst = ExportedAnnotationsOverlap.unionBox(words, ['Beispielwörter', 'Umbruchbreite', 'Prüfkriterien', 'Übungswörter', 'Beispieltexte']);
    const boxSecond = ExportedAnnotationsOverlap.unionBox(words, ['ZWEITE', 'MARKER', 'darunter']);
    expect(boxFirst, 'first annotation text must be present in the exported PDF').not.toBeNull();
    expect(boxSecond, 'second annotation text must be present in the exported PDF').not.toBeNull();
    expect(
      ExportedAnnotationsOverlap.boxesIntersect(boxFirst as Box, boxSecond as Box),
      `exported annotations must not overlap (first: ${JSON.stringify(boxFirst)}, second: ${JSON.stringify(boxSecond)})`,
    ).toBe(false);
  }

  private async drawTextAnnotation(screenX: number, screenY: number, text: string) {
    await this.modPage.waitAndClick(e.wbTextShape);
    await this.modPage.page.mouse.click(screenX, screenY);
    // typing before the shape editor takes focus sends keystrokes to canvas hotkeys
    await this.modPage.page.waitForFunction(() => {
      const a = document.activeElement as HTMLElement | null;
      return !!a && (a.isContentEditable || a.tagName === 'TEXTAREA') && !!a.closest('.tl-shape, .tl-container');
    }, { timeout: ELEMENT_WAIT_LONGER_TIME });
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i += 1) {
      await this.modPage.page.keyboard.type(lines[i], { delay: 5 });
      if (i < lines.length - 1) await this.modPage.page.keyboard.press('Enter');
    }
    await this.modPage.page.keyboard.press('Escape');
    await this.modPage.page.waitForTimeout(300);
  }

  // tldraw stores shape width in page units on the element's inline style, while
  // getBoundingClientRect is in screen px - the ratio is the current zoom.
  private async getShapeInfo(needle: string) {
    return this.modPage.page.evaluate((n) => {
      const el = Array.from(document.querySelectorAll('.tl-shape'))
        .find((s) => (s.textContent || '').includes(n)) as HTMLElement | undefined;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { pageW: parseFloat(el.style.width), rect: { x1: r.x, y1: r.y, x2: r.x + r.width, y2: r.y + r.height }, screenW: r.width };
    }, needle);
  }

  private async getShapeScreenRect(needle: string): Promise<Box> {
    const info = await this.getShapeInfo(needle);
    if (!info) throw new Error(`shape containing "${needle}" not found`);
    return info.rect;
  }

  private async getWhiteboardZoom(needle: string): Promise<number> {
    const info = await this.getShapeInfo(needle);
    if (!info || !info.pageW) throw new Error('cannot determine zoom');
    return info.screenW / info.pageW;
  }

  // constrain the shape to an exact page-unit width (autoSize=false), as if the user
  // had dragged the width handle there. Uses the tldraw editor instance that
  // @bigbluebutton/editor exposes on window - the same code path a pointer drag takes.
  private async resizeTextToPageWidth(needle: string, targetPageW: number) {
    const finalW = await this.modPage.page.evaluate(([n, w]) => {
      const editor = (window as { editor?: any }).editor;
      if (!editor) throw new Error('window.editor is not exposed by the whiteboard');
      const shape = editor.getCurrentPageShapes()
        .find((s: any) => s.type === 'text' && (s.props?.text || '').includes(n));
      if (!shape) throw new Error(`text shape containing "${n}" not found`);
      editor.updateShape({ id: shape.id, type: 'text', props: { w, autoSize: false } });
      return editor.getShape(shape.id).props.w;
    }, [needle, targetPageW] as const);
    expect(finalW, `text shape width must be set to ${targetPageW}`).toBe(targetPageW);
    // give the client a moment to persist the shape update before exporting
    await this.modPage.page.waitForTimeout(1000);
  }

  private static pdfWords(pdfPath: string) {
    const xml = execFileSync('pdftotext', ['-bbox', pdfPath, '-'], { encoding: 'utf8' });
    const words: Array<Box & { t: string }> = [];
    for (const line of xml.split('\n')) {
      const m = line.match(/<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)<\/word>/);
      if (m) words.push({ x1: +m[1], y1: +m[2], x2: +m[3], y2: +m[4], t: m[5] });
    }
    return words;
  }

  private static unionBox(words: Array<Box & { t: string }>, tokens: string[]): Box | null {
    const hits = words.filter((w) => tokens.some((t) => w.t.includes(t)));
    if (!hits.length) return null;
    return {
      x1: Math.min(...hits.map((w) => w.x1)),
      y1: Math.min(...hits.map((w) => w.y1)),
      x2: Math.max(...hits.map((w) => w.x2)),
      y2: Math.max(...hits.map((w) => w.y2)),
    };
  }

  private static boxesIntersect(a: Box, b: Box): boolean {
    const w = Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1);
    const h = Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1);
    return w > 1 && h > 1;
  }
}
