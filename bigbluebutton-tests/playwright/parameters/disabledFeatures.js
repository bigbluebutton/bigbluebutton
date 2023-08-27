const { MultiUsers } = require('../user/multiusers');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { getSettings } = require('../core/settings');

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
    await this.modPage.wasRemoved(e.manageLayoutBtn);
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
    await this.modPage.waitAndClick(e.presentationOptionsDownloadBtn);
    await this.modPage.wasRemoved(e.sendPresentationInCurrentStateBtn);
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

  async slideSnapshot() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.whiteboardOptionsButton);
    await this.modPage.hasElement(e.presentationFullscreen);
    await this.modPage.wasRemoved(e.presentationSnapshot);
  }

  async cameraAsContent() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.hasElement(e.managePresentations);
    await this.modPage.wasRemoved(e.shareCameraAsContent);
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
    await this.modPage.hasElement(e.manageLayoutBtn);
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
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.managePresentations);
    await this.modPage.waitAndClick(e.presentationOptionsDownloadBtn);
    await this.modPage.hasElement(e.sendPresentationInCurrentStateBtn);
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

  async slideSnapshotExclude() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.whiteboardOptionsButton);
    await this.modPage.hasElement(e.presentationSnapshot);
  }

  async cameraAsContentExclude() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.hasElement(e.shareCameraAsContent);
  }
}

exports.DisabledFeatures = DisabledFeatures;
