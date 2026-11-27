import { EMOJI_PICKER_SETTINGS_OVERRIDE } from '../chat/util';
import { elements as e } from '../core/elements';
import { test } from '../core/setup/fixtures';
import { DisabledFeatureValues, MESSAGE_TOOLBAR_VALUES } from './disabledFeaturesValues';
import { preUploadedPresentationModule } from './util';

test.describe.parallel('Disabled features values', { tag: '@nightly' }, () => {
  test.describe(() => {
    for (const [feature, button] of Object.entries(MESSAGE_TOOLBAR_VALUES)) {
      test(`${feature} removes only the ${button} button from the message toolbar`, async ({
        browser,
        context,
        page,
      }, testInfo) => {
        const disabledFeatureValues = new DisabledFeatureValues(browser, context);
        await disabledFeatureValues.initModPage(page, { createParameter: `disabledFeatures=${feature}`, testInfo });
        await disabledFeatureValues.messageToolbarLacks([button]);
      });
    }

    test('The message toolbar offers reply, react, pin, edit and delete when none is disabled', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const disabledFeatureValues = new DisabledFeatureValues(browser, context);
      await disabledFeatureValues.initModPage(page, { testInfo });
      await disabledFeatureValues.messageToolbarLacks([]);
    });
  });

  test.describe(() => {
    test('chatEmojiPicker removes the emoji picker from the chat input', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const disabledFeatureValues = new DisabledFeatureValues(browser, context);
      await disabledFeatureValues.initModPage(page, {
        createParameter: 'disabledFeatures=chatEmojiPicker',
        clientSettingsOverrides: EMOJI_PICKER_SETTINGS_OVERRIDE,
        testInfo,
      });
      await disabledFeatureValues.emojiPickerRemoved();
    });

    test('The chat input offers the emoji picker when chatEmojiPicker is not disabled', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const disabledFeatureValues = new DisabledFeatureValues(browser, context);
      await disabledFeatureValues.initModPage(page, {
        clientSettingsOverrides: EMOJI_PICKER_SETTINGS_OVERRIDE,
        testInfo,
      });
      await disabledFeatureValues.emojiPickerShown();
    });
  });

  test.describe(() => {
    test('quizzes removes the quiz tab from the poll panel', async ({ browser, context, page }, testInfo) => {
      const disabledFeatureValues = new DisabledFeatureValues(browser, context);
      await disabledFeatureValues.initModPage(page, { createParameter: 'disabledFeatures=quizzes', testInfo });
      await disabledFeatureValues.quizTabRemoved();
    });

    test('The poll panel offers the quiz tab when quizzes is not disabled', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const disabledFeatureValues = new DisabledFeatureValues(browser, context);
      await disabledFeatureValues.initModPage(page, { testInfo });
      await disabledFeatureValues.quizTabShown();
    });
  });

  test.describe(() => {
    test('raiseHand removes the raise hand button', async ({ browser, context, page }, testInfo) => {
      const disabledFeatureValues = new DisabledFeatureValues(browser, context);
      await disabledFeatureValues.initModPage(page, { createParameter: 'disabledFeatures=raiseHand', testInfo });
      await disabledFeatureValues.raiseHandRemoved();
    });

    test('userReactions removes the reactions button', async ({ browser, context, page }, testInfo) => {
      const disabledFeatureValues = new DisabledFeatureValues(browser, context);
      await disabledFeatureValues.initModPage(page, { createParameter: 'disabledFeatures=userReactions', testInfo });
      await disabledFeatureValues.userReactionsRemoved();
    });

    test('timer removes the timer from the sidebar', async ({ browser, context, page }, testInfo) => {
      const disabledFeatureValues = new DisabledFeatureValues(browser, context);
      await disabledFeatureValues.initModPage(page, { createParameter: 'disabledFeatures=timer', testInfo });
      await disabledFeatureValues.timerRemoved();
    });

    test('Raise hand, reactions and timer are offered when none is disabled', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const disabledFeatureValues = new DisabledFeatureValues(browser, context);
      await disabledFeatureValues.initModPage(page, { testInfo });
      await disabledFeatureValues.raiseHandReactionsAndTimerShown();
    });
  });

  // the learningdashboard tests download the session data, which covers the button when nothing is disabled
  test('learningDashboardDownloadSessionData removes the session data download from the learning dashboard', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const disabledFeatureValues = new DisabledFeatureValues(browser, context);
    await disabledFeatureValues.initModPage(page, {
      createParameter: 'disabledFeatures=learningDashboardDownloadSessionData',
      testInfo,
    });
    await disabledFeatureValues.sessionDataDownloadRemoved();
  });

  test.describe(() => {
    test('downloadPresentationOriginalFile removes the original file from the download menu of a presentation', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const disabledFeatureValues = new DisabledFeatureValues(browser, context);
      await disabledFeatureValues.initModPage(page, {
        createParameter: 'disabledFeatures=downloadPresentationOriginalFile',
        createModules: preUploadedPresentationModule(e.presentationTXT),
        testInfo,
      });
      await disabledFeatureValues.originalFileDownloadRemoved();
    });

    test('downloadPresentationConvertedToPdf removes the converted PDF from the download menu of a presentation', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const disabledFeatureValues = new DisabledFeatureValues(browser, context);
      await disabledFeatureValues.initModPage(page, {
        createParameter: 'disabledFeatures=downloadPresentationConvertedToPdf',
        createModules: preUploadedPresentationModule(e.presentationTXT),
        testInfo,
      });
      await disabledFeatureValues.convertedPdfDownloadRemoved();
    });

    test('The download menu of a converted presentation offers the original file and the PDF when neither is disabled', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const disabledFeatureValues = new DisabledFeatureValues(browser, context);
      await disabledFeatureValues.initModPage(page, {
        createModules: preUploadedPresentationModule(e.presentationTXT),
        testInfo,
      });
      await disabledFeatureValues.presentationDownloadsShown();
    });
  });

  test.describe(() => {
    test('webcamGrid shows no participant tiles when the presentation is minimized', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const disabledFeatureValues = new DisabledFeatureValues(browser, context);
      await disabledFeatureValues.initModPage(page, { createParameter: 'disabledFeatures=webcamGrid', testInfo });
      await disabledFeatureValues.initUserPage(context, { testInfo });
      await disabledFeatureValues.webcamGridRemoved();
    });

    test('Minimizing the presentation shows the participant tiles when webcamGrid is not disabled', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const disabledFeatureValues = new DisabledFeatureValues(browser, context);
      await disabledFeatureValues.initModPage(page, { testInfo });
      await disabledFeatureValues.initUserPage(context, { testInfo });
      await disabledFeatureValues.webcamGridShown();
    });
  });

  test.describe(() => {
    test('slidePreloading stops preloading the next slides', async ({ browser, context, page }, testInfo) => {
      const disabledFeatureValues = new DisabledFeatureValues(browser, context);
      disabledFeatureValues.recordSlideRequests(page);
      await disabledFeatureValues.initModPage(page, { createParameter: 'disabledFeatures=slidePreloading', testInfo });
      await disabledFeatureValues.slidePreloadingOff();
    });

    test('The next slides are preloaded when slidePreloading is not disabled', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const disabledFeatureValues = new DisabledFeatureValues(browser, context);
      disabledFeatureValues.recordSlideRequests(page);
      await disabledFeatureValues.initModPage(page, { testInfo });
      await disabledFeatureValues.slidePreloadingOn();
    });
  });
});
