import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME, VIDEO_LOADING_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { readRows } from '../core/graphql';
import { ClientSettingsOverrides } from '../core/page';
import { MultiUsers } from '../user/multiusers';
import {
  hasNoRecordedToast,
  hasRecordedToast,
  openUserListIfClosed,
  privateChatOptionOf,
  recordToasts,
  userListRowOf,
} from '../user/util';

// Live transcription is off by default, and then the speech recognition option
// is hidden whether or not the feature is disabled.
export const AUDIO_CAPTIONS_SETTINGS: ClientSettingsOverrides = {
  public: { app: { audioCaptions: { enabled: true } } },
};
// puts the transcription and captions entry in the sidebar: in the actions bar it only shows while captions are active
export const AUDIO_CAPTIONS_SIDEBAR_SETTINGS: ClientSettingsOverrides = {
  public: { app: { audioCaptions: { enabled: true, showInSidebarNavigation: true } } },
};

export const INFINITE_WHITEBOARD_SETTINGS: ClientSettingsOverrides = {
  public: { whiteboard: { allowInfiniteWhiteboard: true } },
};

// Has the moderator offered to lock the viewers' webcams as soon as one viewer shares a webcam
export const VIEWERS_IN_WEBCAM_LIMIT_SETTINGS: ClientSettingsOverrides = {
  public: { app: { enableLimitOfViewersInWebcam: true, viewersInWebcam: 1 } },
};
// app.video.suggestWebcamLock
const WEBCAM_LOCK_SUGGESTION = 'Enforce lock setting to viewers webcams?';

// The guest policy as a participant reads it
const GUEST_POLICY = 'subscription { meeting { usersPolicies { guestPolicy } } }';
interface GuestPolicyRow {
  usersPolicies: { guestPolicy: string };
}

export class DisabledFeatures extends MultiUsers {
  async breakoutRooms() {
    await this.modPage.wasRemoved(
      e.breakoutRoomSidebarButton,
      'should not display the option to create breakout rooms on the sidebar',
    );
  }

  async speechRecognition() {
    expect(
      this.modPage.settings?.speechRecognitionEnabled,
      'audioCaptions.enabled should be on (AUDIO_CAPTIONS_SETTINGS)',
    ).toBe(true);
    await this.modPage.hasElement(e.audioModal, 'should display the audio modal', ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.clickMicrophoneButton();
    await this.modPage.hasElement(e.joinEchoTestButton, 'should display the audio settings');
    await this.modPage.wasRemoved(e.speechRecognition, 'should not display the speech recognition option');
    await this.modPage.wasRemoved(
      e.speechRecognitionUnsupported,
      'should not display the speech recognition message saying that is unsupported',
    );
  }

  async captions() {
    expect(
      this.modPage.settings?.speechRecognitionEnabled,
      'audioCaptions.enabled should be on (AUDIO_CAPTIONS_SIDEBAR_SETTINGS)',
    ).toBe(true);
    await this.modPage.hasElement(e.usersListSidebarButton, 'should display the sidebar navigation');
    await this.modPage.wasRemoved(
      e.audioCaptionsSidebarButton,
      'should not display the transcription and captions entry on the sidebar',
    );
  }

  async chat() {
    await this.modPage.wasRemoved(
      e.hidePublicChat,
      'should not display the hide public chat button and the whole chat',
    );
  }

  // the server refuses a private chat between attendees but lets one with a moderator through, and
  // the participants list offers exactly those
  async privateChat() {
    await this.userPage.waitAndClick(e.usersListSidebarButton);
    await this.userPage.hasElement(
      privateChatOptionOf(this.modPage.username),
      'should offer the attendee a private chat with the moderator',
    );
    await this.userPage.hasElement(userListRowOf(this.userPage2.username), 'should list the other attendee');
    await this.userPage.wasRemoved(
      privateChatOptionOf(this.userPage2.username),
      'should not offer the attendee a private chat with the other attendee',
    );
  }

  async externalVideos() {
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.wasRemoved(
      e.shareExternalVideoBtn,
      'should not display the share external video option when opening the actions button',
    );
  }

  async learningDashboard() {
    await this.modPage.hasElement(e.usersListSidebarButton, 'should display the users list button on the sidebar');
    await this.modPage.wasRemoved(
      e.learningDashboardSidebarButton,
      'should not display the learning dashboard button on the sidebar',
    );
  }

  async polls() {
    await this.modPage.wasRemoved(e.pollSidebarButton, 'should not display the poll sidebar button');
  }

  async lockSettings() {
    await openUserListIfClosed(this.modPage);
    // The button opens "Permissions and Policies", which also holds the guest policy, so it
    // stays. The two tabs that edit lock settings are what disabledFeatures=lockSettings removes.
    await this.modPage.waitAndClick(e.lockViewersButton);
    await this.modPage.hasElement(e.guestPolicyTab, 'should offer the guest policy tab');
    await this.modPage.wasRemoved(e.participantPermissionsTab, 'should not offer the participant permissions tab');
    await this.modPage.wasRemoved(e.presentationPermissionsTab, 'should not offer the presentation policy tab');

    // The guest policy is not a lock setting: it can still be changed from the modal.
    await this.modPage.waitAndClick(e.guestPolicySelector);
    await this.modPage.waitAndClick(e.askModerator);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await expect
      .poll(
        async () => {
          const [meeting] = await readRows<GuestPolicyRow>(this.modPage, GUEST_POLICY, 'meeting');
          return meeting?.usersPolicies.guestPolicy;
        },
        { message: 'should apply the guest policy picked in the modal', timeout: ELEMENT_WAIT_LONGER_TIME },
      )
      .toBe('ASK_MODERATOR');
  }

  async lockSettingsExclude() {
    await openUserListIfClosed(this.modPage);
    await this.modPage.waitAndClick(e.lockViewersButton);
    await this.modPage.hasElement(e.participantPermissionsTab, 'should offer the participant permissions tab');
    await this.modPage.hasElement(e.guestPolicyTab, 'should offer the guest policy tab');
    await this.modPage.hasElement(e.presentationPermissionsTab, 'should offer the presentation policy tab');
  }

  // Once enough viewers share a webcam the moderator is offered to lock the viewers' webcams.
  // With lockSettings disabled the lock cannot be applied, so the offer is not made.
  async webcamLockSuggestion(offered: boolean) {
    await recordToasts(this.modPage);
    await this.userPage.shareWebcam();
    await this.modPage.hasElement(
      e.webcamStreamItem,
      'should display the viewer webcam for the moderator',
      VIDEO_LOADING_WAIT_TIME,
    );
    if (offered) {
      await hasRecordedToast(
        this.modPage,
        WEBCAM_LOCK_SUGGESTION,
        'should offer the moderator to lock the viewers webcams',
      );
    } else {
      await hasNoRecordedToast(
        this.modPage,
        WEBCAM_LOCK_SUGGESTION,
        'should not offer the moderator to lock the viewers webcams',
      );
    }
  }

  async lockSettingsServerEnforcement() {
    // The meeting was created with disabledFeatures=lockSettings AND
    // lockSettingsDisablePublicChat=true. Because the feature is disabled, the lock must not
    // be applied server-side.
    await openUserListIfClosed(this.modPage);

    // The per-user "Lock <user>" option is gated on hasActiveLockSetting. Neutralizing the
    // lock create params at the source keeps that flag false, so the option must be absent for
    // the viewer. This is the case that would surface a DB / in-memory divergence.
    const viewerRow = this.modPage.page.locator(e.userListItem).filter({ hasText: this.userPage.username });
    await viewerRow.locator(e.moreOptionsUserItemButton).click();
    await this.modPage.hasElement(`${e.removeUser}:visible`, 'should open the options menu of the viewer');
    await this.modPage.wasRemoved(
      `${e.unlockUserButton}:visible`,
      'should not offer the per-user lock option when lockSettings is disabled',
    );
    // Silencing one viewer in the public chat is a moderation action of its own, not a lock setting.
    await this.modPage.hasElement(`${e.togglePublicChat}:visible`, 'should still offer the per-user public chat lock');
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
    await this.modPage.wasRemoved(
      e.sharedNotesSidebarButton,
      'should not display the shared notes button on the sidebar',
    );
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
    expect(
      this.modPage.settings?.allowInfiniteWhiteboard,
      'allowInfiniteWhiteboard should be on (INFINITE_WHITEBOARD_SETTINGS)',
    ).toBe(true);
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard');
    await this.modPage.hasElement(e.presentationToolbarWrapper, 'should display the presentation toolbar');
    await this.modPage.wasRemoved(e.turnInfiniteWhiteboardOn, 'should not display the infinite whiteboard button');
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
    expect(
      this.modPage.settings?.speechRecognitionEnabled,
      'audioCaptions.enabled should be on (AUDIO_CAPTIONS_SETTINGS)',
    ).toBe(true);
    await this.modPage.waitForSelector(e.audioModal, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.clickMicrophoneButton();
    // without speech synthesis voices (headless browsers) the option is
    // replaced by the "unsupported" note
    await this.modPage.hasElement(
      `${e.speechRecognition}, ${e.speechRecognitionUnsupported}`,
      'should display the speech recognition option',
    );
  }

  async captionsExclude() {
    expect(
      this.modPage.settings?.speechRecognitionEnabled,
      'audioCaptions.enabled should be on (AUDIO_CAPTIONS_SIDEBAR_SETTINGS)',
    ).toBe(true);
    await this.modPage.waitAndClick(e.audioCaptionsSidebarButton);
    await this.modPage.hasElement(e.audioCaptionsPanel, 'should open the transcription and captions panel');
  }

  async chatExclude() {
    await this.modPage.hasElement(
      e.hidePublicChat,
      'should display the hide public chat option when the public chat is open',
    );
  }

  async privateChatExclude() {
    await this.userPage.waitAndClick(e.usersListSidebarButton);
    await this.userPage.hasElement(
      privateChatOptionOf(this.userPage2.username),
      'should offer the attendee a private chat with the other attendee',
    );
  }

  async externalVideosExclude() {
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.hasElement(e.shareExternalVideoBtn, 'should display the share external video button');
  }

  async learningDashboardExclude() {
    await this.modPage.hasElement(e.usersListSidebarButton, 'should display the users list button on the sidebar');
    await this.modPage.hasElement(
      e.learningDashboardSidebarButton,
      'should display the learning dashboard button on the sidebar',
    );
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
    expect(
      this.modPage.settings?.allowInfiniteWhiteboard,
      'allowInfiniteWhiteboard should be on (INFINITE_WHITEBOARD_SETTINGS)',
    ).toBe(true);
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard');
    await this.modPage.hasElement(e.turnInfiniteWhiteboardOn, 'should display the infinite whiteboard button');
  }
}
