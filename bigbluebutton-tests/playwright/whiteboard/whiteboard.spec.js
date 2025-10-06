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

  test('Draw rectangle', async ({ browser, context, page }, testInfo) => {
    const rectangle = new DrawShape(browser, context);
    await rectangle.initModPage(page, true, { testInfo });
    await rectangle.initUserPage(true, context, { testInfo });
    await rectangle.drawShape(e.wbRectangleShape, 'rectangle');
  });

  test('Draw ellipse', async ({ browser, context, page }, testInfo) => {
    const ellipse = new DrawShape(browser, context);
    await ellipse.initModPage(page, true, { testInfo });
    await ellipse.initUserPage(true, context, { testInfo });
    await ellipse.drawShape(e.wbEllipseShape, 'ellipse');
  });

  test('Draw triangle', async ({ browser, context, page }, testInfo) => {
    const triangle = new DrawShape(browser, context);
    await triangle.initModPage(page, true, { testInfo });
    await triangle.initUserPage(true, context, { testInfo });
    await triangle.drawShape(e.wbTriangleShape, 'triangle');
  });

  test('Draw line', async ({ browser, context, page }, testInfo) => {
    const line = new DrawShape(browser, context);
    await line.initModPage(page, true, { testInfo });
    await line.initUserPage(true, context, { testInfo });
    await line.drawShape(e.wbLineShape, 'line', e.wbDrawnLine);
  });

  test('Draw arrow', async ({ browser, context, page }, testInfo) => {
    const arrow = new DrawShape(browser, context);
    await arrow.initModPage(page, true, { testInfo });
    await arrow.initUserPage(true, context, { testInfo });
    await arrow.drawShape(e.wbArrowShape, 'arrow', e.wbDrawnArrow);
  });

  test('Draw with pencil', async ({ browser, context, page }, testInfo) => {
    const pencil = new DrawShape(browser, context);
    await pencil.initModPage(page, true, { testInfo });
    await pencil.initUserPage(true, context, { testInfo });
    await pencil.drawShape(e.wbPencilShape, 'pencil', e.wbDraw)
  });

  test('Type text', async ({ browser, context, page }, testInfo) => {
    const textShape = new TextShape(browser, context);
    await textShape.initModPage(page, true, { testInfo });
    await textShape.initUserPage(true, context, { testInfo });
    await textShape.typeText();
  });

  test('Sticky note', async ({ browser, context, page }, testInfo) => {
    const textShape = new TextShape(browser, context);
    await textShape.initModPage(page, true, { testInfo });
    await textShape.initUserPage(true, context, { testInfo });
    await textShape.stickyNote();
  });

  test('Pan', async ({ browser, context, page }, testInfo) => {
    const tools = new ShapeTools(browser, context);
    await tools.initModPage(page, true, { testInfo });
    await tools.initUserPage(true, context, { testInfo });
    await tools.pan();
  });

  test('Eraser', async ({ browser, context, page }, testInfo) => {
    const tools = new ShapeTools(browser, context);
    await tools.initModPage(page, true, { testInfo });
    await tools.initUserPage(true, context, { testInfo });
    await tools.eraser();
  });

  test.describe.parallel('Change Shapes Styles', async () => {
    test('Change color', async ({ browser, context, page }, testInfo) => {
      const changeColor = new ChangeStyles(browser, context);
      await changeColor.initModPage(page, true, { testInfo });
      await changeColor.initUserPage(true, context, { testInfo });
      await changeColor.changingColor();
    });

    test('Fill drawing', async ({ browser, context, page }, testInfo) => {
      const fillDrawing = new ChangeStyles(browser, context);
      await fillDrawing.initModPage(page, true, { testInfo });
      await fillDrawing.initUserPage(true, context, { testInfo });
      await fillDrawing.fillDrawing();
    });

    test('Dash drawing', async ({ browser, context, page }, testInfo) => {
      const dashDrawing = new ChangeStyles(browser, context);
      await dashDrawing.initModPage(page, true, { testInfo });
      await dashDrawing.initUserPage(true, context, { testInfo });
      await dashDrawing.dashDrawing();
    });

    test('Size drawing', async ({ browser, context, page }, testInfo) => {
      const sizeDrawing = new ChangeStyles(browser, context);
      await sizeDrawing.initModPage(page, true, { testInfo });
      await sizeDrawing.initUserPage(true, context, { testInfo });
      await sizeDrawing.sizeDrawing();
    });
  });

  test('Delete drawing', async ({ browser, context, page }, testInfo) => {
    const tools = new ShapeTools(browser, context);
    await tools.initModPage(page, true, { testInfo });
    await tools.initUserPage(true, context, { testInfo });
    await tools.delete();
  });

  test('Undo drawing', async ({ browser, context, page }, testInfo) => {
    const tools = new ShapeTools(browser, context);
    await tools.initModPage(page, true, { testInfo });
    await tools.initUserPage(true, context, { testInfo });
    await tools.undo();
  });

  test('Redo drawing', async ({ browser, context, page }, testInfo) => {
    const tools = new ShapeTools(browser, context);
    await tools.initModPage(page, true, { testInfo });
    await tools.initUserPage(true, context, { testInfo });
    await tools.redo();
  });

  test('Real time text typing', async ({ browser, context, page }, testInfo) => {
    const textShape = new TextShape(browser, context);
    await textShape.initModPage(page, true, { testInfo });
    await textShape.initUserPage(true, context, { testInfo });
    await textShape.realTimeTextTyping();
  });

  test.describe.parallel('Shape Options', () => {
    test('Duplicate', async ({ browser, context, page }, testInfo) => {
      const shapeOptions = new ShapeOptions(browser, context);
      await shapeOptions.initModPage(page, true, { testInfo });
      await shapeOptions.initUserPage(true, context, { testInfo });
      await shapeOptions.duplicate();
    });

    test('Rotate', async ({ browser, context, page }, testInfo) => {
      const shapeOptions = new ShapeOptions(browser, context);
      await shapeOptions.initModPage(page, true, { testInfo });
      await shapeOptions.initUserPage(true, context, { testInfo });
      await shapeOptions.rotate();
    });
  });
});
