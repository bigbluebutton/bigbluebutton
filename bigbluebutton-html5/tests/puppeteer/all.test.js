const Audio = require('./audio/audio');
const Share = require('./webcam/share');
const Check = require('./webcam/check');
const Page = require('./core/page');
const Join = require('./breakout/join');
const Create = require('./breakout/create');
const Send = require('./chat/send');
const Clear = require('./chat/clear');
const Copy = require('./chat/copy');
const Save = require('./chat/save');
const MultiUsers = require('./user/multiusers');
const CustomParameters = require('./customparameters/customparameters');
const c = require('./customparameters/constants');
const util = require('./customparameters/util');
const Notifications = require('./notifications/notifications');
const ShareScreen = require('./screenshare/screenshare');
const Slide = require('./presentation/slide');
const Upload = require('./presentation/upload');
const Draw = require('./whiteboard/draw');
const VirtualizedList = require('./virtualizedlist/virtualize');
const Status = require('./user/status');

process.setMaxListeners(Infinity);

describe('Audio', () => {
  beforeEach(() => {
    jest.setTimeout(30000);
  });

  test('Join audio with Listen Only', async () => {
    const test = new Audio();
    let response;
    try {
      await test.init(Page.getArgsWithAudio());
      response = await test.test();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });

  test('Join audio with Microphone', async () => {
    const test = new Audio();
    let response;
    try {
      await test.init(Page.getArgsWithAudio());
      response = await test.microphone();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });
});

describe('Breakoutrooms', () => {
  beforeEach(() => {
    jest.setTimeout(150000);
  });

  // Create Breakout Room
  test('Create Breakout room', async () => {
    const test = new Create();
    let response;
    try {
      const testName = 'createBreakoutrooms';
      await test.init(undefined);
      await test.create(testName);
      response = await test.testCreatedBreakout(testName);
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });

  // Join Breakout Room
  test('Join Breakout room', async () => {
    const test = new Join();
    let response;
    try {
      const testName = 'joinBreakoutroomsWithoutFeatures';
      await test.init(undefined);
      await test.create(testName);
      await test.join(testName);
      response = await test.testJoined(testName);
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });

  // Join Breakout Room with Video
  test('Join Breakout room with Video', async () => {
    const test = new Join();
    let response;
    try {
      const testName = 'joinBreakoutroomsWithVideo';
      await test.init(undefined);
      await test.create(testName);
      await test.join(testName);
      response = await test.testJoined(testName);
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });

  // Join Breakout Room and start Screen Share
  test('Join Breakout room and share screen', async () => {
    const test = new Join();
    let response;
    try {
      const testName = 'joinBreakoutroomsAndShareScreen';
      await test.init(undefined);
      await test.create(testName);
      await test.join(testName);
      response = await test.testJoined(testName);
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });

  // Join Breakout Room with Audio
  test('Join Breakout room with Audio', async () => {
    const test = new Join();
    let response;
    try {
      const testName = 'joinBreakoutroomsWithAudio';
      await test.init(undefined);
      await test.create(testName);
      await test.join(testName);
      response = await test.testJoined(testName);
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });
});

describe('Chat', () => {
  beforeEach(() => {
    jest.setTimeout(30000);
  });

  test('Send message', async () => {
    const test = new Send();
    let response;
    try {
      await test.init(Page.getArgs());
      await test.closeAudioModal();
      response = await test.test();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });

  test('Clear chat', async () => {
    const test = new Clear();
    let response;
    try {
      await test.init(Page.getArgs());
      await test.closeAudioModal();
      response = await test.test();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });

  test('Copy chat', async () => {
    const test = new Copy();
    let response;
    try {
      await test.init(Page.getArgs());
      await test.closeAudioModal();
      response = await test.test();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });

  test('Save chat', async () => {
    const test = new Save();
    let response;
    try {
      await test.init(Page.getArgs());
      await test.closeAudioModal();
      response = await test.test();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });

  test('Send private chat to other User', async () => {
    const test = new MultiUsers();
    let response;
    try {
      await test.init();
      await test.page1.closeAudioModal();
      await test.page2.closeAudioModal();
      response = await test.multiUsersPrivateChat();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close(test.page1, test.page2);
    }
    expect(response).toBe(true);
  });

  test('Send public chat', async () => {
    const test = new MultiUsers();
    let response;
    try {
      await test.init();
      await test.page1.closeAudioModal();
      await test.page2.closeAudioModal();
      response = await test.multiUsersPublicChat();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close(test.page1, test.page2);
    }
    expect(response).toBe(true);
  });
});

describe('Custom parameters', () => {
  beforeEach(() => {
    jest.setTimeout(30000);
  });

  // This test spec sets the userdata-autoJoin parameter to false
  // and checks that the users don't get audio modal on login
  test('Auto join', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    try {
      page.logger('before');
      const testName = 'autoJoin';
      response = await test.autoJoin(testName, Page.getArgs(), undefined, c.autoJoin);
      page.logger('after');
    } catch (e) {
      page.logger(e);
    } finally {
      await test.closePage(test.page1);
    }
    expect(response).toBe(true);
  });

  // This test spec sets the userdata-listenOnlyMode parameter to false
  // and checks that the users can't see or use listen Only mode
  test('Listen Only Mode', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    try {
      page.logger('before');
      const testName = 'listenOnlyMode';
      response = await test.listenOnlyMode(testName, Page.getArgsWithAudio(), undefined, c.listenOnlyMode);
      page.logger('after');
    } catch (e) {
      page.logger(e);
    } finally {
      await test.close(test.page1, test.page2);
    }
    expect(response).toBe(true);
  });

  // This test spec sets the userdata-forceListenOnly parameter to false
  // and checks that the Viewers can only use listen only mode
  test('Force Listen Only', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    try {
      page.logger('before');
      const testName = 'forceListenOnly';
      response = await test.forceListenOnly(testName, Page.getArgsWithAudio(), undefined, c.forceListenOnly);
      page.logger('after');
    } catch (e) {
      page.logger(e);
    } finally {
      await test.closePage(test.page2);
    }
    expect(response).toBe(true);
  });

  // This test spec sets the userdata-skipCheck parameter to true
  // and checks that the users automatically skip audio check when clicking on Microphone
  test('Skip audio check', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    try {
      page.logger('before');
      const testName = 'skipCheck';
      response = await test.skipCheck(testName, Page.getArgsWithAudio(), undefined, c.skipCheck);
      page.logger('after');
    } catch (e) {
      page.logger(e);
    } finally {
      await test.closePage(test.page1);
    }
    expect(response).toBe(true);
  });

  // This test spec sets the userdata-clientTitle parameter to some value
  // and checks that the meeting window name starts with that value
  test('Client title', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    try {
      page.logger('before');
      const testName = 'clientTitle';
      response = await test.clientTitle(testName, Page.getArgs(), undefined, c.clientTitle);
      page.logger('after');
    } catch (e) {
      page.logger(e);
    } finally {
      await test.closePage(test.page1);
    }
    expect(response).toBe(true);
  });

  // This test spec sets the userdata-askForFeedbackOnLogout parameter to true
  // and checks that the users automatically get asked for feedback on logout page
  test('Ask For Feedback On Logout', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    try {
      page.logger('before');
      const testName = 'askForFeedbackOnLogout';
      response = await test.askForFeedbackOnLogout(testName, Page.getArgs(), undefined, c.askForFeedbackOnLogout);
      page.logger('after');
    } catch (e) {
      page.logger(e);
    } finally {
      await test.closePage(test.page1);
    }
    expect(response).toBe(true);
  });

  // This test spec sets the userdata-displayBrandingArea parameter to true and add a logo link
  // and checks that the users see the logo displaying in the meeting
  test('Display Branding Area', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    try {
      page.logger('before');
      const testName = 'displayBrandingArea';
      const parameterWithLogo = `${c.displayBrandingArea}&${c.logo}`;
      response = await test.displayBrandingArea(testName, Page.getArgs(), undefined, parameterWithLogo);
      page.logger('after');
    } catch (e) {
      page.logger(e);
    } finally {
      await test.closePage(test.page1);
    }
    expect(response).toBe(true);
  });

  // This test spec sets the userdata-shortcuts parameter to one or a list of shortcuts parameters
  // and checks that the users can use those shortcuts
  test('Shortcuts', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    try {
      page.logger('before');
      const testName = 'shortcuts';
      response = await test.shortcuts(testName, Page.getArgs(), undefined, encodeURI(c.shortcuts));
      page.logger('after');
    } catch (e) {
      page.logger(e);
    } finally {
      await test.closePage(test.page1);
    }
    expect(response).toBe(true);
  });

  // This test spec sets the userdata-enableScreensharing parameter to false
  // and checks that the Moderator can not see the Screen sharing button
  test('Enable Screensharing', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    try {
      page.logger('before');
      const testName = 'enableScreensharing';
      response = await test.enableScreensharing(testName, Page.getArgs(), undefined, c.enableScreensharing);
      page.logger('after');
    } catch (e) {
      page.logger(e);
    } finally {
      await test.closePage(test.page1);
    }
    expect(response).toBe(true);
  });

  // This test spec sets the userdata-enableVideo parameter to false
  // and checks that the Moderator can not see the Webcam sharing button
  test('Enable Webcam', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    try {
      page.logger('before');
      const testName = 'enableVideo';
      response = await test.enableVideo(testName, Page.getArgsWithVideo(), undefined, c.enableVideo);
      page.logger('after');
    } catch (e) {
      page.logger(e);
    } finally {
      await test.closePage(test.page1);
    }
    expect(response).toBe(true);
  });

  // This test spec sets the userdata-autoShareWebcam parameter to true
  // and checks that the Moderator sees the Webcam Settings Modal automatically at his connection to meeting
  test('Auto Share Webcam', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    try {
      page.logger('before');
      const testName = 'autoShareWebcam';
      response = await test.autoShareWebcam(testName, Page.getArgsWithVideo(), undefined, c.autoShareWebcam);
      page.logger('after');
    } catch (e) {
      page.logger(e);
    } finally {
      await test.closePage(test.page1);
    }
    expect(response).toBe(true);
  });

  // This test spec sets the userdata-multiUserPenOnly parameter to true
  // and checks that at multi Users whiteboard other users can see only pencil as drawing tool
  test('Multi Users Pen Only', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    try {
      page.logger('before');
      const testName = 'multiUserPenOnly';
      response = await test.multiUserPenOnly(testName, Page.getArgs(), undefined, c.multiUserPenOnly);
      page.logger('after');
    } catch (e) {
      page.logger(e);
    } finally {
      await test.close(test.page1, test.page2);
    }
    expect(response).toBe(true);
  });

  // This test spec sets the userdata-presenterTools parameter to an interval of parameters
  // and checks that at multi Users whiteboard Presenter can see only the set tools from the interval
  test('Presenter Tools', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    try {
      page.logger('before');
      const testName = 'presenterTools';
      response = await test.presenterTools(testName, Page.getArgs(), undefined, encodeURI(c.presenterTools));
      page.logger('after');
    } catch (e) {
      page.logger(e);
    } finally {
      await test.closePage(test.page1);
    }
    expect(response).toBe(true);
  });

  // This test spec sets the userdata-multiUserTools parameter to an interval of parameters
  // and checks that at multi Users whiteboard other users can see only the set tools from the interval
  test('Multi Users Tools', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    try {
      page.logger('before');
      const testName = 'multiUserTools';
      response = await test.multiUserTools(testName, Page.getArgs(), undefined, encodeURI(c.multiUserTools));
      page.logger('after');
    } catch (e) {
      page.logger(e);
    } finally {
      await test.close(test.page1, test.page2);
    }
    expect(response).toBe(true);
  });

  //  This test spec sets the userdata-customStyle parameter to an interval of styles
  //  and checks that the meeting displays what was called in the styles interval
  test('Custom Styles', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    try {
      page.logger('before');
      const testName = 'customStyle';
      response = await test.customStyle(testName, Page.getArgs(), undefined, encodeURIComponent(c.customStyle));
      page.logger('after');
    } catch (e) {
      page.logger(e);
    } finally {
      await test.closePage(test.page1);
    }
    expect(response).toBe(true);
  });

  // This test spec sets the userdata-customStyleUrl parameter to a styles URL
  // and checks that the meeting displays what was called in the styles URL
  test('Custom Styles URL', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    try {
      page.logger('before');
      const testName = 'customStyleUrl';
      response = await test.customStyleUrl(testName, Page.getArgs(), undefined, encodeURI(c.customStyleUrl));
      page.logger('after');
    } catch (e) {
      page.logger(e);
    } finally {
      await test.closePage(test.page1);
    }
    expect(response).toBe(true);
  });

  // This test spec sets the userdata-autoSwapLayout parameter to true
  // and checks that at any webcam share, the focus will be on the webcam,
  // and the presentation gets minimized and the available shared webcam will replace the Presentation
  test('Auto Swap Layout', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    try {
      page.logger('before');
      const testName = 'autoSwapLayout';
      response = await test.autoSwapLayout(testName, Page.getArgs(), undefined, encodeURI(c.autoSwapLayout));
      page.logger('after');
    } catch (e) {
      page.logger(e);
    } finally {
      await test.closePage(test.page1);
    }
    expect(response).toBe(true);
  });

  // This test spec sets the userdata-hidePresentation parameter to true
  // and checks that the Presentation is totally hidden, and its place will be displaying a message
  test('Hide Presentation', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    try {
      page.logger('before');
      const testName = 'hidePresentation';
      response = await test.hidePresentation(testName, Page.getArgs(), undefined, encodeURI(c.hidePresentation));
      page.logger('after');
    } catch (e) {
      page.logger(e);
    } finally {
      await test.closePage(test.page1);
    }
    expect(response).toBe(true);
  });

  //  This test spec sets the userdata-bannerText parameter to some text
  //  and checks that the meeting has a banner bar containing the same text
  test('Banner Text', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    try {
      page.logger('before');
      const testName = 'bannerText';
      response = await test.bannerText(testName, Page.getArgs(), undefined, c.bannerText);
      page.logger('after');
    } catch (e) {
      page.logger(e);
    } finally {
      await test.closePage(test.page1);
    }
    expect(response).toBe(true);
  });

  // This test spec sets the userdata-bannerColor parameter to some hex color value
  // and checks that the meeting has a banner bar containing that color in rgb(r, g, b)
  test('Banner Color', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    try {
      page.logger('before');
      const testName = 'bannerColor';
      const colorToRGB = util.hexToRgb(c.color);
      response = await test.bannerColor(testName, Page.getArgs(), undefined, `${c.bannerColor}&${encodeURI(c.bannerText)}`, colorToRGB);
      page.logger('after');
    } catch (e) {
      page.logger(e);
    } finally {
      await test.closePage(test.page1);
    }
    expect(response).toBe(true);
  });

  // This test spec sets the userdata-bbb_show_public_chat_on_login parameter to false
  // and checks that the users don't see that box by default
  test('Show Public Chat On Login', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    try {
      page.logger('before');
      const testName = 'showPublicChatOnLogin';
      response = await test.showPublicChatOnLogin(testName, Page.getArgs(), undefined, `${c.showPublicChatOnLogin}`);
      page.logger('after');
    } catch (e) {
      page.logger(e);
    } finally {
      await test.closePage(test.page1);
    }
    expect(response).toBe(true);
  });

  // This test spec sets the userdata-bbb_force_restore_presentation_on_new_events parameter to true
  // and checks that the viewers get the presentation restored forcefully when the Moderator zooms
  // in/out the presentation or publishes a poll or adds an annotation
  test('Force Restore Presentation On New Events', async () => {
    const test = new CustomParameters();
    const page = new Page();
    let response;
    try {
      page.logger('before');
      const testName = 'forceRestorePresentationOnNewEvents';
      response = await test.forceRestorePresentationOnNewEvents(testName, Page.getArgs(), undefined, `${c.forceRestorePresentationOnNewEvents}`);
      page.logger('after');
    } catch (e) {
      page.logger(e);
    } finally {
      await test.close(test.page1, test.page2);
    }
    expect(response).toBe(true);
  });
});

describe('Notifications', () => {
  beforeEach(() => {
    jest.setTimeout(50000);
  });

  test('Save settings notification', async () => {
    const test = new Notifications();
    let response;
    try {
      const testName = 'saveSettingsNotification';
      response = await test.saveSettingsNotification(testName);
    } catch (e) {
      console.log(e);
    } finally {
      await test.close(test.page1, test.page2);
      await test.page1.logger('Save Setting notification !');
    }
    expect(response).toBe(true);
  });

  test('Public Chat notification', async () => {
    const test = new Notifications();
    let response;
    try {
      const testName = 'publicChatNotification';
      response = await test.publicChatNotification(testName);
    } catch (e) {
      console.log(e);
    } finally {
      await test.close(test.page1, test.page2);
      await test.page1.logger('Public Chat notification !');
    }
    expect(response).toBe(true);
  });

  test('Private Chat notification', async () => {
    const test = new Notifications();
    let response;
    try {
      const testName = 'privateChatNotification';
      response = await test.privateChatNotification(testName);
    } catch (e) {
      console.log(e);
    } finally {
      await test.close(test.page1, test.page2);
      await test.page1.logger('Private Chat notification !');
    }
    expect(response).toBe(true);
  });

  test('User join notification', async () => {
    const test = new Notifications();
    let response;
    try {
      const testName = 'userJoinNotification';
      response = await test.getUserJoinPopupResponse(testName);
    } catch (e) {
      console.log(e);
    } finally {
      await test.closePages();
      await test.page1.logger('User join notification !');
    }
    expect(response).toBe('User4 joined the session');
  });

  test('Presentation upload notification', async () => {
    const test = new Notifications();
    let response;
    try {
      const testName = 'uploadPresentationNotification';
      response = await test.fileUploaderNotification(testName);
    } catch (e) {
      console.log(e);
    } finally {
      await test.closePage(test.page3);
      await test.page3.logger('Presentation upload notification !');
    }
    expect(response).toContain('Current presentation');
  });

  test('Poll results notification', async () => {
    const test = new Notifications();
    let response;
    try {
      const testName = 'pollResultsNotification';
      response = await test.publishPollResults(testName);
    } catch (e) {
      console.log(e);
    } finally {
      await test.closePage(test.page3);
      await test.page3.logger('Poll results notification !');
    }
    expect(response).toContain('Poll results were published to Public Chat and Whiteboard');
  });

  test('Screenshare notification', async () => {
    const page = new Notifications();
    let response;
    try {
      const testName = 'screenShareNotification';
      response = await page.screenshareToast(testName);
    } catch (e) {
      console.log(e);
    } finally {
      await page.closePage(page.page3);
      await page.page3.logger('Screenshare notification !');
    }
    expect(response).toBe('Screenshare has started');
  });

  test('Audio notifications', async () => {
    const test = new Notifications();
    let response;
    try {
      const testName = 'audioNotification';
      response = await test.audioNotification(testName);
    } catch (e) {
      console.log(e);
    } finally {
      await test.closePage(test.page3);
      await test.page3.logger('Audio notification !');
    }
    expect(response).toBe(true);
  });
  });

  describe('Presentation', () => {
    beforeEach(() => {
      jest.setTimeout(30000);
    });

    test('Skip slide', async () => {
      const test = new Slide();
      let response;
      try {
        await test.init(Page.getArgs());
        await test.closeAudioModal();
        response = await test.test();
      } catch (e) {
        console.log(e);
      } finally {
        await test.close();
      }
      expect(response).toBe(true);
    });

    test('Upload presentation', async () => {
      const test = new Upload();
      let response;
      try {
        await test.init(Page.getArgs());
        await test.closeAudioModal();
        response = await test.test();
      } catch (e) {
        console.log(e);
      } finally {
        await test.close();
      }
      expect(response).toBe(true);
    });
  });

  describe('Screen Share', () => {
    beforeEach(() => {
      jest.setTimeout(30000);
    });

    test('Share screen', async () => {
      const test = new ShareScreen();
      let response;
      try {
        await test.init(Page.getArgsWithVideo());
        await test.closeAudioModal();
        response = await test.test();
      } catch (e) {
        console.log(e);
      } finally {
        await test.close();
      }
      expect(response).toBe(true);
    });
  });

  describe('User', () => {
    beforeEach(() => {
      jest.setTimeout(30000);
    });

    test('Change status', async () => {
      const test = new Status();
      let response;
      try {
        await test.init(Page.getArgs());
        await test.closeAudioModal();
        response = await test.test();
      } catch (e) {
        console.log(e);
      } finally {
        await test.close();
      }
      expect(response).toBe(true);
    });

    test('Multi user presence check', async () => {
      const test = new MultiUsers();
      let response;
      try {
        await test.init();
        await test.page1.closeAudioModal();
        await test.page2.closeAudioModal();
        response = await test.test();
      } catch (err) {
        console.log(err);
      } finally {
        await test.close(test.page1, test.page2);
      }
      expect(response).toBe(true);
    });
  });

  describe('Virtualized List', () => {
    beforeEach(() => {
      jest.setTimeout(3600000);
    });

    test('Virtualized List Audio test', async () => {
      const test = new VirtualizedList();
      let response;
      try {
        await test.init();
        response = await test.test();
      } catch (e) {
        console.log(e);
      } finally {
        await test.close();
      }
      expect(response).toBe(true);
    }, parseInt(process.env.TEST_DURATION_TIME));
  });

  describe('Whiteboard', () => {
    beforeEach(() => {
      jest.setTimeout(30000);
    });

    test('Draw rectangle', async () => {
      const test = new Draw();
      let response;
      try {
        await test.init(Page.getArgs());
        await test.closeAudioModal();
        response = await test.test();
      } catch (e) {
        console.log(e);
      } finally {
        await test.close();
      }
      expect(response).toBe(true);
    });
  });

  describe('Webcam', () => {
    beforeEach(() => {
      jest.setTimeout(30000);
    });

    test('Shares webcam', async () => {
      const test = new Share();
      let response;
      try {
        await test.init(Page.getArgsWithVideo());
        response = await test.test();
      } catch (e) {
        console.log(e);
      } finally {
        await test.close();
      }
      expect(response).toBe(true);
    });

  test('Checks content of webcam', async () => {
    const test = new Check();
    let response;
    try {
      await test.init(Page.getArgsWithVideo());
      response = await test.test();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });
});
