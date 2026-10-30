import type { Browser, BrowserContext, Page, TestInfo } from '@playwright/test';

import { elements as e } from '../core/elements';
import { linkIssue } from '../core/helpers';
import { test } from '../core/setup/fixtures';
import { ChangeStyles } from './changeStyles';
import { DrawShape } from './drawShape';
import { EditedShapeRemoved } from './editedShapeRemoved';
import { MultiUserWhiteboard } from './multiUserWhiteboard';
import { ShapeOptions } from './shapeOptions';
import { ShapeTools } from './shapeTools';
import { SlideChangeBlank } from './slideChangeBlank';
import { SlideChangeWhileEditing } from './slideChangeWhileEditing';
import { SlidePosition } from './slidePosition';
import { TextShape } from './textShape';
import { TouchPinchZoom } from './touchPinchZoom';
import { WhiteboardResize } from './whiteboardResize';

async function runResizeTest(
  method: 'cameraResync' | 'cameraResyncVisual' | 'cameraResyncZoomedVisual' | 'cameraResyncAfterMinimizeRestore',
  browser: Browser,
  context: BrowserContext,
  page: Page,
  testInfo: TestInfo,
) {
  const resize = new WhiteboardResize(browser, context);
  await resize.initModPage(page, { testInfo });
  await resize.initUserPage(context, { testInfo });
  await resize[method]();
}

test.describe.parallel('Whiteboard tools', { tag: '@ci' }, () => {
  test.beforeEach(({ browserName }) => {
    test.skip(browserName !== 'chromium', 'Drawing visual regression tests are enabled only for Chromium');
  });

  test('Draw rectangle', async ({ browser, context, page }, testInfo) => {
    const rectangle = new DrawShape(browser, context);
    await rectangle.initModPage(page, { testInfo });
    await rectangle.initUserPage(context, { testInfo });
    await rectangle.drawShape(e.wbRectangleShape, 'rectangle');
  });

  test('Draw ellipse', async ({ browser, context, page }, testInfo) => {
    const ellipse = new DrawShape(browser, context);
    await ellipse.initModPage(page, { testInfo });
    await ellipse.initUserPage(context, { testInfo });
    await ellipse.drawShape(e.wbEllipseShape, 'ellipse');
  });

  test('Draw triangle', async ({ browser, context, page }, testInfo) => {
    const triangle = new DrawShape(browser, context);
    await triangle.initModPage(page, { testInfo });
    await triangle.initUserPage(context, { testInfo });
    await triangle.drawShape(e.wbTriangleShape, 'triangle');
  });

  test('Draw line', async ({ browser, context, page }, testInfo) => {
    const line = new DrawShape(browser, context);
    await line.initModPage(page, { testInfo });
    await line.initUserPage(context, { testInfo });
    await line.drawShape(e.wbLineShape, 'line', e.wbDrawnLine);
  });

  test('Draw arrow', async ({ browser, context, page }, testInfo) => {
    const arrow = new DrawShape(browser, context);
    await arrow.initModPage(page, { testInfo });
    await arrow.initUserPage(context, { testInfo });
    await arrow.drawShape(e.wbArrowShape, 'arrow', e.wbDrawnArrow);
  });

  test('Draw with pencil', async ({ browser, context, page }, testInfo) => {
    const pencil = new DrawShape(browser, context);
    await pencil.initModPage(page, { testInfo });
    await pencil.initUserPage(context, { testInfo });
    await pencil.drawShape(e.wbPencilShape, 'pencil', e.wbDraw);
  });

  test('Type text', async ({ browser, context, page }, testInfo) => {
    const textShape = new TextShape(browser, context);
    await textShape.initModPage(page, { testInfo });
    await textShape.initUserPage(context, { testInfo });
    await textShape.typeText();
  });

  test('Sticky note', async ({ browser, context, page }, testInfo) => {
    const textShape = new TextShape(browser, context);
    await textShape.initModPage(page, { testInfo });
    await textShape.initUserPage(context, { testInfo });
    await textShape.stickyNote();
  });

  // fails deterministically on 4.0: the post-pan canvas screenshot diverges ~16%
  // from its baseline on every server - pan/camera behavior changed, needs rework
  test('Pan', { tag: '@need-update' }, async ({ browser, context, page }, testInfo) => {
    linkIssue(24367);
    const tools = new ShapeTools(browser, context);
    await tools.initModPage(page, { testInfo });
    await tools.initUserPage(context, { testInfo });
    await tools.pan();
  });

  test('Eraser', async ({ browser, context, page }, testInfo) => {
    const tools = new ShapeTools(browser, context);
    await tools.initModPage(page, { testInfo });
    await tools.initUserPage(context, { testInfo });
    await tools.eraser();
  });

  test.describe.parallel('Change Shapes Styles', async () => {
    test('Change color', async ({ browser, context, page }, testInfo) => {
      const changeColor = new ChangeStyles(browser, context);
      await changeColor.initModPage(page, { testInfo });
      await changeColor.initUserPage(context, { testInfo });
      await changeColor.changingColor();
    });

    test('Fill drawing', async ({ browser, context, page }, testInfo) => {
      const fillDrawing = new ChangeStyles(browser, context);
      await fillDrawing.initModPage(page, { testInfo });
      await fillDrawing.initUserPage(context, { testInfo });
      await fillDrawing.fillDrawing();
    });

    test('Dash drawing', async ({ browser, context, page }, testInfo) => {
      const dashDrawing = new ChangeStyles(browser, context);
      await dashDrawing.initModPage(page, { testInfo });
      await dashDrawing.initUserPage(context, { testInfo });
      await dashDrawing.dashDrawing();
    });

    test('Size drawing', async ({ browser, context, page }, testInfo) => {
      const sizeDrawing = new ChangeStyles(browser, context);
      await sizeDrawing.initModPage(page, { testInfo });
      await sizeDrawing.initUserPage(context, { testInfo });
      await sizeDrawing.sizeDrawing();
    });
  });

  test('Delete drawing', async ({ browser, context, page }, testInfo) => {
    const tools = new ShapeTools(browser, context);
    await tools.initModPage(page, { testInfo });
    await tools.initUserPage(context, { testInfo });
    await tools.delete();
  });

  test('Undo drawing', async ({ browser, context, page }, testInfo) => {
    const tools = new ShapeTools(browser, context);
    await tools.initModPage(page, { testInfo });
    await tools.initUserPage(context, { testInfo });
    await tools.undo();
  });

  test('Redo drawing', async ({ browser, context, page }, testInfo) => {
    const tools = new ShapeTools(browser, context);
    await tools.initModPage(page, { testInfo });
    await tools.initUserPage(context, { testInfo });
    await tools.redo();
  });

  test('Real time text typing', async ({ browser, context, page }, testInfo) => {
    const textShape = new TextShape(browser, context);
    await textShape.initModPage(page, { testInfo });
    await textShape.initUserPage(context, { testInfo });
    await textShape.realTimeTextTyping();
  });

  test('No crash on slide change while a viewer is editing', async ({ browser, context, page }, testInfo) => {
    const slideChange = new SlideChangeWhileEditing(browser, context);
    await slideChange.initModPage(page, { testInfo });
    await slideChange.initUserPage(context, { testInfo });
    await slideChange.crashOnSlideChangeWhileEditing();
  });

  test('No crash when the presenter deletes the text a viewer is editing', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const removed = new EditedShapeRemoved(browser, context);
    await removed.initModPage(page, { testInfo });
    await removed.initUserPage(context, { testInfo });
    await removed.presenterDeletesTextBeingEdited();
  });

  test('Viewer text started right after the multi-user grant is kept', async ({ browser, context, page }, testInfo) => {
    const removed = new EditedShapeRemoved(browser, context);
    await removed.initModPage(page, { testInfo });
    await removed.initUserPageWithSlowSubmits(context, testInfo, 1500);
    await removed.newTextSurvivesAccessGrant();
  });

  test('No blank presentation area on slide change with a cold cache', async ({ browser, context, page }, testInfo) => {
    linkIssue(25397);
    const blank = new SlideChangeBlank(browser, context);
    await blank.initModPage(page, { testInfo });
    await blank.noBlankOnSlideChange();
  });

  test('Slide change with a broken background asset degrades without hanging', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    linkIssue(25397);
    const blank = new SlideChangeBlank(browser, context);
    await blank.initModPage(page, { testInfo });
    await blank.brokenAssetDegradesWithoutHanging();
  });

  test('Viewer follows a slide change that happens during camera calibration', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    linkIssue(25397);
    const blank = new SlideChangeBlank(browser, context);
    await blank.initModPage(page, { testInfo });
    await blank.viewerFollowsSlideChangeDuringMount();
  });

  test('Each slide restores its own last position', async ({ browser, context, page }, testInfo) => {
    linkIssue(25866);
    const slidePosition = new SlidePosition(browser, context);
    await slidePosition.initPages(page, testInfo);
    await slidePosition.preservesEachSlidesLastPosition();
  });

  test('Fit-to-width position survives a slide-change remount', async ({ browser, context, page }, testInfo) => {
    linkIssue(25866);
    const slidePosition = new SlidePosition(browser, context);
    await slidePosition.initPages(page, testInfo);
    await slidePosition.restoresFitToWidthPageAfterRemount();
  });

  test('Slide position restoration is independent of decode timing', async ({ browser, context, page }, testInfo) => {
    linkIssue(25866);
    const slidePosition = new SlidePosition(browser, context);
    await slidePosition.initPages(page, testInfo);
    await slidePosition.preservesEachSlidesLastPosition({ slowDecode: true });
  });

  test.describe('Reduced motion', () => {
    test('Presenter and viewer restore the same per-slide position', async ({ browser, context, page }, testInfo) => {
      linkIssue(25866);
      const slidePosition = new SlidePosition(browser, context);
      await slidePosition.initPages(page, testInfo);
      await slidePosition.preservesEachSlidesLastPosition({ reducedMotion: true });
    });
  });

  test('Different per-slide zooms restore exact camera positions', async ({ browser, context, page }, testInfo) => {
    linkIssue(25866);
    const slidePosition = new SlidePosition(browser, context);
    await slidePosition.initPages(page, testInfo);
    await slidePosition.restoresPositionsAcrossDifferentZooms();
  });

  test('Toolbar-zoomed slide is restored after a fit-to-width slide', async ({ browser, context, page }, testInfo) => {
    linkIssue(25866);
    const slidePosition = new SlidePosition(browser, context);
    await slidePosition.initPages(page, testInfo);
    await slidePosition.restoresToolbarZoomAfterFitToWidthChange();
  });

  test('Fit-to-width slide keeps its toolbar zoom across a round trip', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    linkIssue(25866);
    const slidePosition = new SlidePosition(browser, context);
    await slidePosition.initPages(page, testInfo);
    await slidePosition.restoresFitToWidthPageWithToolbarZoom();
  });

  test.describe.parallel('Shape Options', () => {
    test('Duplicate', async ({ browser, context, page }, testInfo) => {
      const shapeOptions = new ShapeOptions(browser, context);
      await shapeOptions.initModPage(page, { testInfo });
      await shapeOptions.initUserPage(context, { testInfo });
      await shapeOptions.duplicate();
    });

    test('Rotate', async ({ browser, context, page }, testInfo) => {
      const shapeOptions = new ShapeOptions(browser, context);
      await shapeOptions.initModPage(page, { testInfo });
      await shapeOptions.initUserPage(context, { testInfo });
      await shapeOptions.rotate();
    });
  });

  test('Camera re-sync after container resize', async ({ browser, context, page }, testInfo) => {
    await runResizeTest('cameraResync', browser, context, page, testInfo);
  });

  test('Camera re-sync visual regression after container resize', async ({ browser, context, page }, testInfo) => {
    await runResizeTest('cameraResyncVisual', browser, context, page, testInfo);
  });

  test('Camera re-sync visual regression after resize with canvas zoom', async ({ browser, context, page }, testInfo) => {
    await runResizeTest('cameraResyncZoomedVisual', browser, context, page, testInfo);
  });

  test('Camera zoom is preserved after minimizing and restoring the presentation', async ({ browser, context, page }, testInfo) => {
    await runResizeTest('cameraResyncAfterMinimizeRestore', browser, context, page, testInfo);
  });

  test.describe.parallel('Touch pinch zoom', () => {
    // The two-finger gestures are sent with CDP Input.dispatchTouchEvent.
    test.skip(({ browserName }) => browserName !== 'chromium', 'CDP touch input is Chromium-only');

    test('Presenter pinch zoom stays between 100% and 400% and viewers follow', async ({
      browser,
      context,
    }, testInfo) => {
      linkIssue(26079);
      const touchPinchZoom = new TouchPinchZoom(browser, context);
      await touchPinchZoom.initTouchPages(testInfo);
      await touchPinchZoom.pinchStaysWithinZoomRange();
    });

    test('Slow presenter pinch ends with viewers on the same view', async ({ browser, context }, testInfo) => {
      linkIssue(26079);
      const touchPinchZoom = new TouchPinchZoom(browser, context);
      await touchPinchZoom.initTouchPages(testInfo);
      await touchPinchZoom.slowPinchReachesViewer();
    });

    test('Presenter pinch zoom does not flicker', async ({ browser, context }, testInfo) => {
      linkIssue(26079);
      const touchPinchZoom = new TouchPinchZoom(browser, context);
      await touchPinchZoom.initTouchPages(testInfo);
      await touchPinchZoom.pinchZoomsInOneDirection();
    });

    test('Two fingers at the same point leave the camera alone', async ({ browser, context }, testInfo) => {
      linkIssue(26079);
      const touchPinchZoom = new TouchPinchZoom(browser, context);
      await touchPinchZoom.initTouchPages(testInfo);
      await touchPinchZoom.fingersAtTheSamePointLeaveTheCameraAlone();
    });

    test('Presenter two-finger pan reaches viewers', async ({ browser, context }, testInfo) => {
      linkIssue(26079);
      const touchPinchZoom = new TouchPinchZoom(browser, context);
      await touchPinchZoom.initTouchPages(testInfo);
      await touchPinchZoom.twoFingerPanReachesViewer();
    });

    test('Viewer touch gestures move no camera and keep the two-finger undo', async ({
      browser,
      context,
    }, testInfo) => {
      linkIssue(26079);
      const touchPinchZoom = new TouchPinchZoom(browser, context);
      await touchPinchZoom.initTouchPages(testInfo, { touch: 'viewer' });
      await touchPinchZoom.viewerTouchGestures();
    });
  });
});

test.describe.parallel('Multi-user whiteboard', { tag: '@ci' }, () => {
  test('Viewer annotation reaches the presenter and other viewers and stays after access is removed', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const whiteboard = new MultiUserWhiteboard(browser, context);
    await whiteboard.initModPage(page, { testInfo });
    await whiteboard.initUserPage(context, { testInfo });
    await whiteboard.initUserPage2(context, { testInfo });
    await whiteboard.viewerAnnotationReachesEveryone();
  });
});

test.describe.parallel('Clear annotations', { tag: '@ci' }, () => {
  test('Presenter clears all annotations for everyone', async ({ browser, context, page }, testInfo) => {
    const whiteboard = new MultiUserWhiteboard(browser, context);
    await whiteboard.initPages(page, testInfo);
    await whiteboard.presenterClearsAllAnnotations();
  });

  test('Viewer with whiteboard access clears only their own annotations', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const whiteboard = new MultiUserWhiteboard(browser, context);
    await whiteboard.initPages(page, testInfo);
    await whiteboard.viewerClearsOwnAnnotations();
  });

  test('Cancel keeps all annotations', async ({ browser, context, page }, testInfo) => {
    const whiteboard = new MultiUserWhiteboard(browser, context);
    await whiteboard.initPages(page, testInfo);
    await whiteboard.cancelClearAnnotations();
  });
});
