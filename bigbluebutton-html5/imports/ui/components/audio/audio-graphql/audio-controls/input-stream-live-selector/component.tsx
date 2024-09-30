/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useReactiveVar } from '@apollo/client';
import React, { useCallback, useEffect } from 'react';
import deviceInfo from '/imports/utils/deviceInfo';
import AudioManager from '/imports/ui/services/audio-manager';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { User } from '/imports/ui/Types/user';
import { defineMessages, useIntl } from 'react-intl';
import {
  handleLeaveAudio,
  liveChangeInputDevice,
  liveChangeOutputDevice,
  notify,
  toggleMuteMicrophone,
  toggleMuteMicrophoneSystem,
} from './service';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { Meeting } from '/imports/ui/Types/meeting';
import logger from '/imports/startup/client/logger';
import MutedAlert from '/imports/ui/components/muted-alert/component';
import MuteToggle from './buttons/muteToggle';
import ListenOnly from './buttons/listenOnly';
import LiveSelection from './buttons/LiveSelection';
import useWhoIsTalking from '/imports/ui/core/hooks/useWhoIsTalking';
import useWhoIsUnmuted from '/imports/ui/core/hooks/useWhoIsUnmuted';
import useToggleVoice from '/imports/ui/components/audio/audio-graphql/hooks/useToggleVoice';

const AUDIO_INPUT = 'audioinput';
const AUDIO_OUTPUT = 'audiooutput';
const DEFAULT_DEVICE = 'default';

const intlMessages = defineMessages({
  changeAudioDevice: {
    id: 'app.audio.changeAudioDevice',
    description: 'Change audio device button label',
  },
  leaveAudio: {
    id: 'app.audio.leaveAudio',
    description: 'Leave audio dropdown item label',
  },
  muteAudio: {
    id: 'app.actionsBar.muteLabel',
    description: 'Mute audio button label',
  },
  unmuteAudio: {
    id: 'app.actionsBar.unmuteLabel',
    description: 'Unmute audio button label',
  },
  deviceChangeFailed: {
    id: 'app.audioNotification.deviceChangeFailed',
    description: 'Device change failed',
  },
  defaultOutputDeviceLabel: {
    id: 'app.audio.audioSettings.defaultOutputDeviceLabel',
    description: 'Default output device label',
  },
});

interface InputStreamLiveSelectorContainerProps {
  openAudioSettings: (props?: { unmuteOnExit?: boolean }) => void;
}

interface InputStreamLiveSelectorProps extends InputStreamLiveSelectorContainerProps {
  isConnected: boolean;
  isPresenter: boolean;
  isModerator: boolean;
  isAudioLocked: boolean;
  listenOnly: boolean;
  muted: boolean;
  talking: boolean;
  inAudio: boolean;
  showMute: boolean;
  disabled: boolean;
  inputDeviceId: string;
  outputDeviceId: string;
  inputStream: string;
  meetingIsBreakout: boolean;
  away: boolean;
  permissionStatus: string;
  supportsTransparentListenOnly: boolean;
}

const InputStreamLiveSelector: React.FC<InputStreamLiveSelectorProps> = ({
  isConnected,
  isPresenter,
  isModerator,
  isAudioLocked,
  listenOnly,
  muted,
  talking,
  inAudio,
  showMute,
  disabled,
  inputDeviceId,
  outputDeviceId,
  inputStream,
  meetingIsBreakout,
  away,
  permissionStatus,
  supportsTransparentListenOnly,
  openAudioSettings,
}) => {
  const intl = useIntl();
  const toggleVoice = useToggleVoice();
  // eslint-disable-next-line no-undef
  const [inputDevices, setInputDevices] = React.useState<InputDeviceInfo[]>([]);
  const [outputDevices, setOutputDevices] = React.useState<MediaDeviceInfo[]>([]);
  const { isMobile } = deviceInfo;

  // @ts-ignore - temporary, while meteor exists in the project
  const { enableDynamicAudioDeviceSelection } = window.meetingClientSettings.public.app;
  // @ts-ignore - temporary, while meteor exists in the project
  const MUTE_ALERT_CONFIG = window.meetingClientSettings.public.app.mutedAlert;
  const { enabled: muteAlertEnabled } = MUTE_ALERT_CONFIG;

  const updateRemovedDevices = useCallback((
    audioInputDevices: MediaDeviceInfo[],
    audioOutputDevices: MediaDeviceInfo[],
  ) => {
    if (inputDeviceId
      && (inputDeviceId !== DEFAULT_DEVICE)
      && !audioInputDevices.find((d) => d.deviceId === inputDeviceId)) {
      const fallbackInputDevice = audioInputDevices[0];

      if (fallbackInputDevice?.deviceId) {
        logger.warn({
          logCode: 'audio_input_live_selector',
          extraInfo: {
            fallbackDeviceId: fallbackInputDevice?.deviceId,
            fallbackDeviceLabel: fallbackInputDevice?.label,
          },
        }, 'Current input device was removed. Fallback to default device');
        liveChangeInputDevice(fallbackInputDevice.deviceId).catch(() => {
          notify(intl.formatMessage(intlMessages.deviceChangeFailed), true);
        });
      }
    }

    if (outputDeviceId
      && (outputDeviceId !== DEFAULT_DEVICE)
      && !audioOutputDevices.find((d) => d.deviceId === outputDeviceId)) {
      const fallbackOutputDevice = audioOutputDevices[0];

      if (fallbackOutputDevice?.deviceId) {
        logger.warn({
          logCode: 'audio_output_live_selector',
          extraInfo: {
            fallbackDeviceId: fallbackOutputDevice?.deviceId,
            fallbackDeviceLabel: fallbackOutputDevice?.label,
          },
        }, 'Current output device was removed. Fallback to default device');
        liveChangeOutputDevice(fallbackOutputDevice.deviceId, true).catch(() => {
          notify(intl.formatMessage(intlMessages.deviceChangeFailed), true);
        });
      }
    }
  }, [inputDeviceId, outputDeviceId]);

  const updateDevices = useCallback(() => {
    navigator.mediaDevices.enumerateDevices()
      .then((devices) => {
        const audioInputDevices = devices.filter((i) => i.kind === AUDIO_INPUT);
        const audioOutputDevices = devices.filter((i) => i.kind === AUDIO_OUTPUT);
        setInputDevices(audioInputDevices as InputDeviceInfo[]);
        setOutputDevices(audioOutputDevices);

        if (inAudio) updateRemovedDevices(audioInputDevices, audioOutputDevices);
      })
      .catch((error) => {
        logger.warn({
          logCode: 'audio_device_enumeration_error',
          extraInfo: {
            errorMessage: error.message,
            errorName: error.name,
          },
        }, `Error enumerating audio devices: ${error.message}`);
      });
  }, [inAudio, inputDevices, outputDevices, updateRemovedDevices]);

  useEffect(() => {
    navigator.mediaDevices.addEventListener('devicechange', updateDevices);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', updateDevices);
    };
  }, [updateDevices]);

  useEffect(() => {
    if (enableDynamicAudioDeviceSelection) {
      updateDevices();
    }
  }, [permissionStatus]);

  useEffect(() => {
    // If the user has no input device, is connected to audio and unmuted,
    // they need to be *muted* by the system. Further attempts to unmute
    // will open the audio settings modal instead.
    if (inputDeviceId === 'listen-only' && isConnected && !muted) {
      toggleMuteMicrophoneSystem(muted, toggleVoice);
    }
  }, [inputDeviceId, isConnected, muted]);

  return (
    <>
      {inAudio && inputStream && muteAlertEnabled && !listenOnly && muted && showMute ? (
        <MutedAlert
          {...{
            muted, inputStream, isPresenter,
          }}
          isViewer={!isModerator}
        />
      ) : null}
      {

        enableDynamicAudioDeviceSelection ? (
          <LiveSelection
            listenOnly={listenOnly}
            inputDevices={inputDevices}
            outputDevices={outputDevices}
            inputDeviceId={inputDeviceId}
            outputDeviceId={outputDeviceId}
            meetingIsBreakout={meetingIsBreakout}
            talking={talking}
            muted={muted}
            disabled={disabled || isAudioLocked}
            isAudioLocked={isAudioLocked}
            toggleMuteMicrophone={toggleMuteMicrophone}
            away={away}
            supportsTransparentListenOnly={supportsTransparentListenOnly}
            openAudioSettings={openAudioSettings}
          />
        ) : (
          <>
            {(isConnected && !listenOnly) && (
              <MuteToggle
                talking={talking}
                muted={muted}
                disabled={disabled || isAudioLocked}
                isAudioLocked={isAudioLocked}
                toggleMuteMicrophone={toggleMuteMicrophone}
                away={away}
                openAudioSettings={openAudioSettings}
                noInputDevice={inputDeviceId === 'listen-only'}
              />
            )}
            <ListenOnly
              listenOnly={listenOnly}
              handleLeaveAudio={handleLeaveAudio}
              meetingIsBreakout={meetingIsBreakout}
              actAsDeviceSelector={enableDynamicAudioDeviceSelection && isMobile}
            />
          </>
        )
      }
    </>
  );
};

const InputStreamLiveSelectorContainer: React.FC<InputStreamLiveSelectorContainerProps> = ({
  openAudioSettings,
}) => {
  const { data: currentUser } = useCurrentUser((u: Partial<User>) => {
    if (!u.voice) {
      return {
        presenter: u.presenter,
        isModerator: u.isModerator,
      };
    }

    return {
      userId: u.userId,
      presenter: u.presenter,
      isModerator: u.isModerator,
      locked: u?.locked ?? false,
      away: u?.away,
      voice: {
        listenOnly: u?.voice?.listenOnly ?? false,
      },
    };
  });

  const { data: talkingUsers } = useWhoIsTalking();
  const { data: unmutedUsers } = useWhoIsUnmuted();
  const talking = Boolean(currentUser?.userId && talkingUsers[currentUser.userId]);
  const muted = Boolean(currentUser?.userId && !unmutedUsers[currentUser.userId]);

  const { data: currentMeeting } = useMeeting((m: Partial<Meeting>) => {
    return {
      lockSettings: m?.lockSettings,
      isBreakout: m?.isBreakout,
    };
  });
  // @ts-ignore - temporary while hybrid (meteor+GraphQl)
  const isConnected = useReactiveVar(AudioManager._isConnected.value) as boolean;
  // @ts-ignore - temporary while hybrid (meteor+GraphQl)
  const isConnecting = useReactiveVar(AudioManager._isConnecting.value) as boolean;
  // @ts-ignore - temporary while hybrid (meteor+GraphQl)
  const isHangingUp = useReactiveVar(AudioManager._isHangingUp.value) as boolean;
  // @ts-ignore - temporary while hybrid (meteor+GraphQl)
  const inputDeviceId = useReactiveVar(AudioManager._inputDeviceId.value) as string;
  // @ts-ignore - temporary while hybrid (meteor+GraphQl)
  // @ts-ignore - temporary while hybrid (meteor+GraphQl)
  const outputDeviceId = useReactiveVar(AudioManager._outputDeviceId.value) as string;
  // @ts-ignore - temporary while hybrid (meteor+GraphQl)
  const inputStream = useReactiveVar(AudioManager._inputStream) as string;
  // @ts-ignore - temporary while hybrid (meteor+GraphQl)
  const permissionStatus = useReactiveVar(AudioManager._permissionStatus.value) as string;
  // @ts-ignore - temporary while hybrid (meteor+GraphQl)
  const supportsTransparentListenOnly = useReactiveVar(AudioManager._transparentListenOnlySupported.value) as boolean;

  return (
    <InputStreamLiveSelector
      isPresenter={currentUser?.presenter ?? false}
      isModerator={currentUser?.isModerator ?? false}
      isAudioLocked={(!currentUser?.isModerator && currentUser?.locked
        && currentMeeting?.lockSettings?.disableMic) ?? false}
      listenOnly={currentUser?.voice?.listenOnly ?? false}
      muted={muted}
      talking={talking}
      inAudio={!!currentUser?.voice ?? false}
      showMute={(!!currentUser?.voice && !currentMeeting?.lockSettings?.disableMic) ?? false}
      isConnected={isConnected}
      disabled={isConnecting || isHangingUp}
      inputDeviceId={inputDeviceId}
      outputDeviceId={outputDeviceId}
      inputStream={inputStream}
      meetingIsBreakout={currentMeeting?.isBreakout ?? false}
      away={currentUser?.away ?? false}
      openAudioSettings={openAudioSettings}
      permissionStatus={permissionStatus}
      supportsTransparentListenOnly={supportsTransparentListenOnly}
    />
  );
};

export default InputStreamLiveSelectorContainer;
