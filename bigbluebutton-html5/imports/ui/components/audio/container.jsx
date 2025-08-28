import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import Session from '/imports/ui/services/storage/in-memory';
import { injectIntl, defineMessages } from 'react-intl';
import { range } from '/imports/utils/array-utils';
import { useMeetingIsBreakout } from '/imports/ui/components/app/service';
import { notify } from '/imports/ui/services/notification';
import getFromUserSettings from '/imports/ui/services/users-settings';
import VideoPreviewContainer from '/imports/ui/components/video-preview/container';
import lockContextContainer from '/imports/ui/components/lock-viewers/context/container';
import {
  joinMicrophone,
  joinListenOnly,
} from '/imports/ui/components/audio/audio-modal/service';

import Service from './service';
import AudioModalContainer from './audio-modal/container';
import useToggleVoice from './audio-graphql/hooks/useToggleVoice';
import usePreviousValue from '/imports/ui/hooks/usePreviousValue';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { toggleMuteMicrophone } from '/imports/ui/components/audio/audio-graphql/audio-controls/input-stream-live-selector/service';
import useSettings from '../../services/settings/hooks/useSettings';
import { SETTINGS } from '../../services/settings/enums';
import { useStorageKey } from '../../services/storage/hooks';
import useMeeting from '../../core/hooks/useMeeting';
import useWhoIsUnmuted from '../../core/hooks/useWhoIsUnmuted';
import AudioService, {
  CLIENT_DID_USER_SELECT_MICROPHONE_KEY,
  CLIENT_DID_USER_SELECT_LISTEN_ONLY_KEY,
} from '/imports/ui/components/audio/service';

const intlMessages = defineMessages({
  joinedAudio: {
    id: 'app.audioManager.joinedAudio',
    description: 'Joined audio toast message',
  },
  joinedEcho: {
    id: 'app.audioManager.joinedEcho',
    description: 'Joined echo test toast message',
  },
  leftAudio: {
    id: 'app.audioManager.leftAudio',
    description: 'Left audio toast message',
  },
  reconnectingAudio: {
    id: 'app.audioManager.reconnectingAudio',
    description: 'Reconnecting audio toast message',
  },
  genericError: {
    id: 'app.audioManager.genericError',
    description: 'Generic error message',
  },
  connectionError: {
    id: 'app.audioManager.connectionError',
    description: 'Connection error message',
  },
  requestTimeout: {
    id: 'app.audioManager.requestTimeout',
    description: 'Request timeout error message',
  },
  invalidTarget: {
    id: 'app.audioManager.invalidTarget',
    description: 'Invalid target error message',
  },
  mediaError: {
    id: 'app.audioManager.mediaError',
    description: 'Media error message',
  },
  BrowserNotSupported: {
    id: 'app.audioNotification.audioFailedError1003',
    description: 'browser not supported error message',
  },
  reconectingAsListener: {
    id: 'app.audioNotificaion.reconnectingAsListenOnly',
    description: 'ice negotiation error message',
  },
});

let didMountAutoJoin = false;

const webRtcError = range(1001, 1011)
  .reduce((acc, value) => ({
    ...acc,
    [value]: { id: `app.audioNotification.audioFailedError${value}` },
  }), {});

const messages = {
  info: {
    JOINED_AUDIO: intlMessages.joinedAudio,
    JOINED_ECHO: intlMessages.joinedEcho,
    LEFT_AUDIO: intlMessages.leftAudio,
    RECONNECTING_AUDIO: intlMessages.reconnectingAudio,
  },
  error: {
    GENERIC_ERROR: intlMessages.genericError,
    CONNECTION_ERROR: intlMessages.connectionError,
    REQUEST_TIMEOUT: intlMessages.requestTimeout,
    INVALID_TARGET: intlMessages.invalidTarget,
    MEDIA_ERROR: intlMessages.mediaError,
    WEBRTC_NOT_SUPPORTED: intlMessages.BrowserNotSupported,
    ...webRtcError,
  },
};

const AudioContainer = (props) => {
  const {
    isAudioModalOpen,
    setAudioModalIsOpen,
    setVideoPreviewModalIsOpen,
    isVideoPreviewModalOpen,
    intl,
    userLocks,
  } = props;

  const APP_CONFIG = window.meetingClientSettings.public.app;
  const KURENTO_CONFIG = window.meetingClientSettings.public.kurento;

  const autoJoin = getFromUserSettings('bbb_auto_join_audio', APP_CONFIG.autoJoin);
  const enableVideo = getFromUserSettings('bbb_enable_video', KURENTO_CONFIG.enableVideo);
  const autoShareWebcam = getFromUserSettings('bbb_auto_share_webcam', KURENTO_CONFIG.autoShareWebcam);
  const { userWebcam } = userLocks;

  const prevProps = usePreviousValue(props);
  const toggleVoice = useToggleVoice();
  const userSelectedMicrophone = !!useStorageKey(CLIENT_DID_USER_SELECT_MICROPHONE_KEY, 'session');
  const userSelectedListenOnly = !!useStorageKey(CLIENT_DID_USER_SELECT_LISTEN_ONLY_KEY, 'session');
  const { microphoneConstraints } = useSettings(SETTINGS.APPLICATION);

  const meetingIsBreakout = useMeetingIsBreakout();
  const { data: meeting } = useMeeting((m) => ({
    audioBridge: m.audioBridge,
    voiceSettings: {
      voiceConf: m?.voiceSettings?.voiceConf,
      muteOnStart: m?.voiceSettings?.muteOnStart,
    },
  }));

  const { data: currentUser } = useCurrentUser((u) => ({
    userId: u.userId,
    name: u.name,
    speechLocale: u.speechLocale,
    breakoutRoomsSummary: u.breakoutRoomsSummary,
  }));

  const hasBreakoutRooms = (currentUser?.breakoutRoomsSummary?.totalOfBreakoutRooms ?? 0) > 0;

  // public.media.defaultFullAudioBridge/public.media.defaultListenOnlyBridge
  // are legacy configs. They will be removed in the future. Use
  // audioBridge (bbb-web, create) instead.
  const {
    defaultFullAudioBridge,
    defaultListenOnlyBridge,
  } = window.meetingClientSettings.public.media || {};
  const bridges = {
    fullAudioBridge: meeting?.audioBridge ?? defaultFullAudioBridge,
    listenOnlyBridge: meeting?.audioBridge ?? defaultListenOnlyBridge,
  };
  const openAudioModal = () => setAudioModalIsOpen(true);

  const openVideoPreviewModal = () => {
    if (userWebcam) return;
    setVideoPreviewModalIsOpen(true);
  };

  const init = async () => {
    await Service.init(
      messages,
      intl,
      toggleVoice,
      currentUser?.speechLocale,
      meeting?.voiceSettings?.voiceConf,
      currentUser?.name,
      bridges,
    );

    if ((!autoJoin || didMountAutoJoin)) {
      if (enableVideo && autoShareWebcam) {
        openVideoPreviewModal();
      }
      return Promise.resolve(false);
    }
    Session.setItem('audioModalIsOpen', true);
    if (enableVideo && autoShareWebcam) {
      openAudioModal();
      openVideoPreviewModal();
      didMountAutoJoin = true;
    } else if (!(
      userSelectedMicrophone
      && userSelectedListenOnly
      && meetingIsBreakout)) {
      openAudioModal();
      didMountAutoJoin = true;
    }
    return Promise.resolve(true);
  };

  const { hasBreakoutRooms: hadBreakoutRooms } = prevProps || {};
  const userIsReturningFromBreakoutRoom = hadBreakoutRooms && !hasBreakoutRooms;

  const { data: unmutedUsers } = useWhoIsUnmuted();
  const currentUserMuted = currentUser?.userId && !unmutedUsers[currentUser.userId];

  const joinAudio = useCallback(() => {
    if (Service.isConnected()) return;

    if (userSelectedMicrophone) {
      joinMicrophone({ skipEchoTest: true, muted: meeting?.voiceSettings?.muteOnStart });
      return;
    }

    if (userSelectedListenOnly) joinListenOnly();
  }, [userSelectedMicrophone, userSelectedListenOnly, meeting?.voiceSettings?.muteOnStart]);

  useEffect(() => {
    // Data is not loaded yet.
    // We don't know whether the meeting is a breakout or not.
    // So, postpone the decision.
    if (meetingIsBreakout === undefined) return;

    init().then(() => {
      if (meetingIsBreakout && !Service.isUsingAudio()) {
        joinAudio();
      }
    });
  }, [meetingIsBreakout]);

  useEffect(() => {
    if (userIsReturningFromBreakoutRoom) {
      joinAudio();
    }
  }, [userIsReturningFromBreakoutRoom]);

  useEffect(() => {
    const CONFIRMATION_ON_LEAVE = window.meetingClientSettings.public.app.askForConfirmationOnLeave;
    if (CONFIRMATION_ON_LEAVE) {
      window.onbeforeunload = (event) => {
        if (AudioService.isUsingAudio() && !AudioService.isMuted()) {
          toggleVoice(currentUser?.userId, true);
        }
        event.stopImmediatePropagation();
        event.preventDefault();
        // eslint-disable-next-line no-param-reassign
        event.returnValue = '';
      };
    }
  }, [currentUser?.userId, toggleVoice]);

  useEffect(() => {
    if (Service.isConnected() && !Service.isListenOnly()) {
      Service.updateAudioConstraints(microphoneConstraints);
    }
  }, [microphoneConstraints]);

  useEffect(() => {
    if (Service.isConnected() && !Service.isListenOnly()) {
      if (userLocks.userMic && !currentUserMuted) {
        toggleMuteMicrophone(
          !currentUserMuted,
          toggleVoice,
        );
        notify(intl.formatMessage(intlMessages.reconectingAsListener), 'info', 'volume_level_2');
      }
    }
  }, [userLocks.userMic, currentUserMuted]);

  return (
    <>
      {isAudioModalOpen && !isVideoPreviewModalOpen ? (
        <AudioModalContainer
          {...{
            priority: 'medium',
            setIsOpen: setAudioModalIsOpen,
            isOpen: isAudioModalOpen && !isVideoPreviewModalOpen,
          }}
        />
      ) : null}
      {isVideoPreviewModalOpen ? (
        <VideoPreviewContainer
          {...{
            callbackToClose: () => {
              setVideoPreviewModalIsOpen(false);
            },
            priority: 'medium',
            setIsOpen: setVideoPreviewModalIsOpen,
            isOpen: isVideoPreviewModalOpen,
          }}
        />
      ) : null}
    </>
  );
};

export default lockContextContainer(injectIntl(AudioContainer));

AudioContainer.propTypes = {
  isAudioModalOpen: PropTypes.bool.isRequired,
  setAudioModalIsOpen: PropTypes.func.isRequired,
  setVideoPreviewModalIsOpen: PropTypes.func.isRequired,
  isVideoPreviewModalOpen: PropTypes.bool.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  userLocks: PropTypes.shape({
    userMic: PropTypes.bool.isRequired,
  }).isRequired,
};
