const Page = require('../core/page');
const params = require('../params');
const e = require('../core/elements');
const { checkElement } = require('../core/util');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');

class Create {
  constructor() {
    this.page1 = new Page();
    this.page2 = new Page();
    this.page3 = new Page();
  }

  // Join BigBlueButton meeting with a Moderator and a Viewer
  async init(meetingId, testName) {
    await this.page1.init(Page.getArgs(), meetingId, { ...params, fullName: 'Moderator1' }, undefined, testName);
    await this.page2.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: 'Viewer1', moderatorPW: '' }, undefined, testName);
  }

  // Join BigBlueButton meeting with a Viewer only
  async initViewer(testName) {
    await this.page3.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: 'Viewer2', moderatorPW: '' }, undefined, testName);
  }

  async askModeratorGuestPolicy(testName) {
    try {
      await this.page1.screenshot(`${testName}`, `01-before-closing-audio-modal-[${this.page1.meetingId}]`);
      await this.page1.closeAudioModal();
      await this.page2.closeAudioModal();
      await this.page1.screenshot(`${testName}`, `02-after-closing-audio-modal-[${this.page1.meetingId}]`);

      await this.page1.waitAndClick(e.manageUsers);
      await this.page1.screenshot(`${testName}`, `03-opened-users-managing-[${this.page1.meetingId}]`);

      await this.page1.waitAndClick(e.guestPolicyLabel);
      await this.page1.screenshot(`${testName}`, `04-opened-guest-policy-[${this.page1.meetingId}]`);

      await this.page1.waitAndClick(e.askModerator);
      await this.page1.screenshot(`${testName}`, `05-clicked-askModerator-[${this.page1.meetingId}]`);
      await this.initViewer(testName);
      const responseLoggedIn = await this.page1.page.evaluate(checkElement, e.waitingUsersBtn);
      await this.page1.screenshot(`${testName}`, `06-after-viewer-acceptance-[${this.page1.meetingId}]`);
      return responseLoggedIn;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async alwaysAcceptGuestPolicy(testName) {
    try {
      await this.page1.screenshot(`${testName}`, `01-before-closing-audio-modal-[${this.page1.meetingId}]`);
      await this.page1.closeAudioModal();
      await this.page2.closeAudioModal();
      await this.page1.screenshot(`${testName}`, `02-after-closing-audio-modal-[${this.page1.meetingId}]`);

      await this.page1.waitAndClick(e.manageUsers);
      await this.page1.screenshot(`${testName}`, `03-opened-users-managing-[${this.page1.meetingId}]`);

      await this.page1.waitAndClick(e.guestPolicyLabel);
      await this.page1.screenshot(`${testName}`, `04-opened-guest-policy-[${this.page1.meetingId}]`);

      await this.page1.waitAndClick(e.alwaysAccept);
      await this.page1.screenshot(`${testName}`, `05-clicked-alwaysAccept-[${this.page1.meetingId}]`);
      await this.initViewer(testName);
      await this.page3.closeAudioModal();
      const responseLoggedIn = await this.page3.page.evaluate(checkElement, e.whiteboard);
      await this.page3.screenshot(`${testName}`, `06-after-viewer-connection-[${this.page1.meetingId}]`);
      return responseLoggedIn;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async alwaysDenyGuestPolicy(testName) {
    try {
      await this.page1.screenshot(`${testName}`, `01-before-closing-audio-modal-[${this.page1.meetingId}]`);
      await this.page1.closeAudioModal();
      await this.page2.closeAudioModal();
      await this.page1.screenshot(`${testName}`, `02-after-closing-audio-modal-[${this.page1.meetingId}]`);

      await this.page1.waitAndClick(e.manageUsers);
      await this.page1.screenshot(`${testName}`, `03-opened-users-managing-[${this.page1.meetingId}]`);

      await this.page1.waitAndClick(e.guestPolicyLabel);
      await this.page1.screenshot(`${testName}`, `04-opened-guest-policy-[${this.page1.meetingId}]`);

      await this.page1.waitAndClick(e.alwaysAccept);
      await this.page1.screenshot(`${testName}`, `05-clicked-alwaysAccept-[${this.page1.meetingId}]`);
      await this.initViewer(testName);
      const responseLoggedIn = await this.page3.page.evaluate(checkElement, e.joinMeetingDemoPage);
      await this.page3.screenshot(`${testName}`, `06-after-viewer-gets-denied-[${this.page1.meetingId}]`);
      return responseLoggedIn;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  // Create Breakoutrooms
  async create(testName) {
    try {
      await this.page1.closeAudioModal();
      await this.page2.closeAudioModal();
      await this.page1.screenshot(testName, '01-page01-initialized');
      await this.page2.screenshot(testName, '01-page02-initialized');

      await this.page1.waitAndClick(e.manageUsers);
      await this.page1.waitAndClick(e.createBreakoutRooms);
      await this.page1.screenshot(testName, '02-page01-creating-breakoutrooms');

      await this.page1.waitAndClick(e.randomlyAssign);
      await this.page1.screenshot(testName, '03-page01-randomly-assign-user');

      await this.page1.waitAndClick(e.modalConfirmButton, ELEMENT_WAIT_LONGER_TIME);
      await this.page1.screenshot(testName, '04-page01-confirm-breakoutrooms-creation');

      // Join breakout room
      await this.page2.waitAndClick(e.modalConfirmButton, ELEMENT_WAIT_LONGER_TIME);
      await this.page2.screenshot(testName, '02-page02-accept-invite-breakoutrooms');

      await this.page2.bringToFront();
      await this.page2.waitAndClick(e.chatButton);
      await this.page2.waitAndClick(e.breakoutRoomsItem);
      await this.page2.waitForSelector(e.alreadyConnected, ELEMENT_WAIT_LONGER_TIME);

      const breakoutPage2 = await this.page2.getLastTargetPage();
      await breakoutPage2.bringToFront();

      await breakoutPage2.screenshot(testName, '03-breakout-page02-before-closing-audio-modal');
      await breakoutPage2.closeAudioModal();

      await breakoutPage2.screenshot(testName, '04-breakout-page02-after-closing-audio-modal');
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  // Check if Breakoutrooms have been created
  async testCreatedBreakout(testName) {
    try {
      const resp = await this.page1.page.evaluate(checkElement, e.breakoutRoomsItem);
      if (resp === true) {
        await this.page1.screenshot(`${testName}`, `05-page01-success-${testName}`);

        return true;
      }
      await this.page1.screenshot(`${testName}`, `05-page01-fail-${testName}`);

      return false;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  // Initialize a Moderator session
  async joinWithUser3(testName) {
    try {
      if (testName === 'joinBreakoutroomsWithAudio') {
        await this.page3.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: 'Moderator3' }, undefined, testName);
        await this.page3.closeAudioModal();
        await this.page3.waitAndClick(e.breakoutRoomsButton);

        await this.page3.waitForSelector(e.breakoutRoomsItem);
        await this.page3.waitAndClick(e.chatButton);
        await this.page3.waitAndClick(e.breakoutRoomsItem);

        await this.page3.waitAndClick(e.generateRoom1);
        await this.page3.waitAndClick(e.joinGeneratedRoom1);
        await this.page3.waitForSelector(e.alreadyConnected, ELEMENT_WAIT_LONGER_TIME);

        const breakoutPage3 = await this.page3.getLastTargetPage();
        await breakoutPage3.screenshot(testName, `00-breakout-page03-user-joined-no-mic-before-check`);

        await breakoutPage3.bringToFront();
        await breakoutPage3.waitAndClick(e.microphoneButton);
        await breakoutPage3.waitForSelector(e.connectingStatus);
        const parsedSettings = await this.page1.getSettingsYaml();
        const listenOnlyCallTimeout = parseInt(parsedSettings.public.media.listenOnlyCallTimeout);
        await breakoutPage3.waitAndClick(e.echoYesButton, listenOnlyCallTimeout);
        await breakoutPage3.waitForSelector(e.whiteboard);

        await breakoutPage3.screenshot(testName, '00-breakout-page03-user-joined-with-mic-before-check');
      } else if (testName === 'joinBreakoutroomsWithVideo') {
        await this.page3.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: 'Moderator3' }, undefined, testName);
        await this.page3.closeAudioModal();
        await this.page3.waitAndClick(e.breakoutRoomsButton);
        await this.page3.waitAndClick(e.generateRoom1);
        await this.page3.waitAndClick(e.joinGeneratedRoom1);
        await this.page3.waitForSelector(e.alreadyConnected);

        const breakoutPage3 = await this.page3.getLastTargetPage();
        await breakoutPage3.screenshot(testName, '00-breakout-page03-user-joined-no-webcam-before-check');

        await breakoutPage3.bringToFront();
        await breakoutPage3.closeAudioModal();
        await breakoutPage3.waitAndClick(e.joinVideo);
        const parsedSettings = await this.page3.getSettingsYaml();
        const videoPreviewTimeout = parseInt(parsedSettings.public.kurento.gUMTimeout);
        await breakoutPage3.waitAndClick(e.videoPreview, videoPreviewTimeout);
        await breakoutPage3.waitAndClick(e.startSharingWebcam);

        await breakoutPage3.screenshot(testName, '00-breakout-page03-user-joined-with-webcam-before-check');
      } else if (testName === 'joinBreakoutroomsAndShareScreen') {
        await this.page3.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: 'Moderator3' }, undefined, testName);
        await this.page3.closeAudioModal();
        await this.page3.waitAndClick(e.breakoutRoomsButton);
        await this.page3.waitAndClick(e.generateRoom1);
        await this.page3.waitAndClick(e.joinGeneratedRoom1);
        await this.page3.waitForSelector(e.alreadyConnected);
        const breakoutPage3 = await this.page3.getLastTargetPage();

        await breakoutPage3.screenshot(testName, '00-breakout-page03-user-joined-with-screenshare-before-check');
        await breakoutPage3.bringToFront();
        await breakoutPage3.closeAudioModal();

        // Take Presenter
        await breakoutPage3.waitAndClick(e.firstUser);
        await breakoutPage3.waitAndClick(e.setPresenter);

        // Start Share Screen
        await breakoutPage3.waitAndClick(e.startScreenSharing);
        await breakoutPage3.page.on('dialog', async (dialog) => {
          await dialog.accept();
        });
        await breakoutPage3.screenshot(testName, '00-breakout-page03-user-joined-with-screenshare-after-check');
      } else {
        await this.page3.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: 'Moderator3' }, undefined, testName);
        await this.page3.closeAudioModal();
      }
    } catch (err) {
      await this.page3.logger(err);
    }
  }

  // Close pages
  async close() {
    try {
      await this.page1.close();
      await this.page2.close();
    } catch (err) {
      await this.page1.logger(err);
    }
  }

  // Close page
  async closePage(page) {
    try {
      await page.close();
    } catch (err) {
      await this.page1.logger(err);
    }
  }
}

module.exports = exports = Create;
