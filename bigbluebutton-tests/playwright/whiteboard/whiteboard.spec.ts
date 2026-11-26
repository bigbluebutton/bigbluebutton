import type { Browser, BrowserContext, Page, TestInfo } from '@playwright/test';

import { elements as e } from '../core/elements';
import { linkIssue } from '../core/helpers';
import { test } from '../core/setup/fixtures';
import { ChangeStyles } from './changeStyles';
import { DrawShape } from './drawShape';
import { EditedShapeRemoved } from './editedShapeRemoved';
import { MultiUserWhiteboard } from './multiUserWhiteboard';
import { PageIdentity } from './pageIdentity';
import { ShapeOptions } from './shapeOptions';
import { ShapeTools } from './shapeTools';
import { SlideChangeBlank } from './slideChangeBlank';
import { SlideChangeWhileEditing } from './slideChangeWhileEditing';
import { SlidePosition } from './slidePosition';
import { TextShape } from './textShape';
import { TouchPinchZoom } from './touchPinchZoom';
import { WhiteboardResize } from './whiteboardResize';
import { WhiteboardImagePaste } from './imagePaste';

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

  test('Draw ellipse', { tag: '@nightly' }, async ({ browser, context, page }, testInfo) => {
    const ellipse = new DrawShape(browser, context);
    await ellipse.initModPage(page, { testInfo });
    await ellipse.initUserPage(context, { testInfo });
    await ellipse.drawShape(e.wbEllipseShape, 'ellipse');
  });

  test('Draw triangle', { tag: '@nightly' }, async ({ browser, context, page }, testInfo) => {
    const triangle = new DrawShape(browser, context);
    await triangle.initModPage(page, { testInfo });
    await triangle.initUserPage(context, { testInfo });
    await triangle.drawShape(e.wbTriangleShape, 'triangle');
  });

  test('Draw line', { tag: '@nightly' }, async ({ browser, context, page }, testInfo) => {
    const line = new DrawShape(browser, context);
    await line.initModPage(page, { testInfo });
    await line.initUserPage(context, { testInfo });
    await line.drawShape(e.wbLineShape, 'line', e.wbDrawnLine);
  });

  test('Draw arrow', { tag: '@nightly' }, async ({ browser, context, page }, testInfo) => {
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

    test('Fill drawing', { tag: '@nightly' }, async ({ browser, context, page }, testInfo) => {
      const fillDrawing = new ChangeStyles(browser, context);
      await fillDrawing.initModPage(page, { testInfo });
      await fillDrawing.initUserPage(context, { testInfo });
      await fillDrawing.fillDrawing();
    });

    test('Dash drawing', { tag: '@nightly' }, async ({ browser, context, page }, testInfo) => {
      const dashDrawing = new ChangeStyles(browser, context);
      await dashDrawing.initModPage(page, { testInfo });
      await dashDrawing.initUserPage(context, { testInfo });
      await dashDrawing.dashDrawing();
    });

    test('Size drawing', { tag: '@nightly' }, async ({ browser, context, page }, testInfo) => {
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

  test(
    'Fit-to-width position survives a slide-change remount',
    { tag: '@nightly' },
    async ({ browser, context, page }, testInfo) => {
      linkIssue(25866);
      const slidePosition = new SlidePosition(browser, context);
      await slidePosition.initPages(page, testInfo);
      await slidePosition.restoresFitToWidthPageAfterRemount();
    },
  );

  test(
    'Slide position restoration is independent of decode timing',
    { tag: '@nightly' },
    async ({ browser, context, page }, testInfo) => {
      linkIssue(25866);
      const slidePosition = new SlidePosition(browser, context);
      await slidePosition.initPages(page, testInfo);
      await slidePosition.preservesEachSlidesLastPosition({ slowDecode: true });
    },
  );

  test.describe('Reduced motion', () => {
    test(
      'Presenter and viewer restore the same per-slide position',
      { tag: '@nightly' },
      async ({ browser, context, page }, testInfo) => {
        linkIssue(25866);
        const slidePosition = new SlidePosition(browser, context);
        await slidePosition.initPages(page, testInfo);
        await slidePosition.preservesEachSlidesLastPosition({ reducedMotion: true });
      },
    );
  });

  test('Scrolling right after Fit to width keeps the zoom and the viewer in sync', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    linkIssue(26578);
    const slidePosition = new SlidePosition(browser, context);
    await slidePosition.initPages(page, testInfo);
    await slidePosition.keepsFitToWidthAndViewerInSyncWhenScrollingRightAway();
  });

  test(
    'Different per-slide zooms restore exact camera positions',
    { tag: '@nightly' },
    async ({ browser, context, page }, testInfo) => {
      linkIssue(25866);
      const slidePosition = new SlidePosition(browser, context);
      await slidePosition.initPages(page, testInfo);
      await slidePosition.restoresPositionsAcrossDifferentZooms();
    },
  );

  test(
    'Toolbar-zoomed slide is restored after a fit-to-width slide',
    { tag: '@known-issue' },
    async ({ browser, context, page }, testInfo) => {
      linkIssue(25866);
      linkIssue(26590);
      const slidePosition = new SlidePosition(browser, context);
      await slidePosition.initPages(page, testInfo);
      await slidePosition.restoresToolbarZoomAfterFitToWidthChange();
    },
  );

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

  test(
    'Camera re-sync visual regression after container resize',
    { tag: '@nightly' },
    async ({ browser, context, page }, testInfo) => {
      await runResizeTest('cameraResyncVisual', browser, context, page, testInfo);
    },
  );

  test(
    'Camera re-sync visual regression after resize with canvas zoom',
    { tag: '@nightly' },
    async ({ browser, context, page }, testInfo) => {
      await runResizeTest('cameraResyncZoomedVisual', browser, context, page, testInfo);
    },
  );

  test('Camera zoom is preserved after minimizing and restoring the presentation', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    await runResizeTest('cameraResyncAfterMinimizeRestore', browser, context, page, testInfo);
  });

  test.describe('Image paste', { tag: '@setting-required:whiteboard.imagePaste' }, () => {
    test('Paste an image onto the whiteboard', async ({ browser, context, page }, testInfo) => {
      const imagePaste = new WhiteboardImagePaste(browser, context);
      await imagePaste.initModPage(page, { testInfo });
      await imagePaste.initUserPage(context, { testInfo });
      await imagePaste.pasteImage();
    });

    test('Viewer without write access cannot paste an image', async ({ browser, context, page }, testInfo) => {
      const imagePaste = new WhiteboardImagePaste(browser, context);
      await imagePaste.initModPage(page, { testInfo });
      await imagePaste.initUserPage(context, { testInfo });
      await imagePaste.viewerCannotPasteImage();
    });

    test('Slide snapshot keeps the pasted image', async ({ browser, context, page, browserName }, testInfo) => {
      test.skip(browserName === 'firefox', 'Firefox does not support download.');
      const imagePaste = new WhiteboardImagePaste(browser, context);
      await imagePaste.initModPage(page, { testInfo });
      await imagePaste.snapshotKeepsPastedImage();
    });
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

    test(
      'Slow presenter pinch ends with viewers on the same view',
      { tag: '@nightly' },
      async ({ browser, context }, testInfo) => {
        linkIssue(26079);
        const touchPinchZoom = new TouchPinchZoom(browser, context);
        await touchPinchZoom.initTouchPages(testInfo);
        await touchPinchZoom.slowPinchReachesViewer();
      },
    );

    test('Presenter pinch zoom does not flicker', { tag: '@nightly' }, async ({ browser, context }, testInfo) => {
      linkIssue(26079);
      const touchPinchZoom = new TouchPinchZoom(browser, context);
      await touchPinchZoom.initTouchPages(testInfo);
      await touchPinchZoom.pinchZoomsInOneDirection();
    });

    test(
      'Two fingers at the same point leave the camera alone',
      { tag: '@nightly' },
      async ({ browser, context }, testInfo) => {
        linkIssue(26079);
        const touchPinchZoom = new TouchPinchZoom(browser, context);
        await touchPinchZoom.initTouchPages(testInfo);
        await touchPinchZoom.fingersAtTheSamePointLeaveTheCameraAlone();
      },
    );

    test('Presenter two-finger pan reaches viewers', { tag: '@nightly' }, async ({ browser, context }, testInfo) => {
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

  test('Viewer undo removes the stroke for everyone', async ({ browser, context, page }, testInfo) => {
    const whiteboard = new MultiUserWhiteboard(browser, context);
    await whiteboard.initModPage(page, { testInfo });
    await whiteboard.initUserPage(context, { testInfo });
    await whiteboard.viewerUndoRemovesStroke();
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

// Pages are identified by a page id that does not change; these check what used the page number before.
test.describe.parallel('Page identity', { tag: '@ci' }, () => {
  test('Annotations stay on their slide across a presentation switch', async ({ browser, context, page }, testInfo) => {
    const pageIdentity = new PageIdentity(browser, context);
    await pageIdentity.initPages(page, testInfo);
    await pageIdentity.annotationsStayOnTheirSlideAcrossPresentations();
  });

  test('Taking presenter, then navigating and toggling the infinite whiteboard', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const pageIdentity = new PageIdentity(browser, context);
    await pageIdentity.initModPage(page, { testInfo });
    await pageIdentity.initModPage2(context, {
      testInfo,
      clientSettingsOverrides: { public: { whiteboard: { allowInfiniteWhiteboard: true } } },
    });
    await pageIdentity.takePresenterThenNavigateAndToggleInfiniteWhiteboard();
  });

  test('Removing a presentation while another user draws', async ({ browser, context, page }, testInfo) => {
    const pageIdentity = new PageIdentity(browser, context);
    await pageIdentity.initPages(page, testInfo);
    await pageIdentity.removePresentationWhileAnotherUserDraws();
  });

  test('Each slide keeps its own zoom', async ({ browser, context, page }, testInfo) => {
    const pageIdentity = new PageIdentity(browser, context);
    await pageIdentity.initModPage(page, { testInfo });
    await pageIdentity.zoomIsKeptPerSlide();
  });
});
