const { test } = require('../fixtures');
const { TextShape } = require('./textShape');
const { ShapeTools } = require('./shapeTools');
const { ChangeStyles } = require('./changeStyles');
const { ShapeOptions } = require('./shapeOptions');
const { DrawShape } = require('./drawShape');
const e = require('../core/elements');

//! @flaky note:
// all whiteboard tests are flagged as flaky due to unexpected zooming slides
// only avoiding those assertions won't be enough as most of the tests are relying only on snapshot comparisons
// so together with the further fix + re-enablement of the tests, they will need to have non-snapshot assertions added as well
// P.S. 1. the failures seems to be noticeable only on the CI
// P.S. 2. Tests updated + re-enabled on March, 2025
test.describe.parallel('Whiteboard tools', { tag: '@ci' }, () => {
  test.beforeEach(({ browserName }) => {
    test.skip(browserName !== 'chromium',
      'Drawing visual regression tests are enabled only for Chromium');
  });

  test('Draw rectangle', async ({ browser, context, page }) => {
    const rectangle = new DrawShape(browser, context);
    await rectangle.initModPage(page, true);
    await rectangle.initUserPage(true, context);
    await rectangle.drawShape(e.wbRectangleShape, 'rectangle');
  });

  test('Draw ellipse', async ({ browser, context, page }) => {
    const ellipse = new DrawShape(browser, context);
    await ellipse.initModPage(page, true);
    await ellipse.initUserPage(true, context);
    await ellipse.drawShape(e.wbEllipseShape, 'ellipse');
  });

  test('Draw triangle', async ({ browser, context, page }) => {
    const triangle = new DrawShape(browser, context);
    await triangle.initModPage(page, true);
    await triangle.initUserPage(true, context);
    await triangle.drawShape(e.wbTriangleShape, 'triangle');
  });

  test('Draw line', async ({ browser, context, page }) => {
    const line = new DrawShape(browser, context);
    await line.initModPage(page, true);
    await line.initUserPage(true, context);
    await line.drawShape(e.wbLineShape, 'line', e.wbDrawnLine);
  });

  test('Draw arrow', async ({ browser, context, page }) => {
    const arrow = new DrawShape(browser, context);
    await arrow.initModPage(page, true);
    await arrow.initUserPage(true, context);
    await arrow.drawShape(e.wbArrowShape, 'arrow', e.wbDrawnArrow);
  });

  test('Draw with pencil', async ({ browser, context, page }) => {
    const pencil = new DrawShape(browser, context);
    await pencil.initModPage(page, true);
    await pencil.initUserPage(true, context);
    await pencil.drawShape(e.wbPencilShape, 'pencil', e.wbDraw)
  });

  test('Type text', async ({ browser, context, page }) => {
    const textShape = new TextShape(browser, context);
    await textShape.initModPage(page, true);
    await textShape.initUserPage(true, context);
    await textShape.typeText();
  });

  test('Sticky note', async ({ browser, context, page }) => {
    const textShape = new TextShape(browser, context);
    await textShape.initModPage(page, true);
    await textShape.initUserPage(true, context);
    await textShape.stickyNote();
  });

  test('Pan', async ({ browser, context, page }) => {
    const tools = new ShapeTools(browser, context);
    await tools.initModPage(page, true);
    await tools.initUserPage(true, context);
    await tools.pan();
  });

  test('Eraser', async ({ browser, context, page }) => {
    const tools = new ShapeTools(browser, context);
    await tools.initModPage(page, true);
    await tools.initUserPage(true, context);
    await tools.eraser();
  });

  test.describe.parallel('Change Shapes Styles', async () => {
    test('Change color', async ({ browser, context, page }) => {
      const changeColor = new ChangeStyles(browser, context);
      await changeColor.initModPage(page, true);
      await changeColor.initUserPage(true, context);
      await changeColor.changingColor();
    });

    test('Fill drawing', async ({ browser, context, page }) => {
      const fillDrawing = new ChangeStyles(browser, context);
      await fillDrawing.initModPage(page, true);
      await fillDrawing.initUserPage(true, context);
      await fillDrawing.fillDrawing();
    });

    test('Dash drawing', async ({ browser, context, page }) => {
      const dashDrawing = new ChangeStyles(browser, context);
      await dashDrawing.initModPage(page, true);
      await dashDrawing.initUserPage(true, context);
      await dashDrawing.dashDrawing();
    });

    test('Size drawing', async ({ browser, context, page }) => {
      const sizeDrawing = new ChangeStyles(browser, context);
      await sizeDrawing.initModPage(page, true);
      await sizeDrawing.initUserPage(true, context);
      await sizeDrawing.sizeDrawing();
    });
  });

  test('Delete drawing', async ({ browser, context, page }) => {
    const tools = new ShapeTools(browser, context);
    await tools.initModPage(page, true);
    await tools.initUserPage(true, context);
    await tools.delete();
  });

  test('Undo drawing', async ({ browser, context, page }) => {
    const tools = new ShapeTools(browser, context);
    await tools.initModPage(page, true);
    await tools.initUserPage(true, context);
    await tools.undo();
  });

  test('Redo drawing', async ({ browser, context, page }) => {
    const tools = new ShapeTools(browser, context);
    await tools.initModPage(page, true);
    await tools.initUserPage(true, context);
    await tools.redo();
  });

  test('Real time text typing', async ({ browser, context, page }) => {
    const textShape = new TextShape(browser, context);
    await textShape.initModPage(page, true);
    await textShape.initUserPage(true, context);
    await textShape.realTimeTextTyping();
  });

  test.describe.parallel('Shape Options', () => {
    test('Duplicate', async ({ browser, context, page }) => {
      const shapeOptions = new ShapeOptions(browser, context);
      await shapeOptions.initModPage(page, true);
      await shapeOptions.initUserPage(true, context);
      await shapeOptions.duplicate();
    });

    test('Rotate', async ({ browser, context, page }) => {
      const shapeOptions = new ShapeOptions(browser, context);
      await shapeOptions.initModPage(page, true);
      await shapeOptions.initUserPage(true, context);
      await shapeOptions.rotate();
    });
  });
});
