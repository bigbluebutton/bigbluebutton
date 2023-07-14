const { expect, default: test } = require('@playwright/test');
const { MultiUsers } = require('../user/multiusers');
const e = require('../core/elements');
const c = require('./constants');
const { VIDEO_LOADING_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_EXTRA_LONG_TIME } = require('../core/constants');
const util = require('./util');
const { getSettings } = require('../core/settings');
const { waitAndClearDefaultPresentationNotification } = require('../notifications/util');

class DisabledFeatures extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async breakoutRooms() {
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.wasRemoved(e.createBreakoutRooms);
  }

  async speechRecognition() {
    const { speechRecognitionEnabled } = getSettings();

    await this.modPage.waitForSelector(e.audioModal, ELEMENT_WAIT_LONGER_TIME);

    if(speechRecognitionEnabled) {
      await this.modPage.wasRemoved(e.speechRecognition);
    } else {
      await this.modPage.wasRemoved(e.speechRecognitionUnsupported);
    }
  }

  async captions() {
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.wasRemoved(e.writeClosedCaptions);
  }

  async chat() {
    await this.modPage.wasRemoved(e.publicChat);
  }

  async externalVideos() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.wasRemoved(e.shareExternalVideoBtn);
  }

  async layouts() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.wasRemoved(e.propagateLayout);
    await this.modPage.wasRemoved(e.layoutModal);
  }

  async learningDashboard() {
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.wasRemoved(e.learningDashboard);
  }

  async polls() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.wasRemoved(e.polling);
  }

  async screenshare() {
    await this.modPage.wasRemoved(e.startScreenSharing);
  }

  async sharedNotes() {
    await this.modPage.wasRemoved(e.sharedNotes);
  }

  async virtualBackgrounds() {
    await this.modPage.waitAndClick(e.joinVideo);
    await this.modPage.wasRemoved(e.virtualBackgrounds);
  }

  async downloadPresentationWithAnnotations() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.managePresentations);
    await this.modPage.wasRemoved(e.exportPresentationToPublicChat);
  }

  async importPresentationWithAnnotationsFromBreakoutRooms() {
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);
    await this.modPage.wasRemoved(e.captureBreakoutWhiteboard);
  }

  async importSharedNotesFromBreakoutRooms() {
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);
    await this.modPage.wasRemoved(e.captureBreakoutSharedNotes);
  }

  async presentation() {
    await this.modPage.wasRemoved(e.whiteboard);
    await this.modPage.wasRemoved(e.minimizePresentation);
    await this.modPage.wasRemoved(e.restorePresentation);
  }

  async customVirtualBackground() {
    await this.modPage.waitAndClick (e.joinVideo);
    await this.modPage.waitForSelector(e.webcamSettingsModal);
    await this.modPage.wasRemoved(e.inputBackgroundButton);
  }

  // Disabled Features Exclude
  async breakoutRoomsExclude() {
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.hasElement(e.createBreakoutRooms);
  }

  async speechRecognitionExclude() {
    const { speechRecognitionEnabled } = getSettings();

    await this.modPage.waitForSelector(e.audioModal, ELEMENT_WAIT_LONGER_TIME);

    if(speechRecognitionEnabled) {
      await this.modPage.wasRemoved(e.speechRecognition);
    } else {
      await this.modPage.wasRemoved(e.speechRecognitionUnsupported);
    }
  }

  async captionsExclude() {
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.hasElement(e.writeClosedCaptions);
  }

  async chatExclude() {
    await this.modPage.hasElement(e.publicChat);
  }

  async externalVideosExclude() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.hasElement(e.shareExternalVideoBtn);
  }

  async layoutsExclude() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.hasElement(e.propagateLayout);
    await this.modPage.hasElement(e.layoutModal);
  }

  async learningDashboardExclude() {
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.hasElement(e.learningDashboard);
  }

  async pollsExclude() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.hasElement(e.polling);
  }

  async screenshareExclude() {
    await this.modPage.hasElement(e.startScreenSharing);
  }

  async sharedNotesExclude() {
    await this.modPage.hasElement(e.sharedNotes);
  }

  async virtualBackgroundsExclude() {
    await this.modPage.waitAndClick(e.joinVideo);
    await this.modPage.hasElement(e.virtualBackgrounds);
  }

  async downloadPresentationWithAnnotationsExclude() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.managePresentations);
    await this.modPage.hasElement(e.exportPresentationToPublicChat);
  }

  async importPresentationWithAnnotationsFromBreakoutRoomsExclude() {
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);
    await this.modPage.hasElement(e.captureBreakoutWhiteboard);
  }

  async importSharedNotesFromBreakoutRoomsExclude() {
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);
    await this.modPage.hasElement(e.captureBreakoutSharedNotes);
  }

  async presentationExclude() {
    await this.modPage.hasElement(e.whiteboard);
    await this.modPage.waitAndClick(e.minimizePresentation);
    await this.modPage.hasElement(e.restorePresentation);
  }

  async customVirtualBackgroundExclude() {
    await this.modPage.waitAndClick (e.joinVideo);
    await this.modPage.waitForSelector(e.webcamSettingsModal);
    await this.modPage.hasElement(e.inputBackgroundButton);
  }
}

exports.DisabledFeatures = DisabledFeatures;
