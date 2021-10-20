const Page = require('../core/page');
const CustomParameters = require('./customparameters');
const c = require('./constants');
const util = require('./util');
const { closePages } = require('../core/util');
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const { MAX_CUSTOM_PARAMETERS_TEST_TIMEOUT } = require('../core/constants'); // core constants (Timeouts vars imported)

expect.extend({ toMatchImageSnapshot });

const customParametersTest = () => {
  beforeEach(() => {
    jest.setTimeout(MAX_CUSTOM_PARAMETERS_TEST_TIMEOUT);
  });

  // This test spec sets the userdata-autoJoin parameter to false
  // and checks that the users don't get audio modal on login
  test('Auto join', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    let screenshot;
    try {
      const testName = 'autoJoin';
      await page.logger('before ', testName);
      response = await test.autoJoin(testName, c.autoJoin);
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await page.logger('after ', testName);
    } catch (err) {
      await page.logger(err);
    } finally {
      await test.page1.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  });

  // This test spec sets the userdata-listenOnlyMode parameter to false
  // and checks that the users can't see or use listen Only mode
  test('Listen Only Mode', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    let screenshot;
    try {
      const testName = 'listenOnlyMode';
      await page.logger('before ', testName);
      response = await test.listenOnlyMode(testName, c.listenOnlyMode);
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await page.logger('after ', testName);
    } catch (err) {
      await page.logger(err);
    } finally {
      await test.page1.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  });

  // This test spec sets the userdata-forceListenOnly parameter to false
  // and checks that the Viewers can only use listen only mode
  test('Force Listen Only', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    let screenshot;
    try {
      const testName = 'forceListenOnly';
      await page.logger('before ', testName);
      response = await test.forceListenOnly(testName, c.forceListenOnly);
      await test.page2.stopRecording();
      screenshot = await test.page2.page.screenshot();
      await page.logger('after ', testName);
    } catch (err) {
      await page.logger(err);
    } finally {
      await test.page2.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  });

  // This test spec sets the userdata-bbb_skip_check_audio parameter to true
  // and checks that the users automatically skip audio check when clicking on Microphone
  test('Skip audio check', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    let screenshot;
    try {
      const testName = 'skipCheck';
      await page.logger('before ', testName);
      response = await test.skipCheck(testName, c.skipCheck);
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await page.logger('after ', testName);
    } catch (err) {
      await page.logger(err);
    } finally {
      await test.page1.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(53.18, screenshot);
  });

  // This test spec sets the userdata-bbb_skip_check_audio_on_first_join parameter to true
  // and checks that the users automatically skip audio check when clicking on Microphone
  test('Skip audio check on first join', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    let screenshot;
    try {
      const testName = 'skipCheckOnFirstJoin';
      await page.logger('before ', testName);
      response = await test.skipCheckOnFirstJoin(testName, c.skipCheckOnFirstJoin);
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await page.logger('after ', testName);
    } catch (err) {
      await page.logger(err);
    } finally {
      await test.page1.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(53.18, screenshot);
  });

  // This test spec sets the userdata-clientTitle parameter to some value
  // and checks that the meeting window name starts with that value
  test('Client title', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    let screenshot;
    try {
      const testName = 'clientTitle';
      await page.logger('before ', testName);
      response = await test.clientTitle(testName, c.clientTitle);
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await page.logger('after ', testName);
    } catch (err) {
      await page.logger(err);
    } finally {
      await test.page1.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  });

  // This test spec sets the userdata-askForFeedbackOnLogout parameter to true
  // and checks that the users automatically get asked for feedback on logout page
  test('Ask For Feedback On Logout', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    let screenshot;
    try {
      const testName = 'askForFeedbackOnLogout';
      await page.logger('before ', testName);
      response = await test.askForFeedbackOnLogout(testName, c.askForFeedbackOnLogout);
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await page.logger('after ', testName);
    } catch (err) {
      await page.logger(err);
    } finally {
      await test.page1.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  });

  // This test spec sets the userdata-displayBrandingArea parameter to true and add a logo link
  // and checks that the users see the logo displaying in the meeting
  test('Display Branding Area', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    let screenshot;
    try {
      const testName = 'displayBrandingArea';
      await page.logger('before ', testName);
      const parameterWithLogo = `${c.displayBrandingArea}&${util.encodeCustomParams(c.logo)}`;
      response = await test.displayBrandingArea(testName, parameterWithLogo);
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await page.logger('after ', testName);
    } catch (err) {
      await page.logger(err);
    } finally {
      await test.page1.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  });

  // This test spec sets the userdata-shortcuts parameter to one or a list of shortcuts parameters
  // and checks that the users can use those shortcuts
  test('Shortcuts', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    let screenshot;
    try {
      const testName = 'shortcuts';
      await page.logger('before ', testName);
      const shortcutParam = util.getAllShortcutParams();
      response = await test.shortcuts(testName, util.encodeCustomParams(shortcutParam));
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await page.logger('after ', testName);
    } catch (err) {
      await page.logger(err);
    } finally {
      await closePages(test.page1, test.page2);
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  });

  // This test spec sets the userdata-enableScreensharing parameter to false
  // and checks that the Moderator can not see the Screen sharing button
  test('Enable Screensharing', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    let screenshot;
    try {
      const testName = 'enableScreensharing';
      await page.logger('before ', testName);
      response = await test.enableScreensharing(testName, c.enableScreensharing);
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await page.logger('after ', testName);
    } catch (err) {
      await page.logger(err);
    } finally {
      await test.page1.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  });

  // This test spec sets the userdata-enableVideo parameter to false
  // and checks that the Moderator can not see the Webcam sharing button
  test('Enable Webcam', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    let screenshot;
    try {
      const testName = 'enableVideo';
      await page.logger('before ', testName);
      response = await test.enableVideo(testName, c.enableVideo);
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await page.logger('after ', testName);
    } catch (err) {
      await page.logger(err);
    } finally {
      await test.page1.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  });

  // This test spec sets the userdata-autoShareWebcam parameter to true
  // and checks that the Moderator sees the Webcam Settings Modal automatically at his connection to meeting
  test('Auto Share Webcam', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    let screenshot;
    try {
      const testName = 'autoShareWebcam';
      await page.logger('before ', testName);
      response = await test.autoShareWebcam(testName, c.autoShareWebcam);
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await page.logger('after ', testName);
    } catch (err) {
      await page.logger(err);
    } finally {
      await test.page1.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  });

  // This test spec sets the userdata-multiUserPenOnly parameter to true
  // and checks that at multi Users whiteboard other users can see only pencil as drawing tool
  test('Multi Users Pen Only', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    let screenshot;
    try {
      const testName = 'multiUserPenOnly';
      await page.logger('before ', testName);
      response = await test.multiUserPenOnly(testName, c.multiUserPenOnly);
      await test.page1.stopRecording();
      await test.page2.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await page.logger('after ', testName);
    } catch (err) {
      await page.logger(err);
    } finally {
      await closePages(test.page1, test.page2);
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  });

  // This test spec sets the userdata-presenterTools parameter to an interval of parameters
  // and checks that at multi Users whiteboard Presenter can see only the set tools from the interval
  test('Presenter Tools', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    let screenshot;
    try {
      const testName = 'presenterTools';
      await page.logger('before ', testName);
      response = await test.presenterTools(testName, util.encodeCustomParams(c.presenterTools));
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await page.logger('after ', testName);
    } catch (err) {
      await page.logger(err);
    } finally {
      await test.page1.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  });

  // This test spec sets the userdata-multiUserTools parameter to an interval of parameters
  // and checks that at multi Users whiteboard other users can see only the set tools from the interval
  test('Multi Users Tools', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    let screenshot;
    try {
      const testName = 'multiUserTools';
      await page.logger('before ', testName);
      response = await test.multiUserTools(testName, util.encodeCustomParams(c.multiUserTools));
      await test.page1.stopRecording();
      await test.page2.stopRecording();
      screenshot = await test.page2.page.screenshot();
      await page.logger('after ', testName);
    } catch (err) {
      await page.logger(err);
    } finally {
      await closePages(test.page1, test.page2);
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  });

  // This test spec sets the userdata-customStyle parameter to an interval of styles
  // and checks that the meeting displays what was called in the styles interval
  test('Custom Styles: CSS code', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    let screenshot;
    try {
      const testName = 'customStyle';
      await page.logger('before ', testName);
      response = await test.customStyle(testName, util.encodeCustomParams(c.customStyle));
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await page.logger('after ', testName);
    } catch (err) {
      await page.logger(err);
    } finally {
      await test.page1.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  });

  // This test spec sets the userdata-customStyleUrl parameter to a styles URL
  // and checks that the meeting displays what was called in the styles URL
  test('Custom Styles: URL', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    let screenshot;
    try {
      const testName = 'customStyleUrl';
      await page.logger('before ', testName);
      response = await test.customStyle(testName, util.encodeCustomParams(c.customStyleUrl));
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await page.logger('after ', testName);
    } catch (err) {
      await page.logger(err);
    } finally {
      await test.page1.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  });

  // This test spec sets the userdata-autoSwapLayout parameter to true
  // and checks that at any webcam share, the focus will be on the webcam,
  // and the presentation gets minimized and the available shared webcam will replace the Presentation
  test('Auto Swap Layout', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    let screenshot;
    try {
      const testName = 'autoSwapLayout';
      await page.logger('before ', testName);
      response = await test.autoSwapLayout(testName, c.autoSwapLayout);
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await page.logger('after ', testName);
    } catch (err) {
      await page.logger(err);
    } finally {
      await test.page1.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  });

  // This test spec sets the userdata-hidePresentation parameter to true
  // and checks that the Presentation is totally hidden, and its place will be displaying a message
  test('Hide Presentation', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    let screenshot;
    try {
      const testName = 'hidePresentation';
      await page.logger('before ', testName);
      response = await test.hidePresentation(testName, util.encodeCustomParams(c.hidePresentation));
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await page.logger('after ', testName);
    } catch (err) {
      await page.logger(err);
    } finally {
      await test.page1.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  });

  // This test spec sets the userdata-bannerText parameter to some text
  // and checks that the meeting has a banner bar containing the same text
  test('Banner Text', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    let screenshot;
    try {
      const testName = 'bannerText';
      await page.logger('before ', testName);
      response = await test.bannerText(testName, util.encodeCustomParams(c.bannerText));
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await page.logger('after ', testName);
    } catch (err) {
      await page.logger(err);
    } finally {
      await test.page1.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  });

  // This test spec sets the userdata-bannerColor parameter to some hex color value
  // and checks that the meeting has a banner bar containing that color in rgb(r, g, b)
  test('Banner Color', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    let screenshot;
    try {
      const testName = 'bannerColor';
      await page.logger('before ', testName);
      const colorToRGB = util.hexToRgb(c.color);
      response = await test.bannerColor(testName, `${c.bannerColor}&${util.encodeCustomParams(c.bannerText)}`, colorToRGB);
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await page.logger('after ', testName);
    } catch (err) {
      await page.logger(err);
    } finally {
      await test.page1.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  });

  // This test spec sets the userdata-bbb_show_public_chat_on_login parameter to false
  // and checks that the users don't see that box by default
  test('Show Public Chat On Login', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    let screenshot;
    try {
      const testName = 'showPublicChatOnLogin';
      await page.logger('before ', testName);
      response = await test.showPublicChatOnLogin(testName, c.showPublicChatOnLogin);
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await page.logger('after ', testName);
    } catch (err) {
      await page.logger(err);
    } finally {
      await test.page1.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  });

  // This test spec sets the userdata-bbb_force_restore_presentation_on_new_events parameter to true
  // and checks that the viewers get the presentation restored forcefully when the Moderator zooms
  // in/out the presentation or publishes a poll or adds an annotation
  test('Force Restore Presentation On New Events', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    let screenshot;
    try {
      const testName = 'forceRestorePresentationOnNewEvents';
      await page.logger('before ', testName);
      response = await test.forceRestorePresentationOnNewEvents(testName, c.forceRestorePresentationOnNewEvents);
      await test.page1.stopRecording();
      await test.page2.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await page.logger('after ', testName);
    } catch (err) {
      await page.logger(err);
    } finally {
      await closePages(test.page1, test.page2);
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  });

  // This test spec sets the userdata-bbb_force_restore_presentation_on_new_events parameter to true
  // and checks that the viewers get the presentation restored forcefully when the Moderator zooms
  // publishes a poll result
  test('Force Restore Presentation On New Poll Result', async () => {
    const test = new CustomParameters();
    let response;
    let screenshot;
    try {
      const testName = 'forceRestorePresentationOnNewPollResult';
      await test.page1.logger('begin of ', testName);
      response = await test.forceRestorePresentationOnNewPollResult(testName, c.forceRestorePresentationOnNewEvents);
      await test.page1.logger('end of ', testName);
      await test.page2.stopRecording();
      screenshot = await test.page1.page.screenshot();
    } catch (err) {
      await test.page1.logger(err);
    } finally {
      await closePages(test.page1, test.page2);
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  });

  // This test spec sets the userdata-bbb_record_video parameter to false
  // and makes sure that the meeting recording button should not be available
  test('Record Meeting', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    let screenshot;
    try {
      const testName = 'recordMeeting';
      await page.logger('before ', testName);
      response = await test.recordMeeting(testName, c.recordMeeting);
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await page.logger('after ', testName);
    } catch (err) {
      await page.logger(err);
    } finally {
      await test.page1.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  });

  // This test spec sets the userdata-bbb_skip_video_preview parameter to true
  // and makes sure that the webcam video preview modal should not appear
  test('Skip Video Preview', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    let screenshot;
    try {
      const testName = 'skipVideoPreview';
      await page.logger('before ', testName);
      response = await test.skipVideoPreview(testName, c.skipVideoPreview);
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await page.logger('after ', testName);
    } catch (err) {
      await page.logger(err);
    } finally {
      await test.page1.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  });

  // This test spec sets the userdata-bbb_skip_video_preview_on_first_join parameter to true
  // and makes sure that the webcam video preview modal should not appear on first join only
  test('Skip Video Preview on First Join', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    let screenshot;
    try {
      const testName = 'skipVideoPreviewOnFirstJoin';
      await page.logger('before ', testName);
      response = await test.skipVideoPreviewOnFirstJoin(testName, c.skipVideoPreviewOnFirstJoin);
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await page.logger('after ', testName);
    } catch (err) {
      await page.logger(err);
    } finally {
      await test.page1.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  });

  // This test spec sets the userdata-bbb_mirror_own_webcam parameter to true
  // and makes sure that the webcam video preview and the container
  // should both appear with mirrored Tag
  test('Mirror Own Webcam', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    let screenshot;
    try {
      const testName = 'mirrorOwnWebcam';
      await page.logger('before ', testName);
      response = await test.mirrorOwnWebcam(testName, c.mirrorOwnWebcam);
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await page.logger('after ', testName);
    } catch (err) {
      await page.logger(err);
    } finally {
      await test.page1.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  });

  // This test spec sets the userdata-bbb_show_participants_on_login parameter to false
  // and makes sure that the user list won't appear on login
  test('Show Participants on Login', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    let screenshot;
    try {
      const testName = 'showParticipantsOnLogin';
      await page.logger('before ', testName);
      response = await test.showParticipantsOnLogin(testName, c.showParticipantsOnLogin);
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await page.logger('after ', testName);
    } catch (err) {
      await page.logger(err);
    } finally {
      await test.page1.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  });
};

module.exports = exports = customParametersTest;