import { expect, type TestInfo } from '@playwright/test';
import { execFileSync } from 'child_process';

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
const WRAPPING_TEXT =
  'a) - mehrere Beispielwörter ergeben zusammen eine lange Übungszeile\n' +
  '- weitere Zeilen prüfen die Umbruchbreite gründlich und zuverlässig\n' +
  '- Prüfkriterien für die Textbreite und die Zeilenhöhe\n' +
  '- übliche Übungswörter mit Umlauten\n' +
  '- Beispieltexte werden mehrfach geprüft';
const NEIGHBOR_TEXT = 'ZWEITE MARKER Zeile darunter bleibt frei';
const TARGET_PAGE_WIDTH = 653; // middle of the divergence band
const LINE_HEIGHT_PAGE = 24 * 1.35; // size m font, tldraw line height

// Regression coverage for the export measuring text with opentype.js glyph advances
// (October 2026 report on 3.0.39). Those advances ignore the draw font's kerning and
// contextual alternates, so long lines measured 2-3% wider than the browser laid them
// out; the report's export wrapped a trailing period and a short word onto lines of
// their own, grew the shape by two lines and pushed its last items below the page edge.
//
// Lines 1 and 2 of "Abschnitt B" are about 200 characters long on purpose: the browser
// measures them at 2618 px and 2623 px (size m), the opentype.js export at 2661 px and
// 2666 px. At the width below the browser keeps both whole with 9 px to spare even when
// the browser rounds glyph advances to whole pixels (CI runs without
// --font-render-hinting=none), while the old export wrapped both. The text is synthetic
// filler, metrically similar to the reported annotation but not copied from it.
const LINE_BREAKS_TEXT = [
  'Abschnitt A',
  ' - mehrere Beispielwörter ergeben zusammen eine lange Übungszeile',
  '   - weitere Zeilen prüfen die Umbruchbreite gründlich und zuverlässig',
  '   - Prüfkriterien für die Textbreite und die Zeilenhöhe',
  '   - übliche Übungswörter mit Umlauten',
  'Abschnitt B',
  ' 1. Die Prüfung mehrerer Beispielzeilen zeigt, ob der Umbruch im Export dem Umbruch im Client entspricht' +
    ' und ob jede Zeile vollständig bleibt, auch wenn sie sehr lang ist und viele Wörter mit Umlauten enthält.',
  ' 2. Alle Zeilen verwenden dieselbe Schriftart und werden nach denselben Regeln umbrochen und gemessen,' +
    ' damit beide Seiten übereinstimmen und kein Wort und kein Satzzeichen auf eine eigene Zeile rutscht.',
  ' 3. Durch mehrere Messungen und Vergleiche werden Export und Client zuverlässig und sauber abgeglichen,' +
    ' bis kein Unterschied mehr bleibt und jede Zeile im Dokument genau so endet wie im Client.',
  '',
  'Abschnitt C',
  ' 1. Beispielübung als Rollenspiel: In der Übung können Umbruchbreite, Zeilenhöhe, Schriftgröße, Abstand',
  '    und Ausrichtung geprüft werden, damit der exportierte Text dem Text im Client entspricht',
  ' 2. Zweite Übung: In der Übung zeigt sich, ob lange Zeilen mit Umlauten und Satzzeichen erhalten bleiben',
  '    und ob der letzte Satz einer Zeile nicht auf eine eigene Zeile rutscht.',
  ' 3. Dritte Übung: In der Übung werden mehrere Absätze nacheinander umbrochen. Dabei lassen sich Abstand,',
  '    Zeilenhöhe, Breite und Position der Zeilen im exportierten Dokument gründlich prüfen. Dies',
  '    zeigt, ob der Export dieselben Umbrüche wie der Client erzeugt',
  '',
  'Abschnitt D',
  ' 1. Beispielschritt festlegen',
  ' 2. Beispielschritt vorbereiten',
  ' 3. Beteiligte informieren und einladen',
  ' 4. Übung durchführen',
  ' 5. Ergebnisse auswerten',
  ' 6. Entscheiden und Rückmeldung geben',
].join('\n');
const LINE_BREAKS_PAGE_WIDTH = 2632; // unscaled; the browser wraps nothing at this width
const LINE_BREAKS_SCALE = 0.5; // 2632 x 0.5 = 1316 page units, inside the slide
const LINE_BREAKS_EXPECTED_LINES = 26; // one line per paragraph, blank ones included
// blank paragraphs leave no words in the PDF, so only the others produce text rows
const LINE_BREAKS_EXPECTED_ROWS = LINE_BREAKS_TEXT.split('\n').filter(Boolean).length;
const LINE_BREAKS_SLIDE = 3; // a blank slide, so only the annotation produces text rows

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

    const pdfPath = await this.downloadCurrentStateExport(testInfo, 'annotated-export.pdf');

    // locate both annotations' words in the PDF and assert their boxes are disjoint
    const words = ExportedAnnotationsOverlap.pdfWords(pdfPath);
    const boxFirst = ExportedAnnotationsOverlap.unionBox(words, [
      'Beispielwörter',
      'Umbruchbreite',
      'Prüfkriterien',
      'Übungswörter',
      'Beispieltexte',
    ]);
    const boxSecond = ExportedAnnotationsOverlap.unionBox(words, ['ZWEITE', 'MARKER', 'darunter']);
    expect(boxFirst, 'first annotation text must be present in the exported PDF').not.toBeNull();
    expect(boxSecond, 'second annotation text must be present in the exported PDF').not.toBeNull();
    expect(
      ExportedAnnotationsOverlap.boxesIntersect(boxFirst as Box, boxSecond as Box),
      `exported annotations must not overlap: ${JSON.stringify({ boxFirst, boxSecond })}`,
    ).toBe(false);
  }

  async textAnnotationKeepsClientLineBreaks(testInfo: TestInfo) {
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
    for (let slide = 1; slide < LINE_BREAKS_SLIDE; slide += 1) {
      await this.modPage.waitAndClick(e.nextSlide);
      await this.modPage.page.waitForTimeout(1000);
    }
    const wbBox = await this.modPage.page.locator(e.whiteboard).boundingBox();
    if (!wbBox) throw new Error('whiteboard boundingBox is null');

    await this.drawTextAnnotation(wbBox.x + wbBox.width * 0.02, wbBox.y + wbBox.height * 0.02, LINE_BREAKS_TEXT);
    await this.setTextShapeWidthAndScale('Beispielzeilen', LINE_BREAKS_PAGE_WIDTH, LINE_BREAKS_SCALE);

    // the typed text must round-trip unchanged, otherwise the width tuning below is void
    const stored = await this.modPage.page.evaluate((n) => {
      const { editor } = window as { editor?: any };
      const shape = editor
        .getCurrentPageShapes()
        .find((s: any) => s.type === 'text' && (s.props?.text || '').includes(n));
      return { text: shape?.props?.text, props: { ...shape?.props, text: undefined } };
    }, 'Beispielzeilen');
    expect(stored.text, `stored text differs from the typed text; shape props: ${JSON.stringify(stored.props)}`).toBe(
      LINE_BREAKS_TEXT,
    );

    // the fixture only exercises the divergence if the client keeps the long lines whole
    const liveLines = await this.getLiveLineCount('Beispielzeilen', LINE_BREAKS_SCALE);
    expect(
      Math.round(liveLines),
      `the client must render ${LINE_BREAKS_EXPECTED_LINES} lines at width ${LINE_BREAKS_PAGE_WIDTH},` +
        ` got ${liveLines.toFixed(2)}: retune the fixture`,
    ).toBe(LINE_BREAKS_EXPECTED_LINES);

    const pdfPath = await this.downloadCurrentStateExport(testInfo, 'annotated-export-line-breaks.pdf');

    // group the page's words into text rows; every row between the annotation's first and
    // last line belongs to it (a blank slide carries only the "left blank" label, below it)
    const words = ExportedAnnotationsOverlap.pdfWordsOnPage(pdfPath, LINE_BREAKS_SLIDE);
    const rows = ExportedAnnotationsOverlap.groupIntoRows(words);
    const vocabulary = new Set(
      LINE_BREAKS_TEXT.split(/\s+/)
        .map(ExportedAnnotationsOverlap.lettersOnly)
        .filter((w) => w.length >= 4),
    );
    const isContent = (row: Array<Box & { t: string }>) =>
      row.some((w) => vocabulary.has(ExportedAnnotationsOverlap.lettersOnly(w.t)));
    const first = rows.findIndex(isContent);
    const last = rows.length - 1 - [...rows].reverse().findIndex(isContent);
    expect(first, 'the annotation text must be present in the exported PDF').toBeGreaterThanOrEqual(0);
    const annotationRows = rows.slice(first, last + 1);
    const punctuationRows = annotationRows.filter((row) => row.every((w) => /^[.,;:!?]+$/.test(w.t)));
    const describe = (list: Array<Array<Box & { t: string }>>) =>
      list
        .map(
          (row) =>
            `y=${row[0].y1.toFixed(0)}: ${row
              .map((w) => w.t)
              .join(' ')
              .slice(0, 60)}`,
        )
        .join('\n');

    expect(
      punctuationRows.length,
      `the export must not wrap punctuation onto lines of its own:\n${describe(punctuationRows)}`,
    ).toBe(0);
    expect(
      annotationRows.length,
      `the export must have the client's ${LINE_BREAKS_EXPECTED_ROWS} text rows, got ${annotationRows.length}:
${describe(annotationRows)}`,
    ).toBe(LINE_BREAKS_EXPECTED_ROWS);
    expect(
      annotationRows[annotationRows.length - 1].some(
        (w) => ExportedAnnotationsOverlap.lettersOnly(w.t) === 'Rückmeldung',
      ),
      'the last line of the annotation must be the last row on the page',
    ).toBe(true);
  }

  private async downloadCurrentStateExport(testInfo: TestInfo, fileName: string): Promise<string> {
    // the download link arrives as a public chat message, so the chat panel must be open
    if (!(await this.modPage.page.locator(e.chatMessages).isVisible())) {
      if (!(await this.modPage.page.locator(e.chatButton).isVisible())) {
        await this.modPage.waitAndClick(e.userListToggleBtn);
      }
      await this.modPage.waitAndClick(e.chatButton);
      await this.modPage.hasElement(e.chatMessages, 'should display the public chat messages');
    }

    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.waitAndClick(e.managePresentations);
    await this.modPage.waitAndClick(e.presentationOptionsDownloadBtn);
    await this.modPage.waitAndClick(e.sendPresentationInCurrentStateBtn);
    await this.modPage.page.keyboard.press('Escape');
    const link = this.modPage.page.locator(e.downloadPresentation).last();
    await link.waitFor({ state: 'visible', timeout: UPLOAD_PDF_WAIT_TIME });
    const [download] = await Promise.all([this.modPage.page.waitForEvent('download'), link.click()]);
    const pdfPath = testInfo.outputPath(fileName);
    await download.saveAs(pdfPath);
    return pdfPath;
  }

  // width in page units with the shape scaled down, as a user does with the corner handles
  private async setTextShapeWidthAndScale(needle: string, targetPageW: number, scale: number) {
    const props = await this.modPage.page.evaluate(
      ([n, w, sc]) => {
        const { editor } = window as { editor?: any };
        if (!editor) throw new Error('window.editor is not exposed by the whiteboard');
        const shape = editor
          .getCurrentPageShapes()
          .find((s: any) => s.type === 'text' && (s.props?.text || '').includes(n));
        if (!shape) throw new Error(`text shape containing "${n}" not found`);
        editor.updateShape({ id: shape.id, type: 'text', props: { w, autoSize: false, scale: sc } });
        const updated = editor.getShape(shape.id).props;
        return { w: updated.w, scale: updated.scale };
      },
      [needle, targetPageW, scale] as const,
    );
    expect(props.w, `text shape width must be set to ${targetPageW}`).toBe(targetPageW);
    expect(props.scale, `text shape scale must be set to ${scale}`).toBe(scale);
    await this.modPage.page.waitForTimeout(1000);
  }

  private async getLiveLineCount(needle: string, scale: number): Promise<number> {
    const height = await this.modPage.page.evaluate((n) => {
      const { editor } = window as { editor?: any };
      const shape = editor
        .getCurrentPageShapes()
        .find((s: any) => s.type === 'text' && (s.props?.text || '').includes(n));
      if (!shape) throw new Error(`text shape containing "${n}" not found`);
      return editor.getShapePageBounds(shape.id).h;
    }, needle);
    return height / (LINE_HEIGHT_PAGE * scale);
  }

  private static lettersOnly(word: string): string {
    return word.replace(/[^\p{L}]/gu, '');
  }

  private static pdfWordsOnPage(pdfPath: string, pageNo: number) {
    const page = String(pageNo);
    const xml = execFileSync('pdftotext', ['-bbox', '-f', page, '-l', page, pdfPath, '-'], {
      encoding: 'utf8',
    });
    const words: Array<Box & { t: string }> = [];
    for (const line of xml.split('\n')) {
      const m = line.match(/<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)<\/word>/);
      if (m) words.push({ x1: +m[1], y1: +m[2], x2: +m[3], y2: +m[4], t: m[5] });
    }
    return words;
  }

  // words whose top edges lie within a few points of each other form one text row
  private static groupIntoRows(words: Array<Box & { t: string }>) {
    const sorted = [...words].sort((a, b) => a.y1 - b.y1 || a.x1 - b.x1);
    const rows: Array<Array<Box & { t: string }>> = [];
    for (const w of sorted) {
      const row = rows[rows.length - 1];
      if (row && Math.abs(row[0].y1 - w.y1) <= 4) row.push(w);
      else rows.push([w]);
    }
    return rows;
  }

  private async drawTextAnnotation(screenX: number, screenY: number, text: string) {
    await this.modPage.waitAndClick(e.wbTextShape);
    await this.modPage.page.mouse.click(screenX, screenY);
    // typing before the shape editor takes focus sends keystrokes to canvas hotkeys
    await this.modPage.page.waitForFunction(
      () => {
        const a = document.activeElement as HTMLElement | null;
        return !!a && (a.isContentEditable || a.tagName === 'TEXTAREA') && !!a.closest('.tl-shape, .tl-container');
      },
      { timeout: ELEMENT_WAIT_LONGER_TIME },
    );
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
      const el = Array.from(document.querySelectorAll('.tl-shape')).find((s) => (s.textContent || '').includes(n)) as
        | HTMLElement
        | undefined;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        pageW: parseFloat(el.style.width),
        rect: { x1: r.x, y1: r.y, x2: r.x + r.width, y2: r.y + r.height },
        screenW: r.width,
      };
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
    const finalW = await this.modPage.page.evaluate(
      ([n, w]) => {
        const { editor } = window as { editor?: any };
        if (!editor) throw new Error('window.editor is not exposed by the whiteboard');
        const shape = editor
          .getCurrentPageShapes()
          .find((s: any) => s.type === 'text' && (s.props?.text || '').includes(n));
        if (!shape) throw new Error(`text shape containing "${n}" not found`);
        editor.updateShape({ id: shape.id, type: 'text', props: { w, autoSize: false } });
        return editor.getShape(shape.id).props.w;
      },
      [needle, targetPageW] as const,
    );
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
