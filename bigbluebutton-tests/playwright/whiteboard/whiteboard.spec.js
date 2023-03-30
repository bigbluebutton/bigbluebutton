const { test } = require('@playwright/test');
const { Draw } = require('./draw');
const { DrawRectangle } = require('./drawRectangle');
const { DrawEllipse } = require('./drawEllipse');
const { DrawTriangle } = require('./drawTriangle');
const { DrawLine } = require('./drawLine');
const { DrawPencil } = require('./drawPencil');
const { DrawText } = require('./drawText');
const { DrawStickyNote } = require('./drawStickyNote');
const { Zoom } = require('./zoom');
const { Pan } = require('./pan');
const { Eraser } = require('./eraser');
const { DrawArrow } = require('./drawArrow');
const { MultiUsers } = require('../user/multiusers');
const { encodeCustomParams } = require('../customparameters/util');
const { PARAMETER_HIDE_PRESENTATION_TOAST } = require('../core/constants');

const hidePresentationToast = encodeCustomParams(PARAMETER_HIDE_PRESENTATION_TOAST);

test.describe.parallel('Whiteboard @ci', () => {
  test('Draw rectangle', async ({ browser, page }) => {
    const draw = new Draw(browser, page);
    await draw.init(true, true);
    await draw.test();
  })

  test('Give Additional Whiteboard Access', async ({ browser, context, page }) => {
    const multiusers = new MultiUsers(browser, context);
    await multiusers.initPages(page);
    await multiusers.whiteboardAccess();
  });
});

test.describe.parallel('Whiteboard tools - visual regression', () => {
  test.beforeEach(({ browserName }) => {
    test.skip(browserName !== 'chromium',
      'Drawing visual regression tests are enabled for Chromium only');
  });

  test('Draw rectangle', async ({ browser, context, page }) => {
    const drawRectangle = new DrawRectangle(browser, context);
    await drawRectangle.initModPage(page, true, { customMeetingId: 'draw_rectangle_meeting', customParameter: hidePresentationToast });
    await drawRectangle.initModPage2(true, context, { customParameter: hidePresentationToast });
    await drawRectangle.test();
  });

  test('Draw ellipse', async ({ browser, context, page }) => {
    const drawEllipse = new DrawEllipse(browser, context);
    await drawEllipse.initModPage(page, true, { customMeetingId: 'draw_ellipse_meeting', customParameter: hidePresentationToast });
    await drawEllipse.initModPage2(true, context, { customParameter: hidePresentationToast });
    await drawEllipse.test();
  });

  test('Draw triangle', async ({ browser, context, page }) => {
    const drawTriangle = new DrawTriangle(browser, context);
    await drawTriangle.initModPage(page, true, { customMeetingId: 'draw_triangle_meeting', customParameter: hidePresentationToast });
    await drawTriangle.initModPage2(true, context, { customParameter: hidePresentationToast });
    await drawTriangle.test();
  });

  test('Draw line', async ({ browser, context, page }) => {
    const drawLine = new DrawLine(browser, context);
    await drawLine.initModPage(page, true, { customMeetingId: 'draw_line_meeting', customParameter: hidePresentationToast });
    await drawLine.initModPage2(true, context, { customParameter: hidePresentationToast });
    await drawLine.test();
  });

  test('Draw with pencil', async ({ browser, context, page }) => {
    const drawPencil = new DrawPencil(browser, context);
    await drawPencil.initModPage(page, true, { customMeetingId: 'draw_pencil_meeting', customParameter: hidePresentationToast });
    await drawPencil.initModPage2(true, context, { customParameter: hidePresentationToast });
    await drawPencil.test();
  });

  test('Type text', async ({ browser, context, page }) => {
    const drawText = new DrawText(browser, context);
    await drawText.initModPage(page, true, { customMeetingId: 'draw_text_meeting', customParameter: hidePresentationToast });
    await drawText.initModPage2(true, context, { customParameter: hidePresentationToast });
    await drawText.test();
  });

  test('Create sticky note', async ({ browser, context, page }) => {
    const drawStickyNote = new DrawStickyNote(browser, context);
    await drawStickyNote.initModPage(page, true, { customMeetingId: 'draw_sticky_meeting', customParameter: hidePresentationToast });
    await drawStickyNote.initModPage2(true, context, { customParameter: hidePresentationToast });
    await drawStickyNote.test();
  });

  test('Zoom', async ({ browser, context, page }) => {
    const zoom = new Zoom(browser, context);
    await zoom.initModPage(page, true, { customMeetingId: 'draw_line_meeting', customParameter: hidePresentationToast });
    await zoom.initModPage2(true, context, { customParameter: hidePresentationToast });
    await zoom.test();
  });

  test('Pan', async ({ browser, context, page }) => {
    const pan = new Pan(browser, context);
    await pan.initModPage(page, true, { customMeetingId: 'draw_line_meeting', customParameter: hidePresentationToast });
    await pan.initModPage2(true, context, { customParameter: hidePresentationToast });
    await pan.test();
  });

  test('Eraser', async ({ browser, context, page }) => {
    const eraser = new Eraser(browser, context);
    await eraser.initModPage(page, true, { customMeetingId: 'draw_line_meeting', customParameter: hidePresentationToast });
    await eraser.initModPage2(true, context, { customParameter: hidePresentationToast });
    await eraser.test();
  });

  test('Draw arrow', async ({ browser, context, page }) => {
    const drawArrow = new DrawArrow(browser, context);
    await drawArrow.initModPage(page, true, { customMeetingId: 'draw_line_meeting', customParameter: hidePresentationToast });
    await drawArrow.initModPage2(true, context, { customParameter: hidePresentationToast });
    await drawArrow.test();
  });
});
