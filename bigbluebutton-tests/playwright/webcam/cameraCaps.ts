import { expect, Page as PlaywrightPage } from '@playwright/test';

import { elements as e } from '../core/elements';
import { MultiUsers } from '../user/multiusers';

const SECOND_CAMERA_ID = 'second-fake-camera';
const SECOND_CAMERA_LABEL = 'Second fake camera';

// Chromium's file-backed fake camera is the only video input, and the client only offers
// a second camera when it lists two. This lists a second one that opens the same file.
// Must run before the page loads the client.
export async function addSecondFakeCamera(page: PlaywrightPage) {
  await page.addInitScript(
    ({ deviceId, label }) => {
      const { enumerateDevices, getUserMedia } = MediaDevices.prototype;
      MediaDevices.prototype.enumerateDevices = async function enumerateWithSecondCamera() {
        const devices = await enumerateDevices.call(this);
        if (!devices.some((device) => device.kind === 'videoinput')) return devices;
        const secondCamera = { deviceId, groupId: deviceId, kind: 'videoinput', label };
        return [...devices, { ...secondCamera, toJSON: () => secondCamera } as MediaDeviceInfo];
      };
      MediaDevices.prototype.getUserMedia = function getUserMediaWithSecondCamera(constraints) {
        const video = constraints?.video;
        if (video && typeof video === 'object' && video.deviceId) {
          const requested = video.deviceId;
          const requestedIds =
            typeof requested === 'object' && !Array.isArray(requested)
              ? [requested.exact, requested.ideal].flat()
              : [requested].flat();
          if (requestedIds.includes(deviceId)) {
            const firstCameraConstraints = { ...video };
            delete firstCameraConstraints.deviceId;
            return getUserMedia.call(this, { ...constraints, video: firstCameraConstraints }).then((stream) => {
              stream.getVideoTracks().forEach((track) => {
                const { getSettings } = track;
                Object.defineProperty(track, 'label', { value: label });
                Object.assign(track, { getSettings: () => ({ ...getSettings.call(track), deviceId }) });
              });
              return stream;
            });
          }
        }
        return getUserMedia.call(this, constraints);
      };
    },
    { deviceId: SECOND_CAMERA_ID, label: SECOND_CAMERA_LABEL },
  );
}

export class CameraCaps extends MultiUsers {
  async userCameraCap() {
    await this.modPage.shareWebcam();
    await this.modPage.waitAndClick(e.videoDropdownMenu);
    await this.modPage.waitAndClick(e.advancedVideoSettingsBtn);
    await this.modPage.hasElement(e.webcamSettingsModal, 'should open the webcam settings to add a camera');
    await this.modPage.page.locator(e.webcamDeviceSelector).selectOption({ label: SECOND_CAMERA_LABEL });
    await this.modPage.hasText(
      e.webcamSettingsModal,
      e.userCamCapReachedLabel,
      'should refuse a second camera when the user camera cap is 1',
    );
    await this.modPage.wasRemoved(e.startSharingWebcam, 'should not offer to share the second camera');
    await this.modPage.waitAndClick(e.closeModal);
    await this.modPage.hasElementCount(e.webcamVideoItem, 1, 'should keep sharing a single camera');
  }

  async meetingCameraCap() {
    await this.modPage.shareWebcam();
    await this.userPage.hasElement(e.webcamVideoItem, 'should display the moderator webcam for the attendee');
    await this.userPage.hasElementDisabled(
      e.joinVideo,
      'should not let the attendee share a camera while the meeting is at its camera cap',
    );
    await expect(
      this.userPage.page.locator(e.joinVideo),
      'should tell the attendee that the meeting reached its camera cap',
    ).toHaveAccessibleName(e.meetingCamCapReachedLabel);

    await this.modPage.waitAndClick(e.leaveVideo);
    await this.userPage.hasElementEnabled(
      e.joinVideo,
      'should let the attendee share a camera once the moderator stopped sharing',
    );
    await this.userPage.shareWebcam();
    await this.modPage.hasElementDisabled(
      e.joinVideo,
      'should not let the moderator share a camera while the attendee holds the only one',
    );
  }
}
