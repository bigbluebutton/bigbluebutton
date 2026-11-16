import { initializePages } from '../../core/helpers';
import { test } from '../../core/setup/fixtures';
import { MathDiagramSharedNotes } from './math-diagram';

test.describe.parallel('Shared Notes - BlockNote math and diagrams', { tag: '@ci' }, () => {
  let mathDiagramSharedNotes: MathDiagramSharedNotes;

  test.beforeEach(async ({ browser, context }, testInfo) => {
    mathDiagramSharedNotes = new MathDiagramSharedNotes(browser, context);
    await initializePages(mathDiagramSharedNotes, browser, {
      isMultiUser: true,
      testInfo,
    });
  });

  test('Equations and diagrams render for every participant', async () => {
    await mathDiagramSharedNotes.equationsAndDiagramsRenderForEveryone();
  });

  test('Markdown export keeps equations and diagrams', async () => {
    await mathDiagramSharedNotes.markdownExportKeepsEquationsAndDiagrams();
  });

  test('TXT export keeps formulas with <, > and &', async () => {
    await mathDiagramSharedNotes.textExportKeepsFormulaSymbols();
  });

  test('Diagrams stay light cards in dark mode', async () => {
    await mathDiagramSharedNotes.diagramsStayLightCardsInDarkMode();
  });
});
