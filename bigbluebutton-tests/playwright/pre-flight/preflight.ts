import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { MultiUsers } from '../user/multiusers';
import { setGuestPolicyOption } from '../user/util';

// Enables the pre-flight screen via a create/join userdata parameter, so the
// test does not depend on the server-side default (which ships disabled).
export const PRE_FLIGHT_PARAM = 'userdata-bbb_pre_flight_screen=true';
export const AUTO_JOIN_PARAM = 'userdata-bbb_auto_join_audio=true';
export const LOCK_CAM_PARAM = 'lockSettingsDisableCam=true';

export class PreFlight extends MultiUsers {
  // Happy path: the pre-flight screen shows the camera preview and the mic,
  // camera and speaker selectors, and the join button connects the user.
  async joinFromPreFlight() {
    if (!this?.modPage) throw new Error('modPage not initialized');

    await this.modPage.hasElement(e.preFlightModal, 'should display the pre-flight screen on join');
    await this.modPage.hasElement(e.preFlightVideoPreview, 'should display the camera preview');
    await this.modPage.hasElement(e.preFlightInputDeviceSelector, 'should display the microphone selector');
    await this.modPage.hasElement(e.preFlightOutputDeviceSelector, 'should display the speaker selector');
    await this.modPage.hasElement(e.preFlightCameraSelect, 'should display the camera selector');

    await this.modPage.waitAndClick(e.preFlightJoinButton);
    await this.modPage.wasRemoved(
      e.preFlightModal,
      'should close the pre-flight screen after joining',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.modPage.hasElement(
      e.unmuteMicButton,
      'should join audio (muted) after clicking the pre-flight join button',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  // Edge case (a): the pre-flight screen preserves the listen-only path for
  // users without a microphone or with denied permission.
  async joinListenOnlyFromPreFlight() {
    if (!this?.modPage) throw new Error('modPage not initialized');

    await this.modPage.hasElement(e.preFlightModal, 'should display the pre-flight screen on join');
    await this.modPage.hasElement(
      e.preFlightListenOnlyButton,
      'should offer the join without microphone (listen only) affordance',
    );
    await this.modPage.waitAndClick(e.preFlightListenOnlyButton);
    await this.modPage.wasRemoved(
      e.preFlightModal,
      'should close the pre-flight screen after joining listen only',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.modPage.hasElement(
      e.unmuteMicButton,
      'should establish audio in listen only mode',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  // Edge case (b): the pre-flight screen takes precedence over auto join audio.
  // The screen is shown and the join is deferred until the user clicks join,
  // instead of the client auto joining audio behind the screen.
  async takesPrecedenceOverAutoJoin() {
    if (!this?.modPage) throw new Error('modPage not initialized');

    await this.modPage.hasElement(
      e.preFlightModal,
      'should display the pre-flight screen even when auto join audio is enabled',
    );
    await this.modPage.wasRemoved(e.establishingAudioLabel, 'should not auto join audio behind the pre-flight screen');
    await this.modPage.hasElement(e.preFlightJoinButton, 'should defer the audio join to the pre-flight join button');
    // Confirms the deferred join still works.
    await this.modPage.waitAndClick(e.preFlightJoinButton);
    await this.modPage.hasElement(
      e.unmuteMicButton,
      'should join audio only after clicking the pre-flight join button',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  // Edge case (c): when the user's webcam sharing is locked, the camera section
  // is hidden and no preview is shown; the audio flow keeps working.
  async hidesCameraWhenLocked() {
    if (!this?.userPage) throw new Error('userPage not initialized');

    await this.userPage.hasElement(e.preFlightModal, 'should display the pre-flight screen for the locked viewer');
    await this.userPage.wasRemoved(
      e.preFlightVideoPreview,
      'should not display the camera preview when webcam sharing is locked',
    );
    await this.userPage.hasElement(
      e.preFlightInputDeviceSelector,
      'should still display the microphone selector for the locked viewer',
    );
  }

  // v2 edge case: the pre-flight green room is shown while a guest waits for
  // approval, before being admitted to the meeting.
  async showsPreFlightDuringGuestWait() {
    if (!this?.modPage) throw new Error('modPage not initialized');

    await setGuestPolicyOption(this.modPage, e.askModerator);
    await this.modPage.page.waitForTimeout(500);
    await this.initUserPage(this.context, {
      joinParameter: PRE_FLIGHT_PARAM,
      shouldCloseAudioModal: false,
      shouldCheckAllInitialSteps: false,
    });

    if (!this?.userPage) throw new Error('userPage not initialized');
    await this.userPage.hasElement(
      e.preFlightGuestRoom,
      'should display the pre-flight green room while waiting for approval',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.userPage.hasElement(
      e.preFlightVideoPreview,
      'should display the camera preview in the waiting room',
    );
    await this.userPage.hasElement(
      e.preFlightInputDeviceSelector,
      'should display the microphone selector in the waiting room',
    );
  }

  // Regression: closing the pre-flight without joining (ESC / X / click outside)
  // must reset audioModalIsOpen. The webcam dock is gated on !audioModalIsOpen,
  // so if the flag stayed true the dock would never render.
  async dismissWithoutJoiningKeepsWebcamDock() {
    if (!this?.modPage) throw new Error('modPage not initialized');

    await this.modPage.hasElement(e.preFlightModal, 'should display the pre-flight screen on join');
    // Dismiss without joining - ModalSimple closes via onRequestClose on ESC.
    await this.modPage.page.keyboard.press('Escape');
    await this.modPage.wasRemoved(
      e.preFlightModal,
      'should close the pre-flight screen when dismissed without joining',
    );
    // Sharing a webcam and seeing the dock proves audioModalIsOpen was reset:
    // a stuck-true flag would have hidden the dock entirely.
    await this.modPage.shareWebcam();
    await this.modPage.hasElement(
      e.webcamMirroredVideoContainer,
      'should render the webcam dock after dismissing the pre-flight',
    );
  }
}
