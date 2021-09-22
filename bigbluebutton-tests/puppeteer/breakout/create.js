const moment = require('moment');
const path = require('path');
const Page = require('../core/page');
const params = require('../params');
const e = require('../core/elements');
const { checkElement } = require('../core/util');
const { ELEMENT_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');

const today = moment().format('DD-MM-YYYY');

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
      await this.page1.screenshot(`${testName}`, `01-page01-initialized-${testName}`);
      await this.page2.screenshot(`${testName}`, `01-page02-initialized-${testName}`);

      await this.page1.waitAndClick(e.manageUsers);
      await this.page1.waitAndClick(e.createBreakoutRooms);
      await this.page1.screenshot(`${testName}`, `02-page01-creating-breakoutrooms-${testName}`);

      await this.page1.waitAndClick(e.randomlyAssign);
      await this.page1.screenshot(`${testName}`, `03-page01-randomly-assign-user-${testName}`);

      await this.page1.waitAndClick(e.modalConfirmButton, ELEMENT_WAIT_LONGER_TIME);
      await this.page1.screenshot(`${testName}`, `04-page01-confirm-breakoutrooms-creation-${testName}`);

      await this.page2.waitAndClick(e.modalConfirmButton, ELEMENT_WAIT_LONGER_TIME);
      await this.page2.screenshot(`${testName}`, `02-page02-accept-invite-breakoutrooms-${testName}`);

      await this.page2.page.bringToFront();
      await this.page2.waitAndClick(e.chatButton);
      await this.page2.waitAndClick(e.breakoutRoomsItem);
      await this.page2.waitForSelector(e.alreadyConnected, ELEMENT_WAIT_LONGER_TIME);
      const page2 = await this.page2.browser.pages();
      await page2[2].bringToFront();
      if (process.env.GENERATE_EVIDENCES === 'true') {
        await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/03-breakout-page02-before-closing-audio-modal.png`) });
      }
      await page2[2].waitForSelector(e.closeAudioButton, { timeout: ELEMENT_WAIT_TIME });
      await page2[2].click(e.closeAudioButton);
      if (process.env.GENERATE_EVIDENCES === 'true') {
        await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/04-breakout-page02-after-closing-audio-modal.png`) });
      }
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

        await this.page3.waitAndClick(e.joinRoom1);
        // wait to generate URL and click again to join
        await this.page3.waitAndClick(e.joinRoom1);
        await this.page3.waitForSelector(e.alreadyConnected, ELEMENT_WAIT_LONGER_TIME);

        const page3 = await this.page3.browser.pages();

        if (process.env.GENERATE_EVIDENCES === 'true') {
          await page3[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/00-breakout-page03-user-joined-no-mic-before-check-${testName}.png`) });
        }
        await page3[2].bringToFront();
        await page3[2].waitForSelector(e.microphoneButton, { timeout: ELEMENT_WAIT_TIME });
        await page3[2].click(e.microphoneButton);
        await page3[2].waitForSelector(e.connectingStatus, { timeout: ELEMENT_WAIT_TIME });
        const parsedSettings = await this.page1.getSettingsYaml();
        const listenOnlyCallTimeout = parseInt(parsedSettings.public.media.listenOnlyCallTimeout);
        await page3[2].waitForSelector(e.echoYesButton, { timeout: listenOnlyCallTimeout });
        await page3[2].click(e.echoYesButton);
        await page3[2].waitForSelector(e.whiteboard, { timeout: ELEMENT_WAIT_TIME });

        if (process.env.GENERATE_EVIDENCES === 'true') {
          await page3[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/00-breakout-page03-user-joined-with-mic-before-check-${testName}.png`) });
        }
      } else if (testName === 'joinBreakoutroomsWithVideo') {
        await this.page3.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: 'Moderator3' }, undefined, testName);
        await this.page3.closeAudioModal();
        await this.page3.waitAndClick(e.breakoutRoomsButton);
        await this.page3.waitAndClick(e.joinRoom1);
        // wait to generate URL and click again to join
        await this.page3.waitAndClick(e.joinRoom1);
        await this.page3.waitForSelector(e.alreadyConnected);

        const page3 = await this.page3.browser.pages();

        if (process.env.GENERATE_EVIDENCES === 'true') {
          await page3[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/00-breakout-page03-user-joined-no-webcam-before-check-${testName}.png`) });
        }
        await page3[2].bringToFront();
        await page3[2].waitForSelector(e.audioModal, { timeout: ELEMENT_WAIT_TIME });
        await page3[2].waitForSelector(e.closeAudioButton, { timeout: ELEMENT_WAIT_TIME });
        await page3[2].click(e.closeAudioButton);
        await page3[2].waitForSelector(e.joinVideo, { timeout: ELEMENT_WAIT_TIME });
        await page3[2].click(e.joinVideo);
        const parsedSettings = await this.page3.getSettingsYaml();
        const videoPreviewTimeout = parseInt(parsedSettings.public.kurento.gUMTimeout);
        await page3[2].waitForSelector(e.videoPreview, { timeout: videoPreviewTimeout });
        await page3[2].click(e.videoPreview);
        await page3[2].waitForSelector(e.startSharingWebcam, { timeout: ELEMENT_WAIT_TIME });
        await page3[2].click(e.startSharingWebcam);
        if (process.env.GENERATE_EVIDENCES === 'true') {
          await page3[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/00-breakout-page03-user-joined-with-webcam-before-check-${testName}.png`) });
        }
      } else if (testName === 'joinBreakoutroomsAndShareScreen') {
        await this.page3.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: 'Moderator3' }, undefined, testName);
        await this.page3.closeAudioModal();
        await this.page3.waitAndClick(e.breakoutRoomsButton);
        await this.page3.waitAndClick(e.joinRoom1);
        // wait to generate URL and click again to join
        await this.page3.waitAndClick(e.joinRoom1);
        await this.page3.waitForSelector(e.alreadyConnected);
        const page3 = await this.page3.browser.pages();

        if (process.env.GENERATE_EVIDENCES === 'true') {
          await page3[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/00-breakout-page03-user-joined-with-screenshare-before-check-${testName}.png`) });
        }
        await page3[2].bringToFront();
        await page3[2].waitForSelector(e.audioModal, { timeout: ELEMENT_WAIT_TIME });
        await page3[2].waitForSelector(e.closeAudioButton, { timeout: ELEMENT_WAIT_TIME });
        await page3[2].click(e.closeAudioButton);

        // Take Presenter
        await page3[2].waitForSelector(e.firstUser, { timeout: ELEMENT_WAIT_TIME });
        await page3[2].click(e.firstUser);
        await page3[2].waitForSelector(e.setPresenter, { timeout: ELEMENT_WAIT_TIME });
        await page3[2].click(e.setPresenter);

        // Start Share Screen
        await page3[2].waitForSelector(e.startScreenSharing, { timeout: ELEMENT_WAIT_TIME });
        await page3[2].click(e.startScreenSharing);
        await page3[2].on('dialog', async (dialog) => {
          await dialog.accept();
        });
        if (process.env.GENERATE_EVIDENCES === 'true') {
          await page3[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/00-breakout-page03-user-joined-with-screenshare-after-check-${testName}.png`) });
        }
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
