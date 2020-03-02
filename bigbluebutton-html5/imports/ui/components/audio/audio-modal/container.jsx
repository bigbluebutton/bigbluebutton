import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import browser from 'browser-detect';
import getFromUserSettings from '/imports/ui/services/users-settings';
import AudioModal from './component';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import deviceInfo from '/imports/utils/deviceInfo';
import lockContextContainer from '/imports/ui/components/lock-viewers/context/container';
import AudioError from '/imports/ui/services/audio-manager/error-codes';
import AppService from '/imports/ui/components/app/service';
import {
  joinMicrophone,
  closeModal,
  joinListenOnly,
  leaveEchoTest,
  getcookieData,
} from './service';
import Service from '../service';

const AudioModalContainer = props => <AudioModal {...props} />;


const APP_CONFIG = Meteor.settings.public.app;

const invalidDialNumbers = ['0', '613-555-1212', '613-555-1234', '0000'];
const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

export default lockContextContainer(withModalMounter(withTracker(({ mountModal, userLocks }) => {
  const listenOnlyMode = getFromUserSettings('bbb_listen_only_mode', APP_CONFIG.listenOnlyMode);
  const forceListenOnly = getFromUserSettings('bbb_force_listen_only', APP_CONFIG.forceListenOnly);
  const skipCheck = getFromUserSettings('bbb_skip_check_audio', APP_CONFIG.skipCheck);
  const meeting = Meetings.findOne({ meetingId: Auth.meetingID }, { fields: { voiceProp: 1 } });
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

  const meetingIsBreakout = AppService.meetingIsBreakout();
  const { joinedAudio } = getcookieData();
  // const hasBreakoutRooms = AppService.getBreakoutRooms().length > 0;
  return ({
    joinedAudio,
    meetingIsBreakout,
    closeModal,
    joinMicrophone: skipEchoTest => joinMicrophone(skipEchoTest || skipCheck),
    joinListenOnly,
    leaveEchoTest,
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
    audioLocked: userLocks.userMic,
    joinFullAudioImmediately: !listenOnlyMode && skipCheck,
    joinFullAudioEchoTest: !listenOnlyMode && !skipCheck,
    forceListenOnlyAttendee: listenOnlyMode && forceListenOnly && !Service.isUserModerator(),
    isIOSChrome: browser().name === 'crios',
    isMobileNative: navigator.userAgent.toLowerCase().includes('bbbnative'),
    isIEOrEdge: browser().name === 'edge' || browser().name === 'ie',
    hasMediaDevices: deviceInfo.hasMediaDevices,
    autoplayBlocked: Service.autoplayBlocked(),
    handleAllowAutoplay: () => Service.handleAllowAutoplay(),
    isRTL,
    AudioError,
  });
})(AudioModalContainer)));
