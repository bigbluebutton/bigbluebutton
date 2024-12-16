const { test } = require('../fixtures');
const { DrawRectangle } = require('./drawRectangle');
const { DrawEllipse } = require('./drawEllipse');
const { DrawTriangle } = require('./drawTriangle');
const { DrawLine } = require('./drawLine');
const { DrawPencil } = require('./drawPencil');
const { DrawText } = require('./drawText');
const { DrawStickyNote } = require('./drawStickyNote');
const { Pan } = require('./pan');
const { Eraser } = require('./eraser');
const { DrawArrow } = require('./drawArrow');
const { encodeCustomParams } = require('../parameters/util');
const { PARAMETER_HIDE_PRESENTATION_TOAST } = require('../core/constants');
const { DeleteDrawing } = require('./deleteDrawing');
const { UndoDrawing } = require('./undoDraw');
const { RedoDrawing } = require('./redoDraw');
const { ChangeStyles } = require('./changeStyles');
const { RealTimeText } = require('./realTimeText');
const { ShapeOptions } = require('./shapeOptions');
const { linkIssue } = require('../core/helpers');

const hidePresentationToast = encodeCustomParams(PARAMETER_HIDE_PRESENTATION_TOAST);

//! @flaky note:
// all whiteboard tests are flagged as flaky due to unexpected zooming slides
// only avoiding those assertions won't be enough as most of the tests are relying only on snapshot comparisons
// so together with the further fix + re-enablement of the tests, they will need to have non-snapshot assertions added as well
// P.S. 1. the failures seems to be noticeable only on the CI
test.describe.parallel('Whiteboard tools', { tag: ['@ci', '@flaky'] }, () => {
  test.beforeEach(({ browserName }) => {
    test.skip(browserName !== 'chromium',
      'Drawing visual regression tests are enabled only for Chromium');
  });

  test('Draw rectangle', async ({ browser, context, page }) => {
    const drawRectangle = new DrawRectangle(browser, context);
    await drawRectangle.initModPage(page, true, { customMeetingId: 'draw_rectangle_meeting', joinParameter: hidePresentationToast });
    await drawRectangle.initUserPage(true, context, { joinParameter: hidePresentationToast });
    await drawRectangle.test();
  });

  test('Draw ellipse', async ({ browser, context, page }) => {
    const drawEllipse = new DrawEllipse(browser, context);
    await drawEllipse.initModPage(page, true, { customMeetingId: 'draw_ellipse_meeting', joinParameter: hidePresentationToast });
    await drawEllipse.initUserPage(true, context, { joinParameter: hidePresentationToast });
    await drawEllipse.test();
  });

  test('Draw triangle', async ({ browser, context, page }) => {
    const drawTriangle = new DrawTriangle(browser, context);
    await drawTriangle.initModPage(page, true, { customMeetingId: 'draw_triangle_meeting', joinParameter: hidePresentationToast });
    await drawTriangle.initUserPage(true, context, { joinParameter: hidePresentationToast });
    await drawTriangle.test();
  });

  test('Draw line', async ({ browser, context, page }) => {
    const drawLine = new DrawLine(browser, context);
    await drawLine.initModPage(page, true, { customMeetingId: 'draw_line_meeting', joinParameter: hidePresentationToast });
    await drawLine.initUserPage(true, context, { joinParameter: hidePresentationToast });
    await drawLine.test();
  });

  test('Draw with pencil', async ({ browser, context, page }) => {
    const drawPencil = new DrawPencil(browser, context);
    await drawPencil.initModPage(page, true, { customMeetingId: 'draw_pencil_meeting', joinParameter: hidePresentationToast });
    await drawPencil.initUserPage(true, context, { joinParameter: hidePresentationToast });
    await drawPencil.test();
  });

  test('Type text', async ({ browser, context, page }) => {
    const drawText = new DrawText(browser, context);
    await drawText.initModPage(page, true, { customMeetingId: 'draw_text_meeting', joinParameter: hidePresentationToast });
    await drawText.initUserPage(true, context, { joinParameter: hidePresentationToast });
    await drawText.test();
  });

  test('Create sticky note', { tag: '@flaky' }, async ({ browser, context, page }) => {
    // wrong/unexpected slide zoom for some users causing screenshot comparison to fail
    linkIssue(21302);
    const drawStickyNote = new DrawStickyNote(browser, context);
    await drawStickyNote.initModPage(page, true, { customMeetingId: 'draw_sticky_meeting', joinParameter: hidePresentationToast });
    await drawStickyNote.initUserPage(true, context, { joinParameter: hidePresentationToast });
    await drawStickyNote.test();
  });

  test('Pan', { tag: '@flaky' } , async ({ browser, context, page }) => {
    // different zoom position when clicking toolbar's zoom button
    linkIssue(21266);
    const pan = new Pan(browser, context);
    await pan.initModPage(page, true, { customMeetingId: 'draw_line_meeting', joinParameter: hidePresentationToast });
    await pan.initUserPage(true, context, { joinParameter: hidePresentationToast });
    await pan.test();
  });

  test('Eraser', async ({ browser, context, page }) => {
    const eraser = new Eraser(browser, context);
    await eraser.initModPage(page, true, { customMeetingId: 'draw_line_meeting', joinParameter: hidePresentationToast });
    await eraser.initUserPage(true, context, { joinParameter: hidePresentationToast });
    await eraser.test();
  });

  test('Draw arrow', async ({ browser, context, page }) => {
    const drawArrow = new DrawArrow(browser, context);
    await drawArrow.initModPage(page, true, { customMeetingId: 'draw_line_meeting', joinParameter: hidePresentationToast });
    await drawArrow.initUserPage(true, context, { joinParameter: hidePresentationToast });
    await drawArrow.test();
  });

  test.describe.parallel('Change Shapes Styles', async () => {
    test('Change color', async ({ browser, context, page }) => {
      const changeColor = new ChangeStyles(browser, context);
      await changeColor.initModPage(page, true, { customMeetingId: 'draw_line_meeting', joinParameter: hidePresentationToast });
      await changeColor.initUserPage(true, context, { joinParameter: hidePresentationToast });
      await changeColor.changingColor();
    });

    test('Fill drawing', async ({ browser, context, page }) => {
      const fillDrawing = new ChangeStyles(browser, context);
      await fillDrawing.initModPage(page, true, { customMeetingId: 'draw_line_meeting', joinParameter: hidePresentationToast });
      await fillDrawing.initUserPage(true, context, { joinParameter: hidePresentationToast });
      await fillDrawing.fillDrawing();
    });

    test('Dash drawing', async ({ browser, context, page }) => {
      const dashDrawing = new ChangeStyles(browser, context);
      await dashDrawing.initModPage(page, true, { customMeetingId: 'draw_line_meeting', joinParameter: hidePresentationToast });
      await dashDrawing.initUserPage(true, context, { joinParameter: hidePresentationToast });
      await dashDrawing.dashDrawing();
    });

    test('Size drawing', async ({ browser, context, page }) => {
      const sizeDrawing = new ChangeStyles(browser, context);
      await sizeDrawing.initModPage(page, true, { customMeetingId: 'draw_line_meeting', joinParameter: hidePresentationToast });
      await sizeDrawing.initUserPage(true, context, { joinParameter: hidePresentationToast });
      await sizeDrawing.sizeDrawing();
    });
  });

  test('Delete drawing', async ({ browser, context, page }) => {
    const deleteDrawing = new DeleteDrawing(browser, context);
    await deleteDrawing.initModPage(page, true, { customMeetingId: 'draw_line_meeting', joinParameter: hidePresentationToast });
    await deleteDrawing.initUserPage(true, context, { joinParameter: hidePresentationToast });
    await deleteDrawing.test();
  });

  test.fixme('Undo drawing', async ({ browser, context, page }) => {
    // action button has been removed on #21738
    // alternative: use keyboard shortcut
    const undoDrawing = new UndoDrawing(browser, context);
    await undoDrawing.initModPage(page, true, { customMeetingId: 'draw_line_meeting', joinParameter: hidePresentationToast });
    await undoDrawing.initUserPage(true, context, { joinParameter: hidePresentationToast });
    await undoDrawing.test();
  });

  test.fixme('Redo drawing', async ({ browser, context, page }) => {
    // action button has been removed on #21738
    // alternative: use keyboard shortcut
    const redoDrawing = new RedoDrawing(browser, context);
    await redoDrawing.initModPage(page, true, { customMeetingId: 'draw_line_meeting', joinParameter: hidePresentationToast });
    await redoDrawing.initUserPage(true, context, { joinParameter: hidePresentationToast });
    await redoDrawing.test();
  });

  test('Real time text typing', async ({ browser, context, page }) => {
    const realTimeText = new RealTimeText(browser, context);
    await realTimeText.initModPage(page, true, { customMeetingId: 'draw_line_meeting', joinParameter: hidePresentationToast });
    await realTimeText.initUserPage(true, context, { joinParameter: hidePresentationToast });
    await realTimeText.realTimeTextTyping();
  });

  test.describe.parallel('Shape Options', { tag: '@flaky' }, () => {
    // wrong/unexpected slide zoom for some users causing screenshot comparison to fail
    // see https://github.com/bigbluebutton/bigbluebutton/issues/21302
    test.fixme('Duplicate', async ({ browser, context, page }) => {
      // action button has been removed on #21738
      // alternative: use keyboard shortcut
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

    test('Move Shape Backward/Forward', async ({ browser, context, page }) => {
      const shapeOptions = new ShapeOptions(browser, context);
      await shapeOptions.initModPage(page, true);
      await shapeOptions.initUserPage(true, context);
      await shapeOptions.movingShape();
    });
  });
});
