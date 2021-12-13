const Page = require('../core/page');
const e = require('../core/elements');
const c = require('./constants');
const util = require('./util');
const { VIDEO_LOADING_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME } = require('../core/constants'); // core constants (Timeouts vars imported)
const { checkElementLengthEqualTo, checkElement } = require('../core/util');

class CustomParameters {
  constructor() {
    this.page1 = new Page();
    this.page2 = new Page();
    this.screenshotIndex = 0;
    this.parentDir = this.getParentDir(__dirname);
  }

  getParentDir(dir) {
    const tmp = dir.split('/');
    tmp.pop();
    return tmp.join('/');
  }

  async autoJoin(testName, customParameter) {
    try {
      await this.page1.init(true, false, testName, 'Moderator', undefined, customParameter);
      await this.page1.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-${testName}`);
      await this.page1.waitForSelector(e.chatMessages);
      const resp = await this.page1.wasRemoved(e.audioModal);
      if (!resp) {
        await this.page1.screenshot(`${testName}`, `02-fail-${testName}`);
        await this.page1.logger(testName, ' failed');
        return false;
      }
      await this.page1.screenshot(`${testName}`, `02-success-${testName}`);
      await this.page1.logger(testName, ' passed');

      return resp === true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async listenOnlyMode(testName, customParameter) {
    try {
      await this.page1.init(true, false, testName, 'Moderator', undefined, customParameter);
      await this.page1.startRecording(testName);
      await this.page1.waitForSelector(e.audioModal);
      await this.page1.screenshot(`${testName}`, `01-page1-${testName}`);
      const audioOptionsButton = await this.page1.page.evaluate(checkElementLengthEqualTo, e.audioOptionsButtons, 1);
      if (!audioOptionsButton) {
        await this.page1.screenshot(`${testName}`, `04-fail-${testName}`);
        await this.page1.logger(testName, ' failed');
        return false;
      }
      await this.page1.screenshot(`${testName}`, `04-success-${testName}`);
      await this.page1.logger(testName, ' passed');

      return true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async forceListenOnly(testName, customParameter) {
    try {
      await this.page2.init(false, false, testName, 'Attendee', undefined, customParameter);
      await this.page2.startRecording(testName);
      await this.page2.screenshot(`${testName}`, `01-${testName}`);
      if (await this.page2.page.$(e.audioModalHeader)) {
        await this.page2.screenshot(`${testName}`, `02-fail-${testName}`);
        await this.page2.logger(testName, ' failed');
        return false;
      }
      await this.page2.waitForSelector(e.toastContainer);
      await this.page2.screenshot(`${testName}`, `02-success-${testName}`);
      const resp = await util.forceListenOnly(this.page2);
      await this.page2.screenshot(`${testName}`, `03-success-${testName}`);
      await this.page2.logger(testName, ' passed');

      return resp === true;
    } catch (err) {
      await this.page2.logger(err);
      return false;
    }
  }

  async skipCheck(testName, customParameter) {
    try {
      await this.page1.init(false, false, testName, 'Attendee', undefined, customParameter);
      await this.page1.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-${testName}`);
      await this.page1.waitAndClick(e.microphoneButton);
      await this.page1.waitForSelector(e.connectingStatus);
      await this.page1.screenshot(`${testName}`, `02-${testName}`);
      await this.page1.waitForElementHandleToBeRemoved(e.connectingStatus, ELEMENT_WAIT_LONGER_TIME);
      await this.page1.screenshot(`${testName}`, `03-${testName}`);
      const resp = await this.page1.wasRemoved(e.echoYesButton);
      if (!resp) {
        await this.page1.screenshot(`${testName}`, `04-fail-${testName}`);
        await this.page1.logger(testName, ' failed');
        return false;
      }
      await this.page1.screenshot(`${testName}`, `04-success-${testName}`);
      await this.page1.logger(testName, ' passed');

      return resp === true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async skipCheckOnFirstJoin(testName, customParameter) {
    try {
      await this.page1.init(true, false, testName, 'Moderator', undefined, customParameter);
      await this.page1.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-${testName}`);
      await this.page1.waitAndClick(e.microphoneButton);
      const firstCheck = await this.page1.hasElement(e.connecting);
      await this.page1.screenshot(`${testName}`, `02-${testName}`);
      await this.page1.leaveAudio();
      await this.page1.screenshot(`${testName}`, `03-${testName}`);
      await this.page1.waitAndClick(e.joinAudio);
      await this.page1.waitAndClick(e.microphoneButton);
      const secondCheck = await this.page1.hasElement(e.connectingToEchoTest);

      if (firstCheck !== secondCheck) {
        await this.page1.screenshot(`${testName}`, `04-fail-${testName}`);
        await this.page1.logger(testName, ' failed');
        return false;
      }
      await this.page1.screenshot(`${testName}`, `04-success-${testName}`);
      await this.page1.logger(testName, ' passed');

      return true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async clientTitle(testName, customParameter) {
    try {
      await this.page1.init(true, true, testName, 'Moderator', undefined, customParameter);
      await this.page1.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-${testName}`);
      await this.page1.waitForSelector(e.whiteboard);
      await this.page1.screenshot(`${testName}`, `02-${testName}`);
      const resp = await (await this.page1.page.title()).includes(c.docTitle);
      if (!resp) {
        await this.page1.screenshot(`${testName}`, `03-fail-${testName}`);
        await this.page1.logger(testName, ' failed');
        return false;
      }
      await this.page1.screenshot(`${testName}`, `03-success-${testName}`);
      await this.page1.logger(testName, ' passed');

      return resp === true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async askForFeedbackOnLogout(testName, customParameter) {
    try {
      await this.page1.init(true, true, testName, 'Moderator', undefined, customParameter);
      await this.page1.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-${testName}`);
      await this.page1.screenshot(`${testName}`, `02-${testName}`);
      await this.page1.logoutFromMeeting();
      await this.page1.screenshot(`${testName}`, `03-${testName}`);
      await this.page1.waitForSelector(e.meetingEndedModal);
      await this.page1.screenshot(`${testName}`, `04-${testName}`);
      await this.page1.logger('audio modal closed');
      const resp = await this.page1.hasElement(e.rating);
      if (!resp) {
        await this.page1.screenshot(`${testName}`, `05-fail-${testName}`);
        await this.page1.logger(testName, ' failed');
        return false;
      }
      await this.page1.screenshot(`${testName}`, `05-success-${testName}`);
      await this.page1.logger(testName, ' passed');

      return resp === true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async displayBrandingArea(testName, customParameter) {
    try {
      await this.page1.init(true, true, testName, 'Moderator', undefined, customParameter);
      await this.page1.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-${testName}`);
      await this.page1.screenshot(`${testName}`, `02-${testName}`);
      await this.page1.logger('audio modal closed');
      await this.page1.waitForSelector(e.userListContent);
      const resp = await this.page1.hasElement(e.brandingAreaLogo);
      if (!resp) {
        await this.page1.screenshot(`${testName}`, `03-fail-${testName}`);
        await this.page1.logger(testName, ' failed');
        return false;
      }
      await this.page1.screenshot(`${testName}`, `03-success-${testName}`);
      await this.page1.logger(testName, ' passed');

      return resp === true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async shortcuts(testName, customParameter) {
    try {
      await this.page1.init(true, true, testName, 'Moderator', undefined, customParameter);
      await this.page2.init(false, true, testName, 'Attendee', this.page1.meetingId);
      await this.page1.startRecording(testName);
      await this.page1.screenshot(`${testName}`, '01-after-close-audio-modal');

      // Check the initial shortcuts that can be used right after joining the meeting
      const check1 = await util.checkShortcutsArray(this.page1, c.initialShortcuts);
      if (!check1) return false;
      await this.page1.bringToFront();

      // Join audio
      await this.page1.waitAndClick(e.joinAudio);
      await this.page1.joinMicrophone();
      await this.page1.screenshot(`${testName}`, '02-after-join-audio');

      // Open private chat
      await this.page1.waitAndClick(e.userListItem);
      await this.page1.waitAndClick(e.activeChat);
      await this.page1.waitForSelector(e.hidePrivateChat);
      await this.page1.screenshot(`${testName}`, '03-after-open-private-chat');

      // Check the later shortcuts that can be used after joining audio and opening private chat
      const check2 = await util.checkShortcutsArray(this.page1, c.laterShortcuts);

      return check2 === true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async enableScreensharing(testName, customParameter) {
    try {
      await this.page1.init(true, true, testName, 'Moderator', undefined, customParameter);
      await this.page1.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-${testName}`);
      const resp = await this.page1.wasRemoved(e.startScreenSharing);
      if (!resp) {
        await this.page1.screenshot(`${testName}`, `02-fail-${testName}`);
        await this.page1.logger(testName, ' failed');
        return false;
      }
      await this.page1.screenshot(`${testName}`, `02-success-${testName}`);
      await this.page1.logger(testName, ' passed');

      return resp === true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async enableVideo(testName, customParameter) {
    try {
      await this.page1.init(true, true, testName, 'Moderator', undefined, customParameter);
      await this.page1.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-${testName}`);
      const resp = await this.page1.wasRemoved(e.joinVideo);
      if (!resp) {
        await this.page1.screenshot(`${testName}`, `02-fail-${testName}`);
        await this.page1.logger(testName, ' failed');
        return false;
      }
      await this.page1.screenshot(`${testName}`, `02-success-${testName}`);
      await this.page1.logger(testName, ' passed');

      return resp === true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async autoShareWebcam(testName, customParameter) {
    try {
      await this.page1.init(true, true, testName, 'Moderator', undefined, customParameter);
      await this.page1.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-${testName}`);
      await this.page1.screenshot(`${testName}`, `02-${testName}`);
      const resp = await this.page1.hasElement(e.webcamSettingsModal);
      if (!resp) {
        await this.page1.screenshot(`${testName}`, `03-fail-${testName}`);
        await this.page1.logger(testName, ' failed');
        return false;
      }
      await this.page1.screenshot(`${testName}`, `03-success-${testName}`);
      await this.page1.logger(testName, ' passed');

      return resp === true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async multiUserPenOnly(testName, customParameter) {
    try {
      await this.page1.init(true, true, testName, 'Moderator1', undefined, customParameter);
      await this.page1.startRecording(testName);
      await this.page2.init(true, true, testName, 'Moderator2', this.page1.meetingId, customParameter);
      await this.page2.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-page1-${testName}`);
      await this.page2.screenshot(`${testName}`, `01-page2-${testName}`);
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
        await this.page1.logger(testName, ' failed');
        return false;
      }
      await this.page2.screenshot(`${testName}`, `05-page2-success-${testName}`);
      await this.page1.logger(testName, ' passed');

      return resp === true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async presenterTools(testName, customParameter) {
    try {
      await this.page1.init(true, true, testName, 'Moderator1', undefined, customParameter);
      await this.page1.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-${testName}`);
      await this.page1.screenshot(`${testName}`, `02-${testName}`);
      await this.page1.waitAndClick(e.tools);
      await this.page1.screenshot(`${testName}`, `03-${testName}`);
      const resp = await this.page1.page.evaluate((toolsElement, toolbarListSelector) => {
        return document.querySelectorAll(toolsElement)[0].parentElement.querySelector(toolbarListSelector).childElementCount === 2;
      }, e.tools, e.toolbarListClass);
      if (!resp) {
        await this.page1.screenshot(`${testName}`, `04-fail-${testName}`);
        await this.page1.logger(testName, ' failed');
        return false;
      }
      await this.page1.screenshot(`${testName}`, `04-success-${testName}`);
      await this.page1.logger(testName, ' passed');

      return resp === true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async multiUserTools(testName, customParameter) {
    try {
      await this.page1.init(true, true, testName, 'Moderator1', undefined, customParameter);
      await this.page1.startRecording(testName);
      await this.page2.init(true, true, testName, 'Moderator2', this.page1.meetingId, customParameter);
      await this.page2.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-page1-${testName}`);
      await this.page2.screenshot(`${testName}`, `01-page2-${testName}`);
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
        await this.page1.logger(testName, ' failed');
        return false;
      }
      await this.page2.screenshot(`${testName}`, `05-page2-success-${testName}`);
      await this.page1.logger(testName, ' passed');

      return resp === true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async customStyle(testName, customParameter) {
    try {
      await this.page1.init(true, true, testName, 'Moderator1', undefined, customParameter);
      await this.page1.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-${testName}`);
      await this.page1.waitForSelector(e.whiteboard);
      await this.page1.screenshot(`${testName}`, `02-${testName}`);
      const isHidden = await this.page1.page.$eval(e.presentationTitle, elem => elem.offsetHeight == 0);
      if (isHidden !== true) {
        await this.page1.screenshot(`${testName}`, `03-fail-${testName}`);
        await this.page1.logger(testName, ' failed');
        return false;
      }
      await this.page1.screenshot(`${testName}`, `03-success-${testName}`);
      const resp = isHidden;
      await this.page1.logger(testName, ' passed');

      return resp === true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async autoSwapLayout(testName, customParameter) {
    try {
      await this.page1.init(true, true, testName, 'Moderator1', undefined, customParameter);
      await this.page1.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-${testName}`);
      await this.page1.waitForSelector(e.actions);
      await this.page1.screenshot(`${testName}`, `02-${testName}`);
      const isNotHidden = await this.page1.page.$eval(e.restorePresentation, elem => elem.offsetHeight !== 0);
      if (isNotHidden !== true) {
        await this.page1.screenshot(`${testName}`, `03-fail-${testName}`);
        await this.page1.logger(testName, ' failed');
        return false;
      }
      await this.page1.screenshot(`${testName}`, `03-success-${testName}`);
      const resp = isNotHidden;
      await this.page1.logger(testName, ' passed');

      return resp === true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async hidePresentation(testName, customParameter) {
    try {
      await this.page1.init(true, true, testName, 'Moderator1', undefined, customParameter);
      await this.page1.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-${testName}`);
      await this.page1.waitForSelector(e.actions);
      await this.page1.screenshot(`${testName}`, `02-${testName}`);
      const checkPresentationButton = await this.page1.page.evaluate(checkElement, e.restorePresentation);
      const checkPresentationPlaceholder = await this.page1.page.evaluate(checkElement, e.presentationPlaceholder);
      const resp = !(checkPresentationButton || checkPresentationPlaceholder);

      if (!resp) {
        await this.page1.screenshot(`${testName}`, `03-fail-${testName}`);
        await this.page1.logger(testName, ' failed');
        return false;
      }
      await this.page1.screenshot(`${testName}`, `03-success-${testName}`);
      await this.page1.logger(testName, ' passed');

      return resp === true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async bannerText(testName, customParameter) {
    try {
      await this.page1.init(true, true, testName, 'Moderator1', undefined, customParameter);
      await this.page1.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-${testName}`);
      await this.page1.waitForSelector(e.actions);
      await this.page1.screenshot(`${testName}`, `02-${testName}`);
      const resp = await this.page1.hasElement(e.notificationBar);
      if (!resp) {
        await this.page1.screenshot(`${testName}`, `03-fail-${testName}`);
        await this.page1.logger(testName, ' failed');
        return false;
      }
      await this.page1.screenshot(`${testName}`, `03-success-${testName}`);
      await this.page1.logger(testName, ' passed');

      return resp === true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async bannerColor(testName, customParameter, colorToRGB) {
    try {
      await this.page1.init(true, true, testName, 'Moderator1', undefined, customParameter);
      await this.page1.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-${testName}`);
      await this.page1.waitForSelector(e.notificationBar);
      await this.page1.screenshot(`${testName}`, `02-${testName}`);
      const notificationBarColor = await this.page1.page.$eval(e.notificationBar, elem => getComputedStyle(elem).backgroundColor);
      if (notificationBarColor !== colorToRGB) {
        await this.page1.screenshot(`${testName}`, `03-fail-${testName}`);
        await this.page1.logger(testName, ' failed');
        return false;
      }
      await this.page1.screenshot(`${testName}`, `03-success-${testName}`);
      await this.page1.logger(testName, ' passed');

      return true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async hideAndSwapPresentation(testName, customParameter) {
    try {
      await this.page1.init(true, true, testName, 'Moderator1', undefined, customParameter);
      await this.page1.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-${testName}`);
      await this.page1.waitForSelector(e.actions);
      const resp = await this.page1.hasElement(e.restorePresentation) && await this.page1.hasElement(e.defaultContent);
      if (!resp) {
        await this.page1.screenshot(`${testName}`, `02-fail-${testName}`);
        await this.page1.logger(testName, ' failed');
        return false;
      }
      await this.page1.screenshot(`${testName}`, `02-success-${testName}`);
      await this.page1.logger(testName, ' passed');

      return resp === true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async showPublicChatOnLogin(testName, customParameter) {
    try {
      await this.page1.init(true, true, testName, 'Moderator1', undefined, customParameter);
      await this.page1.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-${testName}`);
      await this.page1.waitForSelector(e.actions);
      const resp = await this.page1.page.evaluate(checkElementLengthEqualTo, e.chat, 0);
      if (!resp) {
        await this.page1.screenshot(`${testName}`, `02-fail-${testName}`);
        await this.page1.logger(testName, ' failed');
        return false;
      }
      await this.page1.screenshot(`${testName}`, `02-success-${testName}`);
      await this.page1.logger(testName, ' passed');

      return resp === true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async forceRestorePresentationOnNewEvents(testName, customParameter) {
    try {
      await this.page1.init(true, true, testName, 'Moderator1', undefined, customParameter);
      await this.page1.startRecording(testName);
      await this.page2.init(true, true, testName, 'Moderator2', this.page1.meetingId, customParameter);
      await this.page2.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-page1-${testName}`);
      await this.page2.screenshot(`${testName}`, `01-page2-${testName}`);
      await this.page2.waitAndClick(e.minimizePresentation);
      await this.page2.screenshot(`${testName}`, `02-page2-${testName}`);
      const zoomInCase = await util.zoomIn(this.page1);
      await this.page1.screenshot(`${testName}`, `02-page1-${testName}`);
      await this.page2.screenshot(`${testName}`, `03-page2-${testName}`);
      const zoomOutCase = await util.zoomOut(this.page1);
      await this.page1.screenshot(`${testName}`, `02-page1-${testName}`);
      await this.page2.screenshot(`${testName}`, `03-page2-${testName}`);
      const pollCase = await util.poll(this.page1, this.page2);
      await this.page1.screenshot(`${testName}`, `02-page1-${testName}`);
      await this.page2.screenshot(`${testName}`, `03-page2-${testName}`);
      const previousSlideCase = await util.previousSlide(this.page1);
      await this.page1.screenshot(`${testName}`, `03-page1-${testName}`);
      await this.page2.screenshot(`${testName}`, `04-page2-${testName}`);
      const nextSlideCase = await util.nextSlide(this.page1);
      await this.page1.screenshot(`${testName}`, `04-page1-${testName}`);
      await this.page2.screenshot(`${testName}`, `05-page2-${testName}`);
      const annotationCase = await util.annotation(this.page1);
      await this.page1.screenshot(`${testName}`, `05-page1-${testName}`);
      await this.page2.screenshot(`${testName}`, `06-page2-${testName}`);

      const test = await this.page2.page.evaluate(checkElement, e.restorePresentation);
      const resp = (zoomInCase && zoomOutCase && pollCase && previousSlideCase && nextSlideCase && annotationCase && test);
      if (resp) {
        await this.page2.screenshot(`${testName}`, `07-page2-fail-${testName}`);
        await this.page1.logger(testName, ' failed');
        return false;
      }
      await this.page2.screenshot(`${testName}`, `07-page2-success-${testName}`);
      await this.page1.logger(testName, ' passed');

      return true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async forceRestorePresentationOnNewPollResult(customParameter, testName) {
    try {
      await this.page1.init(true, true, testName, 'Moderator1', undefined, customParameter);
      await this.page2.init(false, true, testName, 'Viewer1', this.page1.meetingId, customParameter);
      await this.page2.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-page1-${testName}`);
      await this.page2.screenshot(`${testName}`, `01-page2-${testName}`);
      await this.page2.waitAndClick(e.minimizePresentation);
      await this.page2.screenshot(`${testName}`, `02-page2-${testName}`);
      const pollCase = await util.poll(this.page1, this.page2) === true;
      await this.page2.waitForSelector(e.smallToastMsg);
      await this.page1.screenshot(`${testName}`, `02-page1-${testName}`);
      await this.page2.screenshot(`${testName}`, `03-page2-${testName}`);

      const test = await this.page2.page.evaluate(checkElement, e.restorePresentation);
      if (pollCase && test) {
        await this.page2.screenshot(`${testName}`, `04-page2-fail-${testName}`);
        await this.page1.logger(testName, ' failed');
        return false;
      }
      await this.page2.screenshot(`${testName}`, `04-page2-success-${testName}`);
      await this.page1.logger(testName, ' passed');

      return true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async recordMeeting(testName, customParameter) {
    try {
      await this.page1.init(true, true, testName, 'Moderator1', undefined, customParameter);
      await this.page1.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-${testName}`);
      const resp = await this.page1.page.evaluate(checkElementLengthEqualTo, e.recordingIndicator, 0);
      if (!resp) {
        await this.page1.screenshot(`${testName}`, `02-fail-${testName}`);
        await this.page1.logger(testName, ' failed');
        return false;
      }
      await this.page1.screenshot(`${testName}`, `02-success-${testName}`);
      await this.page1.logger(testName, ' passed');

      return resp === true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async skipVideoPreview(testName, customParameter) {
    try {
      await this.page1.init(true, true, testName, 'Moderator1', undefined, customParameter);
      await this.page1.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-${testName}`);
      await this.page1.waitAndClick(e.joinVideo);
      const resp = await this.page1.page.evaluate(checkElementLengthEqualTo, e.webcamSettingsModal, 0);
      if (!resp) {
        await this.page1.screenshot(`${testName}`, `02-fail-${testName}`);
        await this.page1.logger(testName, ' failed');
        return false;
      }
      await this.page1.screenshot(`${testName}`, `02-success-${testName}`);
      await this.page1.logger(testName, ' passed');

      return resp === true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async skipVideoPreviewOnFirstJoin(testName, customParameter) {
    try {
      await this.page1.init(true, true, testName, 'Moderator1', undefined, customParameter);
      await this.page1.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-${testName}`);
      await this.page1.shareWebcam(false);

      await this.page1.waitAndClick(e.leaveVideo, VIDEO_LOADING_WAIT_TIME);
      await this.page1.waitForElementHandleToBeRemoved(e.webcamVideo, ELEMENT_WAIT_LONGER_TIME);
      await this.page1.waitForElementHandleToBeRemoved(e.leaveVideo, ELEMENT_WAIT_LONGER_TIME);

      const parsedSettings = await this.page1.getSettingsYaml();
      const videoPreviewTimeout = parseInt(parsedSettings.public.kurento.gUMTimeout);
      await this.page1.shareWebcam(true, videoPreviewTimeout);

      await this.page1.screenshot(`${testName}`, `02-success-${testName}`);
      await this.page1.logger(testName, ' passed');

      return true;
    } catch (err) {
      await this.page1.screenshot(`${testName}`, `02-fail-${testName}`);
      await this.page1.logger(err);
      return false;
    }
  }

  async mirrorOwnWebcam(testName, customParameter) {
    try {
      await this.page1.init(true, true, testName, 'Moderator1', undefined, customParameter);
      await this.page1.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-${testName}`);
      await this.page1.waitAndClick(e.joinVideo);
      await this.page1.waitForSelector(e.webcamMirroredVideoPreview);
      await this.page1.waitAndClick(e.startSharingWebcam);
      const resp = await this.page1.hasElement(e.webcamMirroredVideoContainer);
      if (!resp) {
        await this.page1.screenshot(`${testName}`, `02-fail-${testName}`);
        await this.page1.logger(testName, ' failed');
        return false;
      }
      await this.page1.screenshot(`${testName}`, `02-success-${testName}`);
      await this.page1.logger(testName, ' passed');

      return resp === true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async showParticipantsOnLogin(testName, customParameter) {
    try {
      await this.page1.init(true, true, testName, 'Moderator1', undefined, customParameter);
      await this.page1.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-${testName}`);
      await this.page1.waitForSelector(e.whiteboard);
      const resp = await this.page1.page.evaluate(checkElementLengthEqualTo, e.userslistContainer, 0);
      if (!resp) {
        await this.page1.screenshot(`${testName}`, `02-fail-${testName}`);
        await this.page1.logger(testName, ' failed');
        return false;
      }
      await this.page1.screenshot(`${testName}`, `02-success-${testName}`);
      await this.page1.logger(testName, ' passed');

      return resp === true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }
}

module.exports = exports = CustomParameters;