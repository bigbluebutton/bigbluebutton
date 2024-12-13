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
    await this.modPage.wasRemoved(e.createBreakoutRooms, 'should not display the option to create breakout rooms on the manage users');
  }

  async speechRecognition() {
    const { speechRecognitionEnabled } = getSettings();

    await this.modPage.hasElement(e.audioModal, 'should display the audio modal', ELEMENT_WAIT_LONGER_TIME);

    if (speechRecognitionEnabled) {
      await this.modPage.wasRemoved(e.speechRecognition);
    } else {
      await this.modPage.wasRemoved(e.speechRecognitionUnsupported, 'should not display the speech recognition message saying that is unsupported');
    }
  }

  async captions() {
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.wasRemoved(e.writeClosedCaptions, 'should not display the write closed captions');
  }

  async chat() {
    await this.modPage.wasRemoved(e.hidePublicChat, 'should not display the hide public chat button and the whole chat');
  }

  async externalVideos() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.wasRemoved(e.shareExternalVideoBtn, 'should not display the share external video option when opening the actions button');
  }

  async layouts() {
    await this.modPage.waitAndClick(e.optionsButton);
    await this.modPage.wasRemoved(e.manageLayoutBtn, 'should not display manage layout option when the actions is open');
  }

  async learningDashboard() {
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.wasRemoved(e.learningDashboard, 'should not display the learning dashboard on the manage users');
  }

  async polls() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.wasRemoved(e.polling, 'should not display the polling on the actions button');
  }

  async screenshare() {
    await this.modPage.wasRemoved(e.startScreenSharing, 'should not display the screenshare button');
  }

  async sharedNotes() {
    await this.modPage.wasRemoved(e.sharedNotes, 'should not display the shared notes on the side bar');
  }

  async virtualBackgrounds() {
    await this.modPage.waitAndClick(e.joinVideo);
    await this.modPage.wasRemoved(e.backgroundSettingsTitle);
  }

  async downloadPresentationWithAnnotations() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.managePresentations);
    await this.modPage.waitAndClick(e.presentationOptionsDownloadBtn);
    await this.modPage.wasRemoved(e.sendPresentationInCurrentStateBtn, 'should not display the option send presentation with annotations on the manage presentations');
  }

  async importPresentationWithAnnotationsFromBreakoutRooms() {
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);
    await this.modPage.wasRemoved(e.captureBreakoutWhiteboard, 'should not display the option to capture the breakout room whiteboard when the create breakout rooms modal is opened');
  }

  async importSharedNotesFromBreakoutRooms() {
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);
    await this.modPage.wasRemoved(e.captureBreakoutSharedNotes, 'should not display the option to capture the breakout room shared notes when the create breakout room modal is opened');
  }

  async presentation() {
    await this.modPage.wasRemoved(e.whiteboard, 'should not display the whiteboard');
    await this.modPage.wasRemoved(e.minimizePresentation, 'should not display the minimize presentation button');
    await this.modPage.wasRemoved(e.restorePresentation, 'should not display the restore presentation button');
  }

  async customVirtualBackground() {
    await this.modPage.waitAndClick(e.joinVideo);
    await this.modPage.waitAndClick(e.backgroundSettingsTitle);
    await this.modPage.wasRemoved(e.inputBackgroundButton);
  }

  async slideSnapshot() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard');
    await this.modPage.waitAndClick(e.whiteboardOptionsButton);
    await this.modPage.hasElement(e.presentationFullscreen, 'should display the presentation fullscreen on the whiteboard options');
    await this.modPage.wasRemoved(e.presentationSnapshot, 'should not display the presentation snapshot on the whiteboard options');
  }

  async cameraAsContent() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard');
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.hasElement(e.managePresentations, 'should display the manage presentations option');
    await this.modPage.wasRemoved(e.shareCameraAsContent, 'should not display the share camera as content option on the actions');
  }

  // Disabled Features Exclude
  async breakoutRoomsExclude() {
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.hasElement(e.createBreakoutRooms, 'should display the create breakout rooms option on the manage users');
  }

  async speechRecognitionExclude() {
    const { speechRecognitionEnabled } = getSettings();

    await this.modPage.waitForSelector(e.audioModal, ELEMENT_WAIT_LONGER_TIME);

    if (speechRecognitionEnabled) {
      await this.modPage.wasRemoved(e.speechRecognition);
    } else {
      await this.modPage.wasRemoved(e.speechRecognitionUnsupported, 'should not display the speech recognition unsupported message');
    }
  }

  async captionsExclude() {
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.hasElement(e.writeClosedCaptions, 'should display the write closed captions');
  }

  async chatExclude() {
    await this.modPage.hasElement(e.hidePublicChat, 'should display the hide public chat option when the public chat is open');
  }

  async externalVideosExclude() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.hasElement(e.shareExternalVideoBtn, 'should display the share external video button');
  }

  async layoutsExclude() {
    await this.modPage.waitAndClick(e.optionsButton);
    await this.modPage.hasElement(e.manageLayoutBtn, 'should display the manage layout button');
  }

  async learningDashboardExclude() {
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.hasElement(e.learningDashboard, 'should display the learning dashboard on the manage users');
  }

  async pollsExclude() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.hasElement(e.polling, 'should display the polling option on the actions');
  }

  async screenshareExclude() {
    await this.modPage.hasElement(e.startScreenSharing, 'should display the start screenshare option');
  }

  async sharedNotesExclude() {
    await this.modPage.hasElement(e.sharedNotes, 'should display the shared notes');
  }

  async virtualBackgroundsExclude() {
    await this.modPage.waitAndClick(e.joinVideo);
    await this.modPage.waitAndClick(e.backgroundSettingsTitle);
    await this.modPage.hasElement(e.virtualBackgrounds);
  }

  async downloadPresentationWithAnnotationsExclude() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard');
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.managePresentations);
    await this.modPage.waitAndClick(e.presentationOptionsDownloadBtn);
    await this.modPage.hasElement(e.sendPresentationInCurrentStateBtn, 'should display the option to send the presentation in current state so de user can download the presentation with the annotations');
  }

  async importPresentationWithAnnotationsFromBreakoutRoomsExclude() {
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);
    await this.modPage.hasElement(e.captureBreakoutWhiteboard, 'should display the option to capture the breakout whiteboard on the create breakout rooms modal');
  }

  async importSharedNotesFromBreakoutRoomsExclude() {
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);
    await this.modPage.hasElement(e.captureBreakoutSharedNotes, 'should display the option to capture the shared notes whiteboard on the create breakout rooms modal');
  }

  async presentationExclude() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard');
    await this.modPage.waitAndClick(e.minimizePresentation);
    await this.modPage.hasElement(e.restorePresentation, 'should display the restore presentation option');
  }

  async customVirtualBackgroundExclude() {
    await this.modPage.waitAndClick(e.joinVideo);
    await this.modPage.waitAndClick(e.backgroundSettingsTitle);
    await this.modPage.hasElement(e.inputBackgroundButton);
  }

  async slideSnapshotExclude() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard');
    await this.modPage.waitAndClick(e.whiteboardOptionsButton);
    await this.modPage.hasElement(e.presentationSnapshot, 'should display the presentation snapshot on the whiteboard options');
  }

  async cameraAsContentExclude() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.hasElement(e.shareCameraAsContent, 'should display the share camera as content on the action options.');
  }
}

exports.DisabledFeatures = DisabledFeatures;
