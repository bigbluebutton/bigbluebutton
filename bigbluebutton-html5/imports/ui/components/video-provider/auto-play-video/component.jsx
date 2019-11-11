import React, { Component } from 'react';
import logger from '/imports/startup/client/logger';

const CAMERA_PROFILES = Meteor.settings.public.kurento.cameraProfiles;

class AutoPlayVideo extends Component {
  constructor(props) {
    super(props);
    this.setDefaultVideoDevice = this.setDefaultVideoDevice.bind(this);
  }

  componentDidMount() {
    const {
      skipVideoPreviewSettings,
      skipVideoPreviewParameter,
      autoShareWebcam,
    } = this.props;
    console.error(
      skipVideoPreviewSettings,
      skipVideoPreviewParameter,
      autoShareWebcam,
    );

    if (autoShareWebcam && (skipVideoPreviewSettings || skipVideoPreviewParameter)) {
      this.setDefaultVideoDevice();
    }

    window.addEventListener('bbb-auto-play-video', this.setDefaultVideoDevice);
  }

  setDefaultVideoDevice() {
    console.error('entrou aqui');

    const { webcamDeviceId, hasMediaDevices } = this.props;
    if (hasMediaDevices) {
      try {
        navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: 'user' } })
          .then((stream) => {
            this.deviceStream = stream;
            // try and get the deviceId for the initial stream
            let firstAllowedDeviceId;
            if (stream.getVideoTracks) {
              const videoTracks = stream.getVideoTracks();
              if (videoTracks.length > 0 && videoTracks[0].getSettings) {
                const trackSettings = videoTracks[0].getSettings();
                firstAllowedDeviceId = trackSettings.deviceId;
              }
            }

            navigator.mediaDevices.enumerateDevices().then((devices) => {
              const webcams = [];
              let initialDeviceId;
              // set webcam
              devices.forEach((device) => {
                if (device.kind === 'videoinput') {
                  webcams.push(device);
                  if (!initialDeviceId
                    || (webcamDeviceId && webcamDeviceId === device.deviceId)
                    || device.deviceId === firstAllowedDeviceId) {
                    initialDeviceId = device.deviceId;
                  }
                }
              });

              logger.debug({
                logCode: 'video_preview_enumerate_devices',
                extraInfo: {
                  devices,
                  webcams,
                },
              }, `Enumerate devices came back. There are ${devices.length} devices and ${webcams.length} are video inputs`);

              if (initialDeviceId) {
                const {
                  changeWebcam,
                  changeProfile,
                  startVideo,
                } = this.props;
                const availableProfiles = CAMERA_PROFILES;
                changeWebcam(initialDeviceId);

                if (availableProfiles.length > 0) {
                  const defaultProfile = availableProfiles.find(profile => profile.default)
                  || availableProfiles[0];
                  changeProfile(defaultProfile.id);
                  startVideo();
                }
              }
            }).catch((error) => {
              logger.warn({
                logCode: 'video_preview_enumerate_error',
                extraInfo: {
                  errorName: error.name,
                  errorMessage: error.message,
                },
              }, 'Error enumerating devices');
            });
          }).catch((error) => {
            logger.warn({
              logCode: 'video_preview_initial_device_error',
              extraInfo: {
                errorName: error.name,
                errorMessage: error.message,
              },
            }, 'Error getting initial device');
          });
      } catch (error) {
        logger.warn({
          logCode: 'video_preview_grabbing_error',
          extraInfo: {
            errorName: error.name,
            errorMessage: error.message,
          },
        }, 'Error grabbing initial video stream');
      }
    }
  }

  render() {
    return null;
  }
}

export default AutoPlayVideo;
