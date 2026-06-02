import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { MultiUsers } from '../user/multiusers';
import { openUserListIfClosed } from '../user/util';

export class DisabledFeatures extends MultiUsers {
  async breakoutRooms() {
    await this.modPage.wasRemoved(
      e.breakoutRoomSidebarButton,
      'should not display the option to create breakout rooms on the sidebar',
    );
  }

  async speechRecognition() {
    const { speechRecognitionEnabled } = this.modPage.settings || {};

    await this.modPage.hasElement(e.audioModal, 'should display the audio modal', ELEMENT_WAIT_LONGER_TIME);

    if (speechRecognitionEnabled) {
      await this.modPage.wasRemoved(e.speechRecognition, 'should not display the speech recognition option');
    } else {
      await this.modPage.wasRemoved(
        e.speechRecognitionUnsupported,
        'should not display the speech recognition message saying that is unsupported',
      );
    }
  }

  async captions() {
    await this.modPage.waitAndClick(e.manageUsers);
  }

  async chat() {
    await this.modPage.wasRemoved(
      e.hidePublicChat,
      'should not display the hide public chat button and the whole chat',
    );
  }

  async externalVideos() {
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.wasRemoved(
      e.shareExternalVideoBtn,
      'should not display the share external video option when opening the actions button',
    );
  }

  async layouts() {
    await this.modPage.waitAndClick(e.optionsButton);
    await this.modPage.wasRemoved(
      e.manageLayoutBtn,
      'should not display manage layout option when the actions is open',
    );
  }

  async learningDashboard() {
    await this.modPage.hasElement(e.usersListSidebarButton, 'should display the users list button on the sidebar');
    await this.modPage.wasRemoved(e.learningDashboardSidebarButton, 'should not display the learning dashboard button on the sidebar');
  }

  async polls() {
    await this.modPage.wasRemoved(e.pollSidebarButton, 'should not display the poll sidebar button');
  }

  async lockSettings() {
    await openUserListIfClosed(this.modPage);
    // The "mute all except presenter" button shares the moderator crowd-action area and is
    // not gated, so its presence confirms the area rendered while only the lock viewers
    // button is hidden by disabledFeatures=lockSettings.
    await this.modPage.hasElement(e.muteAllUsers, 'should display the moderator crowd action buttons');
    await this.modPage.wasRemoved(e.lockViewersButton, 'should not display the lock viewers button');
  }

  async lockSettingsServerEnforcement() {
    // The meeting was created with disabledFeatures=lockSettings AND
    // lockSettingsDisablePublicChat=true. Because the feature is disabled, the lock must not
    // be applied server-side and the moderator control must be hidden.
    await openUserListIfClosed(this.modPage);
    await this.modPage.wasRemoved(e.lockViewersButton, 'should not display the lock viewers button');

    // The per-user "Lock <user>" option is gated on hasActiveLockSetting. Neutralizing the
    // lock create params at the source keeps that flag false, so the option must be absent for
    // the viewer. This is the case that would surface a DB / in-memory divergence.
    await this.modPage.page.locator(e.userListItem).filter({ hasText: this.userPage.username }).click();
    await this.modPage.wasRemoved(
      e.unlockUserButton,
      'should not offer the per-user lock option when lockSettings is disabled',
    );
    await this.modPage.page.keyboard.press('Escape');

    // The public-chat lock coming from the create parameter must be ignored, so the viewer
    // can still send public chat messages.
    await this.userPage.hasElementEnabled(e.chatBox, 'should keep the public chat enabled for the viewer');
    await this.userPage.fill(e.chatBox, e.message);
    await this.userPage.waitAndClick(e.sendButton);
    await this.userPage.hasElement(
      e.chatUserMessageText,
      'viewer public chat message should be sent because the lock is not applied',
    );
  }

  async screenshare() {
    await this.modPage.wasRemoved(e.startScreenSharing, 'should not display the screenshare button');
  }

  async sharedNotes() {
    await this.modPage.wasRemoved(e.sharedNotesSidebarButton, 'should not display the shared notes button on the sidebar');
  }

  async virtualBackgrounds() {
    await this.modPage.waitAndClick(e.joinVideo);
    await this.modPage.wasRemoved(e.backgroundSettingsTitle, 'should not display the background settings title');
  }

  async downloadPresentationWithAnnotations() {
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.waitAndClick(e.managePresentations);
    await this.modPage.waitAndClick(e.presentationOptionsDownloadBtn);
    await this.modPage.wasRemoved(
      e.sendPresentationInCurrentStateBtn,
      'should not display the option send presentation with annotations on the manage presentations',
    );
  }

  async importPresentationWithAnnotationsFromBreakoutRooms() {
    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
    await this.modPage.waitForSelector(e.createBreakoutRoomsButton);
    await this.modPage.wasRemoved(
      e.captureBreakoutWhiteboard,
      'should not display the option to capture the breakout room whiteboard when the create breakout rooms modal is opened',
    );
  }

  async importSharedNotesFromBreakoutRooms() {
    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
    await this.modPage.waitForSelector(e.createBreakoutRoomsButton);
    await this.modPage.wasRemoved(
      e.captureBreakoutSharedNotes,
      'should not display the option to capture the breakout room shared notes when the create breakout room modal is opened',
    );
  }

  async presentation() {
    await this.modPage.wasRemoved(e.whiteboard, 'should not display the whiteboard');
    await this.modPage.wasRemoved(e.minimizePresentation, 'should not display the minimize presentation button');
    await this.modPage.wasRemoved(e.restorePresentation, 'should not display the restore presentation button');
  }

  async customVirtualBackground() {
    await this.modPage.waitAndClick(e.joinVideo);
    await this.modPage.waitAndClick(e.backgroundSettingsTitle);
    await this.modPage.wasRemoved(e.inputBackgroundButton, 'should not display the input background button');
  }

  async slideSnapshot() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard');
    await this.modPage.closeAllToastNotifications();
    await this.modPage.waitAndClick(e.whiteboardOptionsButton);
    await this.modPage.hasElement(
      e.presentationFullscreen,
      'should display the presentation fullscreen on the whiteboard options',
    );
    await this.modPage.wasRemoved(
      e.presentationSnapshot,
      'should not display the presentation snapshot on the whiteboard options',
    );
  }

  async cameraAsContent() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard');
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.hasElement(e.managePresentations, 'should display the manage presentations option');
    await this.modPage.wasRemoved(
      e.shareCameraAsContent,
      'should not display the share camera as content option on the actions',
    );
  }

  async infiniteWhiteboard() {
    const { allowInfiniteWhiteboard } = this.modPage.settings || {};

    if (allowInfiniteWhiteboard) {
      await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard');
      await this.modPage.wasRemoved(e.turnInfiniteWhiteboardOn, 'should not display the infinite whiteboard button');
    }
  }

  // Disabled Features Exclude
  async breakoutRoomsExclude() {
    await this.modPage.hasElement(e.navigationSidebarContainer, 'should display the sidebar navigation container');
    await this.modPage.hasElement(
      e.breakoutRoomSidebarButton,
      'should display the create breakout rooms option on the manage users',
    );
  }

  async speechRecognitionExclude() {
    const { speechRecognitionEnabled } = this.modPage.settings || {};

    await this.modPage.waitForSelector(e.audioModal, ELEMENT_WAIT_LONGER_TIME);

    if (speechRecognitionEnabled) {
      await this.modPage.wasRemoved(e.speechRecognition, 'should not display the speech recognition option');
    } else {
      await this.modPage.wasRemoved(
        e.speechRecognitionUnsupported,
        'should not display the speech recognition unsupported message',
      );
    }
  }

  async captionsExclude() {
    await this.modPage.waitAndClick(e.manageUsers);
  }

  async chatExclude() {
    await this.modPage.hasElement(
      e.hidePublicChat,
      'should display the hide public chat option when the public chat is open',
    );
  }

  async externalVideosExclude() {
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.hasElement(e.shareExternalVideoBtn, 'should display the share external video button');
  }

  async layoutsExclude() {
    await this.modPage.waitAndClick(e.optionsButton);
    await this.modPage.hasElement(e.manageLayoutBtn, 'should display the manage layout button');
  }

  async learningDashboardExclude() {
    await this.modPage.hasElement(e.usersListSidebarButton, 'should display the users list button on the sidebar');
    await this.modPage.hasElement(e.learningDashboardSidebarButton, 'should display the learning dashboard button on the sidebar');
  }

  async pollsExclude() {
    await this.modPage.hasElement(e.pollSidebarButton, 'should display the polling sidebar button');
  }

  async screenshareExclude() {
    await this.modPage.hasElement(e.startScreenSharing, 'should display the start screenshare option');
  }

  async sharedNotesExclude() {
    await this.modPage.hasElement(e.sharedNotesSidebarButton, 'should display the shared notes button on the sidebar');
  }

  async virtualBackgroundsExclude() {
    await this.modPage.waitAndClick(e.joinVideo);
    await this.modPage.waitAndClick(e.backgroundSettingsTitle);
    await this.modPage.hasElement(e.virtualBackgrounds, 'should display the virtual backgrounds option');
  }

  async downloadPresentationWithAnnotationsExclude() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard');
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.waitAndClick(e.managePresentations);
    await this.modPage.waitAndClick(e.presentationOptionsDownloadBtn);
    await this.modPage.hasElement(
      e.sendPresentationInCurrentStateBtn,
      'should display the option to send the presentation in current state so de user can download the presentation with the annotations',
    );
  }

  async importPresentationWithAnnotationsFromBreakoutRoomsExclude() {
    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
    await this.modPage.waitForSelector(e.createBreakoutRoomsButton);
    await this.modPage.waitAndClick(e.moreOptionsToggle);
    await this.modPage.hasElement(
      e.captureBreakoutWhiteboard,
      'should display the option to capture the breakout whiteboard on the create breakout rooms modal',
    );
  }

  async importSharedNotesFromBreakoutRoomsExclude() {
    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
    await this.modPage.waitForSelector(e.createBreakoutRoomsButton);
    await this.modPage.hasElement(
      e.captureBreakoutSharedNotes,
      'should display the option to capture the shared notes whiteboard on the create breakout rooms modal',
    );
  }

  async presentationExclude() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard');
    await this.modPage.waitAndClick(e.minimizePresentation);
    await this.modPage.hasElement(e.restorePresentation, 'should display the restore presentation option');
  }

  async customVirtualBackgroundExclude() {
    await this.modPage.waitAndClick(e.joinVideo);
    await this.modPage.waitAndClick(e.backgroundSettingsTitle);
    await this.modPage.hasElement(e.inputBackgroundButton, 'should display the input background button');
  }

  async slideSnapshotExclude() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard');
    await this.modPage.closeAllToastNotifications();
    await this.modPage.waitAndClick(e.whiteboardOptionsButton);
    await this.modPage.hasElement(
      e.presentationSnapshot,
      'should display the presentation snapshot on the whiteboard options',
    );
  }

  async cameraAsContentExclude() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.hasElement(
      e.shareCameraAsContent,
      'should display the share camera as content on the action options.',
    );
  }

  async infiniteWhiteboardExclude() {
    const { allowInfiniteWhiteboard } = this.modPage.settings || {};

    if (allowInfiniteWhiteboard) {
      await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard');
      await this.modPage.hasElement(e.turnInfiniteWhiteboardOn, 'should display the infinite whiteboard button');
    }
  }
}
