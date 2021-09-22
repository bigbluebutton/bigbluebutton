const Page = require('../core/page');
const e = require('../core/elements');
const c = require('./constants');
const params = require('../params');
const util = require('./util');
const { VIDEO_LOADING_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME } = require('../core/constants'); // core constants (Timeouts vars imported)
const { checkElementLengthEqualTo, checkElementLengthDifferentTo } = require('../core/util');

class CustomParameters {
  constructor() {
    this.page1 = new Page();
    this.page2 = new Page();
    this.name = name;
    this.screenshotIndex = 0;
    this.parentDir = this.getParentDir(__dirname);
  }

  getParentDir(dir) {
    const tmp = dir.split('/');
    tmp.pop();
    return tmp.join('/');
  }

  async autoJoin(testName, args, meetingId, customParameter) {
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator' }, customParameter, testName);
    await this.page1.startRecording(testName);
    await this.page1.screenshot(`${testName}`, `01-${testName}`);
    await this.page1.waitForSelector(e.chatMessages);
    const resp = await this.page1.page.evaluate(checkElementLengthEqualTo, e.audioModal, 0);
    if (!resp) {
      await this.page1.screenshot(`${testName}`, `02-fail-${testName}`);
      this.page1.logger(testName, ' failed');
      return false;
    }
    await this.page1.screenshot(`${testName}`, `02-success-${testName}`);
    this.page1.logger(testName, ' passed');
    return resp === true;
  }

  async listenOnlyMode(testName, args, meetingId, customParameter) {
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator' }, customParameter, testName);
    await this.page1.startRecording(testName);
    await this.page1.waitForSelector(e.audioModal);
    await this.page1.screenshot(`${testName}`, `01-page1-${testName}`);
    const audioOptionsButton = await this.page1.page.evaluate(checkElementLengthEqualTo, e.audioOptionsButtons, 1);
    if (!audioOptionsButton) {
      await this.page1.screenshot(`${testName}`, `04-fail-${testName}`);
      this.page1.logger(testName, ' failed');
      return false;
    }
    await this.page1.screenshot(`${testName}`, `04-success-${testName}`);
    this.page1.logger(testName, ' passed');
    return true;
  }

  async forceListenOnly(testName, args, meetingId, customParameter) {
    await this.page2.init(args, meetingId, { ...params, fullName: 'Attendee', moderatorPW: '' }, customParameter, testName);
    await this.page2.startRecording(testName);
    await this.page2.screenshot(`${testName}`, `01-${testName}`);
    if (await this.page2.page.$(e.audioModalHeader)) {
      await this.page2.screenshot(`${testName}`, `02-fail-${testName}`);
      this.page2.logger(testName, ' failed');
      return false;
    }
    await this.page2.waitForSelector(e.toastContainer);
    await this.page2.screenshot(`${testName}`, `02-success-${testName}`);
    const resp = await util.forceListenOnly(this.page2);
    await this.page2.screenshot(`${testName}`, `03-success-${testName}`);
    this.page2.logger(testName, ' passed');
    return resp === true;
  }

  async skipCheck(testName, args, meetingId, customParameter) {
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator' }, customParameter, testName);
    await this.page1.startRecording(testName);
    await this.page1.screenshot(`${testName}`, `01-${testName}`);
    await this.page1.waitAndClick(e.microphoneButton);
    await this.page1.waitForSelector(e.connectingStatus);
    await this.page1.screenshot(`${testName}`, `02-${testName}`);
    await this.page1.waitForElementHandleToBeRemoved(e.connectingStatus, ELEMENT_WAIT_LONGER_TIME);
    await this.page1.screenshot(`${testName}`, `03-${testName}`);
    const resp = await this.page1.page.evaluate(checkElementLengthEqualTo, e.echoYesButton, 0);
    if (!resp) {
      await this.page1.screenshot(`${testName}`, `04-fail-${testName}`);
      this.page1.logger(testName, ' failed');
      return false;
    }
    await this.page1.screenshot(`${testName}`, `04-success-${testName}`);
    this.page1.logger(testName, ' passed');
    return resp === true;
  }

  async skipCheckOnFirstJoin(testName, args, meetingId, customParameter) {
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator' }, customParameter, testName);
    await this.page1.startRecording(testName);
    await this.page1.screenshot(`${testName}`, `01-${testName}`);
    await this.page1.waitAndClick(e.microphoneButton);
    const firstCheck = await this.page1.page.evaluate(checkElementLengthDifferentTo, e.connecting, 0);
    await this.page1.screenshot(`${testName}`, `02-${testName}`);
    await this.page1.leaveAudio();
    await this.page1.screenshot(`${testName}`, `03-${testName}`);
    await this.page1.waitAndClick(e.joinAudio);
    await this.page1.waitAndClick(e.microphoneButton);
    const secondCheck = await this.page1.page.evaluate(checkElementLengthDifferentTo, e.connectingToEchoTest, 0);

    if (firstCheck !== secondCheck) {
      await this.page1.screenshot(`${testName}`, `04-fail-${testName}`);
      this.page1.logger(testName, ' failed');
      return false;
    }
    await this.page1.screenshot(`${testName}`, `04-success-${testName}`);
    this.page1.logger(testName, ' passed');
    return true;
  }

  async clientTitle(testName, args, meetingId, customParameter) {
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator' }, customParameter, testName);
    await this.page1.startRecording(testName);
    await this.page1.screenshot(`${testName}`, `01-${testName}`);
    await this.page1.waitForSelector(e.whiteboard);
    await this.page1.screenshot(`${testName}`, `02-${testName}`);
    const resp = await (await this.page1.page.title()).includes(c.docTitle);
    if (!resp) {
      await this.page1.screenshot(`${testName}`, `03-fail-${testName}`);
      this.page1.logger(testName, ' failed');
      return false;
    }
    await this.page1.screenshot(`${testName}`, `03-success-${testName}`);
    this.page1.logger(testName, ' passed');
    return resp === true;
  }

  async askForFeedbackOnLogout(testName, args, meetingId, customParameter) {
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator' }, customParameter, testName);
    await this.page1.startRecording(testName);
    await this.page1.screenshot(`${testName}`, `01-${testName}`);
    await this.page1.closeAudioModal();
    await this.page1.screenshot(`${testName}`, `02-${testName}`);
    await this.page1.logoutFromMeeting();
    await this.page1.screenshot(`${testName}`, `03-${testName}`);
    await this.page1.waitForSelector(e.meetingEndedModal);
    await this.page1.screenshot(`${testName}`, `04-${testName}`);
    this.page1.logger('audio modal closed');
    const resp = await this.page1.page.evaluate(checkElementLengthDifferentTo, e.rating, 0);
    if (!resp) {
      await this.page1.screenshot(`${testName}`, `05-fail-${testName}`);
      this.page1.logger(testName, ' failed');
      return false;
    }
    await this.page1.screenshot(`${testName}`, `05-success-${testName}`);
    this.page1.logger(testName, ' passed');
    return resp === true;
  }

  async displayBrandingArea(testName, args, meetingId, customParameter) {
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator' }, customParameter, testName);
    await this.page1.startRecording(testName);
    await this.page1.screenshot(`${testName}`, `01-${testName}`);
    await this.page1.closeAudioModal();
    await this.page1.screenshot(`${testName}`, `02-${testName}`);
    this.page1.logger('audio modal closed');
    await this.page1.waitForSelector(e.userListContent);
    const resp = await this.page1.page.evaluate(checkElementLengthDifferentTo, e.brandingAreaLogo, 0);
    if (!resp) {
      await this.page1.screenshot(`${testName}`, `03-fail-${testName}`);
      this.page1.logger(testName, ' failed');
      return false;
    }
    await this.page1.screenshot(`${testName}`, `03-success-${testName}`);
    this.page1.logger(testName, ' passed');
    return resp === true;
  }

  async shortcuts(testName, args, meetingId, customParameter) {
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator' }, customParameter, testName);
    await this.page1.startRecording(testName);
    await this.page1.screenshot(`${testName}`, `01-${testName}`);
    await this.page1.closeAudioModal();
    await this.page1.screenshot(`${testName}`, `02-${testName}`);
    this.page1.logger('audio modal closed');
    await this.page1.waitForSelector(pe.options);
    await this.page1.page.keyboard.down('Alt');
    await this.page1.page.keyboard.press('O');
    const resp = await this.page1.page.evaluate(checkElementLengthEqualTo, e.verticalListOptions, 0);
    if (!resp) {
      await this.page1.screenshot(`${testName}`, `03-fail-${testName}`);
      this.page1.logger(testName, ' failed');
      return false;
    }
    await this.page1.screenshot(`${testName}`, `03-success-${testName}`);
    this.page1.logger(testName, ' passed');
    return resp === true;
  }

  async enableScreensharing(testName, args, meetingId, customParameter) {
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator' }, customParameter, testName);
    await this.page1.startRecording(testName);
    await this.page1.closeAudioModal();
    await this.page1.screenshot(`${testName}`, `01-${testName}`);
    const resp = await this.page1.page.evaluate(checkElementLengthEqualTo, e.startScreenSharing, 0);
    if (!resp) {
      await this.page1.screenshot(`${testName}`, `02-fail-${testName}`);
      this.page1.logger(testName, ' failed');
      return false;
    }
    await this.page1.screenshot(`${testName}`, `02-success-${testName}`);
    this.page1.logger(testName, ' passed');
    return resp === true;
  }

  async enableVideo(testName, args, meetingId, customParameter) {
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator' }, customParameter, testName);
    await this.page1.startRecording(testName);
    await this.page1.closeAudioModal();
    await this.page1.screenshot(`${testName}`, `01-${testName}`);
    const resp = await this.page1.page.evaluate(checkElementLengthEqualTo, e.joinVideo, 0);
    if (!resp) {
      await this.page1.screenshot(`${testName}`, `02-fail-${testName}`);
      this.page1.logger(testName, ' failed');
      return false;
    }
    await this.page1.screenshot(`${testName}`, `02-success-${testName}`);
    this.page1.logger(testName, ' passed');
    return resp === true;
  }

  async autoShareWebcam(testName, args, meetingId, customParameter) {
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator' }, customParameter, testName);
    await this.page1.startRecording(testName);
    await this.page1.screenshot(`${testName}`, `01-${testName}`);
    await this.page1.closeAudioModal();
    await this.page1.screenshot(`${testName}`, `02-${testName}`);
    const resp = await this.page1.page.evaluate(checkElementLengthEqualTo, e.webcamSettingsModal, 0);
    if (!resp) {
      await this.page1.screenshot(`${testName}`, `03-fail-${testName}`);
      this.page1.logger(testName, ' failed');
      return false;
    }
    await this.page1.screenshot(`${testName}`, `03-success-${testName}`);
    this.page1.logger(testName, ' passed');
    return resp === true;
  }

  async multiUserPenOnly(testName, args, meetingId, customParameter) {
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator1' }, customParameter, testName);
    await this.page1.startRecording(testName);
    await this.page2.init(args, this.page1.meetingId, { ...params, fullName: 'Moderator2' }, customParameter, testName);
    await this.page2.startRecording(testName);
    await this.page1.screenshot(`${testName}`, `01-page1-${testName}`);
    await this.page2.screenshot(`${testName}`, `01-page2-${testName}`);
    await this.page1.closeAudioModal();
    await this.page2.closeAudioModal();
    await this.page1.screenshot(`${testName}`, `02-page1-${testName}`);
    await this.page2.screenshot(`${testName}`, `02-page2-${testName}`);
    await this.page1.waitAndClick(e.multiUsersWhiteboard);
    await this.page1.screenshot(`${testName}`, `03-page1-${testName}`);
    await this.page2.waitAndClick(e.tools);
    await this.page2.screenshot(`${testName}`, `04-page2-${testName}`);
    const resp = await this.page2.page.evaluate((toolsElement) => {
      return document.querySelectorAll(toolsElement)[0].parentElement.childElementCount === 1;
    }, e.tools);
    if (!resp) {
      await this.page2.screenshot(`${testName}`, `05-page2-fail-${testName}`);
      this.page1.logger(testName, ' failed');
      return false;
    }
    await this.page2.screenshot(`${testName}`, `05-page2-success-${testName}`);
    this.page1.logger(testName, ' passed');
    return resp === true;
  }

  async presenterTools(testName, args, meetingId, customParameter) {
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator1' }, customParameter, testName);
    await this.page1.startRecording(testName);
    await this.page1.screenshot(`${testName}`, `01-${testName}`);
    await this.page1.closeAudioModal();
    await this.page1.screenshot(`${testName}`, `02-${testName}`);
    await this.page1.waitAndClick(e.tools);
    await this.page1.screenshot(`${testName}`, `03-${testName}`);
    const resp = await this.page1.page.evaluate((toolsElement, toolbarListSelector) => {
      return document.querySelectorAll(toolsElement)[0].parentElement.querySelector(toolbarListSelector).childElementCount === 2;
    }, e.tools, e.toolbarListClass);
    if (!resp) {
      await this.page1.screenshot(`${testName}`, `04-fail-${testName}`);
      this.page1.logger(testName, ' failed');
      return false;
    }
    await this.page1.screenshot(`${testName}`, `04-success-${testName}`);
    this.page1.logger(testName, ' passed');
    return resp === true;
  }

  async multiUserTools(testName, args, meetingId, customParameter) {
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator1' }, customParameter, testName);
    await this.page1.startRecording(testName);
    await this.page2.init(args, this.page1.meetingId, { ...params, fullName: 'Moderator2' }, customParameter, testName);
    await this.page2.startRecording(testName);
    await this.page1.screenshot(`${testName}`, `01-page1-${testName}`);
    await this.page2.screenshot(`${testName}`, `01-page2-${testName}`);
    await this.page1.closeAudioModal();
    await this.page2.closeAudioModal();
    await this.page1.screenshot(`${testName}`, `02-page1-${testName}`);
    await this.page2.screenshot(`${testName}`, `02-page2-${testName}`);
    await this.page1.waitAndClick(e.multiUsersWhiteboard);
    await this.page1.screenshot(`${testName}`, `03-page1-${testName}`);
    await this.page2.waitAndClick(e.tools);
    await this.page2.screenshot(`${testName}`, `04-page2-${testName}`);
    const resp = await this.page2.page.evaluate((toolsElement, toolbarListSelector) => {
      return document.querySelectorAll(toolsElement)[0].parentElement.querySelector(toolbarListSelector).childElementCount === 2;
    }, e.tools, e.toolbarListClass);
    if (!resp) {
      await this.page2.screenshot(`${testName}`, `05-page2-fail-${testName}`);
      this.page1.logger(testName, ' failed');
      return false;
    }
    await this.page2.screenshot(`${testName}`, `05-page2-success-${testName}`);
    this.page1.logger(testName, ' passed');
    return resp === true;
  }

  async customStyle(testName, args, meetingId, customParameter) {
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator1' }, customParameter, testName);
    await this.page1.startRecording(testName);
    await this.page1.screenshot(`${testName}`, `01-${testName}`);
    await this.page1.closeAudioModal();
    await this.page1.waitForSelector(e.whiteboard);
    await this.page1.screenshot(`${testName}`, `02-${testName}`);
    const isHidden = await this.page1.page.$eval(e.presentationTitle, elem => elem.offsetHeight == 0);
    if (isHidden !== true) {
      await this.page1.screenshot(`${testName}`, `03-fail-${testName}`);
      this.page1.logger(testName, ' failed');
      return false;
    }
    await this.page1.screenshot(`${testName}`, `03-success-${testName}`);
    const resp = isHidden;
    this.page1.logger(testName, ' passed');
    return resp === true;
  }

  async customStyleUrl(testName, args, meetingId, customParameter) {
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator1' }, customParameter, testName);
    await this.page1.startRecording(testName);
    await this.page1.screenshot(`${testName}`, `01-${testName}`);
    await this.page1.closeAudioModal();
    await this.page1.waitForSelector(e.whiteboard);
    await this.page1.screenshot(`${testName}`, `02-${testName}`);
    const isHidden = await this.page1.page.$eval(e.presentationTitle, elem => elem.offsetHeight == 0);
    if (isHidden !== true) {
      await this.page1.screenshot(`${testName}`, `03-fail-${testName}`);
      this.page1.logger(testName, ' failed');
      return false;
    }
    await this.page1.screenshot(`${testName}`, `03-success-${testName}`);
    const resp = isHidden;
    this.page1.logger(testName, ' passed');
    return resp === true;
  }

  async autoSwapLayout(testName, args, meetingId, customParameter) {
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator1' }, customParameter, testName);
    await this.page1.startRecording(testName);
    await this.page1.screenshot(`${testName}`, `01-${testName}`);
    await this.page1.closeAudioModal();
    await this.page1.waitForSelector(e.actions);
    await this.page1.screenshot(`${testName}`, `02-${testName}`);
    const isNotHidden = await this.page1.page.$eval(e.restorePresentation, elem => elem.offsetHeight !== 0);
    if (isNotHidden !== true) {
      await this.page1.screenshot(`${testName}`, `03-fail-${testName}`);
      this.page1.logger(testName, ' failed');
      return false;
    }
    await this.page1.screenshot(`${testName}`, `03-success-${testName}`);
    const resp = isNotHidden;
    this.page1.logger(testName, ' passed');
    return resp === true;
  }

  async hidePresentation(testName, args, meetingId, customParameter) {
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator1' }, customParameter, testName);
    await this.page1.startRecording(testName);
    await this.page1.screenshot(`${testName}`, `01-${testName}`);
    await this.page1.closeAudioModal();
    await this.page1.waitForSelector(e.actions);
    await this.page1.screenshot(`${testName}`, `02-${testName}`);
    const resp = await this.page1.page.evaluate(checkElementLengthDifferentTo, e.defaultContent, 0);
    if (!resp) {
      await this.page1.screenshot(`${testName}`, `03-fail-${testName}`);
      this.page1.logger(testName, ' failed');
      return false;
    }
    await this.page1.screenshot(`${testName}`, `03-success-${testName}`);
    this.page1.logger(testName, ' passed');
    return resp === true;
  }

  async bannerText(testName, args, meetingId, customParameter) {
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator1' }, customParameter, testName);
    await this.page1.startRecording(testName);
    await this.page1.screenshot(`${testName}`, `01-${testName}`);
    await this.page1.closeAudioModal();
    await this.page1.waitForSelector(e.actions);
    await this.page1.screenshot(`${testName}`, `02-${testName}`);
    const resp = await this.page1.page.evaluate(checkElementLengthDifferentTo, e.notificationBar, 0);
    if (!resp) {
      await this.page1.screenshot(`${testName}`, `03-fail-${testName}`);
      this.page1.logger(testName, ' failed');
      return false;
    }
    await this.page1.screenshot(`${testName}`, `03-success-${testName}`);
    this.page1.logger(testName, ' passed');
    return resp === true;
  }

  async bannerColor(testName, args, meetingId, customParameter, colorToRGB) {
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator1' }, customParameter, testName);
    await this.page1.startRecording(testName);
    await this.page1.screenshot(`${testName}`, `01-${testName}`);
    await this.page1.closeAudioModal();
    await this.page1.waitForSelector(e.notificationBar);
    await this.page1.screenshot(`${testName}`, `02-${testName}`);
    const notificationBarColor = await this.page1.page.$eval(e.notificationBar, elem => getComputedStyle(elem).backgroundColor);
    if (notificationBarColor !== colorToRGB) {
      await this.page1.screenshot(`${testName}`, `03-fail-${testName}`);
      this.page1.logger(testName, ' failed');
      return false;
    }
    await this.page1.screenshot(`${testName}`, `03-success-${testName}`);
    this.page1.logger(testName, ' passed');
    return true;
  }

  async hideAndSwapPresentation(testName, args, meetingId, customParameter) {
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator1' }, customParameter, testName);
    await this.page1.startRecording(testName);
    await this.page1.screenshot(`${testName}`, `01-${testName}`);
    await this.page1.closeAudioModal();
    await this.page1.waitForSelector(pe.actions);
    const resp = await this.page1.page.evaluate(checkElementLengthDifferentTo, e.restorePresentation, 0) && await this.page1.page.evaluate(checkElementLengthDifferentTo, e.defaultContent, 0);
    if (!resp) {
      await this.page1.screenshot(`${testName}`, `03-fail-${testName}`);
      this.page1.logger(testName, ' failed');
      return false;
    }
    await this.page1.screenshot(`${testName}`, `03-success-${testName}`);
    this.page1.logger(testName, ' passed');
    return resp === true;
  }

  async showPublicChatOnLogin(testName, args, meetingId, customParameter) {
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator1' }, customParameter, testName);
    await this.page1.startRecording(testName);
    await this.page1.screenshot(`${testName}`, `01-${testName}`);
    await this.page1.closeAudioModal();
    await this.page1.waitForSelector(e.actions);
    const resp = await this.page1.page.evaluate(checkElementLengthEqualTo, e.chat, 0);
    if (!resp) {
      await this.page1.screenshot(`${testName}`, `03-fail-${testName}`);
      this.page1.logger(testName, ' failed');
      return false;
    }
    await this.page1.screenshot(`${testName}`, `03-success-${testName}`);
    this.page1.logger(testName, ' passed');
    return resp === true;
  }

  async forceRestorePresentationOnNewEvents(testName, args, meetingId, customParameter) {
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator1' }, customParameter, testName);
    await this.page1.startRecording(testName);
    await this.page2.init(args, this.page1.meetingId, { ...params, fullName: 'Viewer1', moderatorPW: '' }, customParameter, testName);
    await this.page2.startRecording(testName);
    await this.page1.screenshot(`${testName}`, `01-page1-${testName}`);
    await this.page2.screenshot(`${testName}`, `01-page2-${testName}`);
    await this.page1.closeAudioModal();
    await this.page1.screenshot(`${testName}`, `02-page1-${testName}`);
    await this.page2.closeAudioModal();
    await this.page2.screenshot(`${testName}`, `02-page2-${testName}`);
    await this.page2.waitAndClick(e.hidePresentation);
    await this.page2.screenshot(`${testName}`, `03-page2-${testName}`);
    const zoomInCase = await util.zoomIn(this.page1);
    await this.page1.screenshot(`${testName}`, `03-page1-${testName}`);
    await this.page2.screenshot(`${testName}`, `04-page2-${testName}`);
    const zoomOutCase = await util.zoomOut(this.page1);
    await this.page1.screenshot(`${testName}`, `03-page1-${testName}`);
    await this.page2.screenshot(`${testName}`, `04-page2-${testName}`);
    const pollCase = await util.poll(this.page1, this.page2);
    await this.page1.screenshot(`${testName}`, `03-page1-${testName}`);
    await this.page2.screenshot(`${testName}`, `04-page2-${testName}`);
    const previousSlideCase = await util.previousSlide(this.page1);
    await this.page1.screenshot(`${testName}`, `04-page1-${testName}`);
    await this.page2.screenshot(`${testName}`, `05-page2-${testName}`);
    const nextSlideCase = await util.nextSlide(this.page1);
    await this.page1.screenshot(`${testName}`, `05-page1-${testName}`);
    await this.page2.screenshot(`${testName}`, `06-page2-${testName}`);
    const annotationCase = await util.annotation(this.page1);
    await this.page1.screenshot(`${testName}`, `06-page1-${testName}`);
    await this.page2.screenshot(`${testName}`, `07-page2-${testName}`);

    const test = await this.page2.page.evaluate(checkElementLengthDifferentTo, e.restorePresentation, 0);
    const resp = (zoomInCase && zoomOutCase && pollCase && previousSlideCase && nextSlideCase && annotationCase && test);
    if (resp) {
      await this.page2.screenshot(`${testName}`, `08-page2-fail-${testName}`);
      this.page1.logger(testName, ' failed');
      return false;
    }
    await this.page2.page.evaluate(checkElementLengthEqualTo, e.restorePresentation, 0);
    await this.page2.screenshot(`${testName}`, `08-page2-success-${testName}`);
    this.page1.logger(testName, ' passed');
    return true;
  }

  async forceRestorePresentationOnNewPollResult(args, meetingId, customParameter, testName) {
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator1' }, customParameter, testName);
    await this.page2.init(args, this.page1.meetingId, { ...params, fullName: 'Viewer1', moderatorPW: '' }, customParameter, testName);
    await this.page2.startRecording(testName);
    await this.page1.screenshot(`${testName}`, `01-page1-${testName}`);
    await this.page2.screenshot(`${testName}`, `01-page2-${testName}`);
    await this.page1.closeAudioModal();
    await this.page1.screenshot(`${testName}`, `02-page1-${testName}`);
    await this.page2.closeAudioModal();
    await this.page2.screenshot(`${testName}`, `02-page2-${testName}`);
    await this.page2.waitAndClick(e.hidePresentation);
    await this.page2.screenshot(`${testName}`, `03-page2-${testName}`);
    const pollCase = await util.poll(this.page1, this.page2) === true;
    await this.page2.waitForSelector(e.smallToastMsg);
    await this.page1.screenshot(`${testName}`, `03-page1-${testName}`);
    await this.page2.screenshot(`${testName}`, `04-page2-${testName}`);

    const test = await this.page2.page.evaluate(checkElementLengthDifferentTo, e.restorePresentation, 0);
    if (pollCase && test) {
      await this.page2.screenshot(`${testName}`, `05-page2-fail-${testName}`);
      await this.page1.logger(testName, ' failed');
      return false;
    }
    await this.page2.screenshot(`${testName}`, `05-page2-success-${testName}`);
    await this.page1.logger(testName, ' passed');
    return true;
  }

  async recordMeeting(testName, args, meetingId, customParameter) {
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator' }, customParameter, testName);
    await this.page1.startRecording(testName);
    await this.page1.closeAudioModal();
    await this.page1.screenshot(`${testName}`, `01-${testName}`);
    const resp = await this.page1.page.evaluate(checkElementLengthEqualTo, e.recordingIndicator, 0);
    if (!resp) {
      await this.page1.screenshot(`${testName}`, `02-fail-${testName}`);
      this.page1.logger(testName, ' failed');
      return false;
    }
    await this.page1.screenshot(`${testName}`, `02-success-${testName}`);
    this.page1.logger(testName, ' passed');
    return resp === true;
  }

  async skipVideoPreview(testName, args, meetingId, customParameter) {
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator' }, customParameter, testName);
    await this.page1.startRecording(testName);
    await this.page1.screenshot(`${testName}`, `01-${testName}`);
    await this.page1.closeAudioModal();
    await this.page1.screenshot(`${testName}`, `02-${testName}`);
    await this.page1.waitAndClick(e.joinVideo);
    const resp = await this.page1.page.evaluate(checkElementLengthEqualTo, e.webcamSettingsModal, 0);
    if (!resp) {
      await this.page1.screenshot(`${testName}`, `03-fail-${testName}`);
      this.page1.logger(testName, ' failed');
      return false;
    }
    await this.page1.screenshot(`${testName}`, `03-success-${testName}`);
    this.page1.logger(testName, ' passed');
    return resp === true;
  }

  async skipVideoPreviewOnFirstJoin(testName, args, meetingId, customParameter) {
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator' }, customParameter, testName);
    await this.page1.startRecording(testName);
    await this.page1.screenshot(`${testName}`, `01-${testName}`);
    await this.page1.closeAudioModal();
    await this.page1.screenshot(`${testName}`, `02-${testName}`);
    await this.page1.waitAndClick(e.joinVideo);
    const firstCheck = await this.page1.page.evaluate(checkElementLengthEqualTo, e.webcamSettingsModal, 0);
    await this.page1.waitAndClick(e.leaveVideo, VIDEO_LOADING_WAIT_TIME);
    await this.page1.waitForElementHandleToBeRemoved(e.webcamVideo), ELEMENT_WAIT_LONGER_TIME;
    await this.page1.waitForElementHandleToBeRemoved(e.leaveVideo, ELEMENT_WAIT_LONGER_TIME);

    await this.page1.waitAndClick(e.joinVideo);
    const parsedSettings = await this.page1.getSettingsYaml();
    const videoPreviewTimeout = parseInt(parsedSettings.public.kurento.gUMTimeout);
    await this.page1.waitForSelector(e.videoPreview, videoPreviewTimeout);
    await this.page1.waitForSelector(e.startSharingWebcam);
    const secondCheck = await this.page1.page.evaluate(checkElementLengthDifferentTo, e.webcamSettingsModal, 0);
    await this.page1.waitAndClick(e.startSharingWebcam);
    await this.page1.waitForSelector(e.webcamConnecting);

    if (firstCheck !== secondCheck) {
      await this.page1.screenshot(`${testName}`, `03-fail-${testName}`);
      this.page1.logger(testName, ' failed');
      return false;
    }
    await this.page1.screenshot(`${testName}`, `03-success-${testName}`);
    this.page1.logger(testName, ' passed');
    return true;
  }

  async mirrorOwnWebcam(testName, args, meetingId, customParameter) {
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator' }, customParameter, testName);
    await this.page1.startRecording(testName);
    await this.page1.screenshot(`${testName}`, `01-${testName}`);
    await this.page1.closeAudioModal();
    await this.page1.screenshot(`${testName}`, `02-${testName}`);
    await this.page1.waitAndClick(e.joinVideo);
    await this.page1.waitForSelector(e.webcamMirroredVideoPreview);
    await this.page1.waitAndClick(e.startSharingWebcam);
    const resp = await this.page1.page.evaluate(checkElementLengthDifferentTo, e.webcamMirroredVideoContainer, 0);
    if (!resp) {
      await this.page1.screenshot(`${testName}`, `03-fail-${testName}`);
      this.page1.logger(testName, ' failed');
      return false;
    }
    await this.page1.screenshot(`${testName}`, `03-success-${testName}`);
    this.page1.logger(testName, ' passed');
    return resp === true;
  }

  async showParticipantsOnLogin(testName, args, meetingId, customParameter) {
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator' }, customParameter, testName);
    await this.page1.startRecording(testName);
    await this.page1.screenshot(`${testName}`, `01-${testName}`);
    await this.page1.closeAudioModal();
    await this.page1.screenshot(`${testName}`, `02-${testName}`);
    await this.page1.waitForSelector(e.whiteboard);
    const resp = await this.page1.page.evaluate(checkElementLengthEqualTo, e.userslistContainer, 0);
    if (!resp) {
      await this.page1.screenshot(`${testName}`, `03-fail-${testName}`);
      this.page1.logger(testName, ' failed');
      return false;
    }
    await this.page1.screenshot(`${testName}`, `03-success-${testName}`);
    this.page1.logger(testName, ' passed');
    return resp === true;
  }

  async closePage(page) {
    page.close();
  }

  async close(page1, page2) {
    page1.close();
    page2.close();
  }
}

module.exports = exports = CustomParameters;
