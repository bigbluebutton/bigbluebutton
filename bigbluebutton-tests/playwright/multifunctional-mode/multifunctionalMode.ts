import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { MultiUsers } from '../user/multiusers';

export class MultifunctionalMode extends MultiUsers {
  private async openAuxiliarySidebar(page = this.modPage, checkForEmptyPanel = true) {
    await page.waitAndClick(e.enableMultiFunctionalMode);
    if (checkForEmptyPanel) {
      await page.hasElement(
        e.emptyPanelTitle,
        'should display the empty panel title after opening the auxiliary sidebar',
      );
    }
  }

  async openChatThenAuxiliary(page = this.modPage) {
    const isChatInMain = await page.checkElement(`${e.sidebarContentMain} ${e.hidePublicChat}`);
    if (!isChatInMain) {
      await page.waitAndClick(e.messagesSidebarButton);
    }
    await page.hasElement(
      `${e.sidebarContentMain} ${e.hidePublicChat}`,
      'should display the chat panel in the main sidebar',
    );
    await this.openAuxiliarySidebar(page);
  }

  async openPanelInAuxiliarySidebar() {
    const { multiFunctionalModeEnabled } = this.modPage.settings || {};
    if (!multiFunctionalModeEnabled) return;

    await this.openChatThenAuxiliary();

    // Chat must be in the MAIN sidebar, not the auxiliary
    await this.modPage.hasElement(
      `${e.sidebarContentMain} ${e.hidePublicChat}`,
      'chat should still be in the main sidebar after opening auxiliary',
    );

    // Click users list – it should open inside the auxiliary sidebar
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.modPage.hasElement(
      `${e.sidebarContentAuxiliary} ${e.userListPanel}`,
      'users list should be visible in the auxiliary sidebar',
    );

    // Chat must remain in the main sidebar
    await this.modPage.hasElement(
      `${e.sidebarContentMain} ${e.hidePublicChat}`,
      'chat should remain in main sidebar after opening users list in auxiliary',
    );

    // The enableMultiFunctionalMode button must NOT appear in the auxiliary sidebar
    await this.modPage.wasRemoved(
      `${e.sidebarContentAuxiliary} ${e.enableMultiFunctionalMode}`,
      'enableMultiFunctionalMode button should not be present in the auxiliary sidebar',
    );
    // …and must appear exactly once on the page (i.e. only in the main sidebar)
    await this.modPage.hasElement(
      `${e.sidebarContentMain} ${e.enableMultiFunctionalMode}`,
      'enableMultiFunctionalMode button should ONLY be in main sidebar only',
    );
  }

  async openAuxiliarySidebarResetsCameraFromSidebarBottom() {
    const { multiFunctionalModeEnabled } = this.modPage.settings || {};
    if (!multiFunctionalModeEnabled) return;

    await this.modPage.page.waitForTimeout(1000); // wait for webcam to fully initialize
    // At this point the caller has shared webcam and opened the chat panel.
    // Drag webcam to sidebar-bottom drop zone, checking the drop area appears mid-drag
    await this.modPage.dragWebcam(e.webcamMirroredVideoContainer, e.dropAreaSidebarBottom, async () => {
      await this.modPage.hasElement(
        e.dropAreaSidebarBottom,
        'dropAreaSidebarBottom should be visible while dragging (before auxiliary sidebar is opened)',
      );
    });

    // Open the auxiliary sidebar from the chat panel header
    await this.openAuxiliarySidebar();

    // The sidebar-bottom drop area must NOT appear even while dragging with auxiliary sidebar open
    await this.modPage.dragWebcam(e.webcamMirroredVideoContainer, null, async () => {
      await this.modPage.wasRemoved(
        e.dropAreaSidebarBottom,
        'dropAreaSidebarBottom should not be present while dragging with auxiliary sidebar open',
      );
    });

    // Webcam container should still be visible (camera was moved, not removed)
    await this.modPage.hasElement(
      e.webcamMirroredVideoContainer,
      'webcam should still be visible after being reset from sidebar-bottom',
    );
  }

  async cannotDragCameraToSidebarBottomWithAuxiliaryOpen() {
    const { multiFunctionalModeEnabled } = this.modPage.settings || {};
    if (!multiFunctionalModeEnabled) return;

    // Open auxiliary sidebar first
    await this.openChatThenAuxiliary();

    // Drag the webcam and assert drop zones mid-drag
    await this.modPage.dragWebcam(e.webcamMirroredVideoContainer, null, async () => {
      // All standard drop zones are present
      await this.modPage.hasElement(e.dropAreaTop, 'dropAreaTop should be visible during drag');
      await this.modPage.hasElement(e.dropAreaBottom, 'dropAreaBottom should be visible during drag');
      await this.modPage.hasElement(e.dropAreaLeft, 'dropAreaLeft should be visible during drag');
      await this.modPage.hasElement(e.dropAreaRight, 'dropAreaRight should be visible during drag');

      // But sidebarBottom must NOT appear
      await this.modPage.wasRemoved(
        e.dropAreaSidebarBottom,
        'dropAreaSidebarBottom should NOT be visible during drag when auxiliary sidebar is open',
      );
    });
  }

  async auxiliarySidebarRemembersLastOpenPanel() {
    const { multiFunctionalModeEnabled } = this.modPage.settings || {};
    if (!multiFunctionalModeEnabled) return;

    // Place users list in auxiliary sidebar
    await this.openChatThenAuxiliary();
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.modPage.hasElement(
      `${e.sidebarContentAuxiliary} ${e.userListPanel}`,
      'users list should be visible in auxiliary sidebar',
    );

    // Close the auxiliary sidebar via the close button inside the users list panel
    await this.modPage.waitAndClick(e.closeUserList);
    await this.modPage.wasRemoved(
      `${e.sidebarContentAuxiliary} ${e.userListPanel}`,
      'users list should be removed after closing auxiliary sidebar',
    );

    // Reopen auxiliary sidebar
    await this.openAuxiliarySidebar(this.modPage, false);

    // Users list should be restored (not the empty panel)
    await this.modPage.hasElement(
      `${e.sidebarContentAuxiliary} ${e.userListPanel}`,
      'users list should be restored when auxiliary sidebar is reopened',
    );
    await this.modPage.wasRemoved(
      e.emptyPanelTitle,
      'empty panel should not appear when reopening auxiliary with a previously remembered panel',
    );
  }

  async reopeningAuxiliaryShowsEmptyPanelWhenPreviousPanelOpenedInMain() {
    const { multiFunctionalModeEnabled } = this.modPage.settings || {};
    if (!multiFunctionalModeEnabled) return;

    // Place users list in auxiliary sidebar, then close auxiliary
    await this.openChatThenAuxiliary();
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.modPage.hasElement(
      `${e.sidebarContentAuxiliary} ${e.userListPanel}`,
      'users list should be in auxiliary sidebar',
    );
    await this.modPage.waitAndClick(`${e.sidebarContentAuxiliary} ${e.closeUserList}`);
    await this.modPage.wasRemoved(
      `${e.sidebarContentAuxiliary} ${e.userListPanel}`,
      'auxiliary sidebar should be closed',
    );

    // Open users list in the MAIN sidebar
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.modPage.hasElement(
      `${e.sidebarContentMain} ${e.userListPanel}`,
      'users list should be visible in the main sidebar',
    );

    // Reopen auxiliary – it must show the empty panel because users list is now in main
    await this.openAuxiliarySidebar();
    await this.modPage.hasElement(
      e.emptyPanelTitle,
      'empty panel should be shown when auxiliary is reopened and its previous panel is now in main sidebar',
    );
  }

  async breakoutPanelInAuxiliaryClosesWhenBreakoutsEnd() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    const { multiFunctionalModeEnabled } = this.userPage.settings || {};
    if (!multiFunctionalModeEnabled) return;

    // --- Setup: moderator creates breakout rooms with free join ---
    await this.modPage.setHeightWidthViewPortSize({ width: 1920, height: 1080 });
    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
    await this.modPage.waitAndClick(e.moreOptionsToggle);
    await this.modPage.page.check(e.allowChoiceRoom); // free join
    await this.modPage.waitAndClick(e.createBreakoutRoomsButton, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.setHeightWidthViewPortSize();

    // Attendee dismisses invite modal
    await this.userPage.hasElement(e.modalConfirmButton, 'modal confirm button should appear for attendee');
    await this.userPage.waitAndClick(e.modalDismissButton);

    // --- Attendee: open chat in main sidebar, then place breakout panel in auxiliary ---
    await this.userPage.page.bringToFront();
    const isChatOpenInMainSidebar = await this.userPage.checkElement(`${e.sidebarContentMain} ${e.hidePublicChat}`);
    if (!isChatOpenInMainSidebar) {
      await this.userPage.waitAndClick(e.messagesSidebarButton);
      await this.userPage.hasElement(
        `${e.sidebarContentMain} ${e.hidePublicChat}`,
        'chat should be in main sidebar for attendee',
      );
    }
    await this.openAuxiliarySidebar(this.userPage);

    await this.userPage.waitAndClick(e.breakoutRoomSidebarButton);
    // The breakout rooms button might open in the auxiliary sidebar
    await this.userPage.hasElement(e.breakoutRoomSidebarButton, 'breakout rooms sidebar button should be accessible');

    // Moderator ends all breakout rooms
    await this.modPage.page.bringToFront();
    await this.modPage.waitAndClick(e.finishBreakoutButton);

    // Attendee: auxiliary sidebar should close after breakouts end
    await this.userPage.page.bringToFront();
    await this.userPage.wasRemoved(e.emptyPanelTitle, 'auxiliary sidebar should be closed after breakout rooms end');

    // Reopening auxiliary shows empty panel (breakout panel must not be restored)
    await this.userPage.waitAndClick(e.enableMultiFunctionalMode);
    await this.userPage.hasElement(
      e.emptyPanelTitle,
      'empty panel should be shown when reopening auxiliary after breakouts ended',
    );
  }

  async notesPinnedToWhiteboardClosesAuxiliarySidebar() {
    const { multiFunctionalModeEnabled, sharedNotesEnabled } = this.modPage.settings || {};
    if (!multiFunctionalModeEnabled || !sharedNotesEnabled) return;

    // Open chat in main sidebar, then open auxiliary sidebar
    await this.openChatThenAuxiliary();

    // Open shared notes in the auxiliary sidebar
    await this.modPage.waitAndClick(e.sharedNotesSidebarButton);
    await this.modPage.hasElement(
      `${e.sidebarContentAuxiliary} ${e.sharedNotesBackground}`,
      'shared notes should be open in the auxiliary sidebar',
    );

    // Pin notes to the whiteboard
    await this.modPage.waitAndClick(e.notesOptions);
    await this.modPage.waitAndClick(e.pinNotes);

    // Auxiliary sidebar should close after pinning
    await this.modPage.wasRemoved(
      `${e.sidebarContentAuxiliary} ${e.sharedNotesBackground}`,
      'auxiliary sidebar should close when notes are pinned to the whiteboard',
    );

    // Reopen auxiliary sidebar — must show the empty panel (notes are now in the presentation)
    await this.openAuxiliarySidebar();
    await this.modPage.hasElement(
      e.emptyPanelTitle,
      'empty panel should appear when reopening auxiliary after notes were pinned to the whiteboard',
    );
  }

  async auxiliarySidebarRTLLayout() {
    const { multiFunctionalModeEnabled } = this.modPage.settings || {};
    if (!multiFunctionalModeEnabled) return;

    await this.openAuxiliarySidebar();
    await this.modPage.waitAndClick(e.usersListSidebarButton);

    // Share webcam so the full layout (nav sidebar position, both sidebar panels, webcam) is visible
    await this.modPage.shareWebcam();

    // Screenshot validates the RTL layout: nav sidebar on the right, main/auxiliary sidebars on the left
    await expect(this.modPage.page, 'RTL layout should mirror the sidebar arrangement').toHaveScreenshot(
      'auxiliary-sidebar-rtl-layout.png',
      {
        mask: [this.modPage.page.locator(e.webcamMirroredVideoContainer), this.modPage.page.locator(e.whiteboard)],
      },
    );

    // Behavioral check: dropAreaSidebarBottom must not appear during drag in RTL
    await this.modPage.dragWebcam(e.webcamMirroredVideoContainer, null, async () => {
      await this.modPage.wasRemoved(
        e.dropAreaSidebarBottom,
        'dropAreaSidebarBottom should not appear during drag in RTL when auxiliary sidebar is open',
      );
    });
  }
}
