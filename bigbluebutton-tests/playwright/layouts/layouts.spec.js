const { test } = require('../fixtures');
const { fullyParallel } = require('../playwright.config');
const { encodeCustomParams } = require('../parameters/util');
const { PARAMETER_HIDE_PRESENTATION_TOAST } = require('../core/constants');
const { Layouts } = require('./layouts');
const { initializePages } = require('../core/helpers');

const hidePresentationToast = encodeCustomParams(PARAMETER_HIDE_PRESENTATION_TOAST);

test.describe("Layout @ci", () => {
  const layouts = new Layouts();
  test.describe.configure({ mode: fullyParallel ? 'parallel' : 'serial' });
  test[fullyParallel ? 'beforeEach' : 'beforeAll'](async ({ browser }) => {
    await initializePages(layouts, browser, { isMultiUser: true, createParameter: hidePresentationToast });
    await layouts.modPage.shareWebcam();
    await layouts.userPage.shareWebcam();
  });

  test("Focus on presentation", async () => {
    await layouts.focusOnPresentation();
  });

  test("Grid Layout", async () => {
    await layouts.gridLayout();
  });

  test("Smart layout", async () => {
    await layouts.smartLayout();
  });

  test("Custom layout", async () => {
    await layouts.customLayout();
  });

  test("Update everyone's layout", async () => {
    await layouts.updateEveryone();
  });
});
