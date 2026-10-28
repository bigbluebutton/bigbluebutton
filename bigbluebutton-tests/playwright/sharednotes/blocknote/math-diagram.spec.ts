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

  test('Block equations render for every participant', async () => {
    await mathDiagramSharedNotes.blockEquationRendersForEveryone();
  });

  test('Diagrams render for every participant', async () => {
    await mathDiagramSharedNotes.diagramRendersForEveryone();
  });

  test('Markdown export keeps equations and diagrams', async () => {
    await mathDiagramSharedNotes.markdownExportKeepsEquationsAndDiagrams();
  });

  test('TXT export keeps formulas with <, > and &', async () => {
    await mathDiagramSharedNotes.textExportKeepsFormulaSymbols();
  });

  test('Diagrams follow dark mode', async () => {
    await mathDiagramSharedNotes.diagramsFollowDarkMode();
  });

  test('Typed prices stay text', async () => {
    await mathDiagramSharedNotes.typedPricesStayText();
  });
});
