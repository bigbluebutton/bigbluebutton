import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import browser from 'browser-detect';
import getFromUserSettings from '/imports/ui/services/users-settings';
import AudioModal from './component';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import Service from '../service';

const AudioModalContainer = props => <AudioModal {...props} />;

const APP_CONFIG = Meteor.settings.public.app;


export default withModalMounter(withTracker(({ mountModal }) => {
  const listenOnlyMode = getFromUserSettings('listenOnlyMode', APP_CONFIG.listenOnlyMode);
  const forceListenOnly = getFromUserSettings('forceListenOnly', APP_CONFIG.forceListenOnly);
  const skipCheck = getFromUserSettings('skipCheck', APP_CONFIG.skipCheck);
  const meeting = Meetings.findOne({ meetingId: Auth.meetingID });
  const invalidDialNumbers = ['0', '613-555-1212', '613-555-1234', '0000'];
  let formattedDialNum = '';
  let formattedTelVoice = '';
  let combinedDialInNum = '';
  if (meeting && meeting.voiceProp) {
    const { dialNumber, telVoice } = meeting.voiceProp;
    if (invalidDialNumbers.indexOf(dialNumber) < 0) {
      formattedDialNum = dialNumber;
      formattedTelVoice = telVoice;
      combinedDialInNum = `${dialNumber.replace(/\D+/g, '')},,,${telVoice.replace(/\D+/g, '')}`;
    }
  }

  // We do no support Unified Plan SDP, but Safari 12.3 only ships with
  // Unified Plan so we need to detect and warn
  const isUnifiedPlanDefault = () => {
    // Safari supports addTransceiver() but not Unified Plan when
    // currentDirection is not defined.
    if (!('currentDirection' in RTCRtpTransceiver.prototype)) return false;
    // If Unified Plan is supported, addTransceiver() should not throw.
    const tempPc = new RTCPeerConnection();
    let canAddTransceiver = false;
    try {
      tempPc.addTransceiver('audio');
      canAddTransceiver = true;
    } catch (e) {
    }
    tempPc.close();
    return canAddTransceiver;
  };

  return ({
    closeModal: () => {
      if (!Service.isConnecting()) mountModal(null);
    },
    joinMicrophone: () => {
      const call = new Promise((resolve, reject) => {
        if (skipCheck) {
          resolve(Service.joinMicrophone());
        } else {
          resolve(Service.transferCall());
        }
        reject(() => {
          Service.exitAudio();
        });
      });

      return call.then(() => {
        mountModal(null);
      }).catch((error) => {
        throw error;
      });
    },
    joinListenOnly: () => Service.joinListenOnly().then(() => mountModal(null)),
    leaveEchoTest: () => {
      if (!Service.isEchoTest()) {
        return Promise.resolve();
      }
      return Service.exitAudio();
    },
    changeInputDevice: inputDeviceId => Service.changeInputDevice(inputDeviceId),
    changeOutputDevice: outputDeviceId => Service.changeOutputDevice(outputDeviceId),
    joinEchoTest: () => Service.joinEchoTest(),
    exitAudio: () => Service.exitAudio(),
    isConnecting: Service.isConnecting(),
    isConnected: Service.isConnected(),
    isEchoTest: Service.isEchoTest(),
    inputDeviceId: Service.inputDeviceId(),
    outputDeviceId: Service.outputDeviceId(),
    showPermissionsOvelay: Service.isWaitingPermissions(),
    listenOnlyMode,
    skipCheck,
    formattedDialNum,
    formattedTelVoice,
    combinedDialInNum,
    audioLocked: Service.audioLocked(),
    joinFullAudioImmediately: !listenOnlyMode && skipCheck,
    joinFullAudioEchoTest: !listenOnlyMode && !skipCheck,
    forceListenOnlyAttendee: listenOnlyMode && forceListenOnly && !Service.isUserModerator(),
    isIOSChrome: browser().name === 'crios',
    isMobileNative: navigator.userAgent.toLowerCase().includes('bbbnative'),
    isIEOrEdge: browser().name === 'edge' || browser().name === 'ie',
    blockSafari123: browser().name === 'safari' && Meteor.settings.public.media.blockSafari12_3 === true && isUnifiedPlanDefault(),
    isMobile: browser().mobile,
  });
})(AudioModalContainer));
