import { useReactiveVar } from "@apollo/client";
import React, { useCallback, useEffect, useMemo } from "react";
import deviceInfo from '/imports/utils/deviceInfo';
import AudioManager from "/imports/ui/services/audio-manager";
import { useCurrentUser } from "/imports/ui/core/hooks/useCurrentUser";
import { User } from "/imports/ui/Types/user";
import { defineMessages, useIntl } from "react-intl";
import { useShortcutHelp } from "/imports/ui/core/hooks/useShortcutHelp";
import BBBMenu from '/imports/ui/components/common/menu/component';
import Styled from './styles';
import Settings from '/imports/ui/services/settings';
import { handleLeaveAudio, liveChangeInputDevice, liveChangeOutputDevice, notify, toggleMuteMicrophone, truncateDeviceName } from "./service";
import { useMeeting } from "/imports/ui/core/hooks/useMeeting";
import { Meeting } from "/imports/ui/Types/meeting";
import logger from '/imports/startup/client/logger';
import Auth from '/imports/ui/services/auth';
import MutedAlert from '/imports/ui/components/muted-alert/component';
import Mutetoggle from "./buttons/muteToggle";
import ListenOnly from "./buttons/listenOnly";
import LiveSelection from "./buttons/LiveSelection";


const enableDynamicAudioDeviceSelection = Meteor.settings.public.app.enableDynamicAudioDeviceSelection;
const animations = Settings.application.animations;

const AUDIO_INPUT = 'audioinput';
const AUDIO_OUTPUT = 'audiooutput';
const DEFAULT_DEVICE = 'default';
const SET_SINK_ID_SUPPORTED = 'setSinkId' in HTMLMediaElement.prototype;
const MUTE_ALERT_CONFIG = Meteor.settings.public.app.mutedAlert;
const { enabled: muteAlertEnabled } = MUTE_ALERT_CONFIG;

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


interface InputStreamLiveSelectorProps {
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
}) => {
  const intl = useIntl();
  const [inputDevices, setInputDevices] = React.useState<InputDeviceInfo[]>([]);
  const [outputDevices, setOutputDevices] = React.useState<MediaDeviceInfo[]>([]);
  const { isMobile } = deviceInfo;

  const updateDevices = (isAudioConnected: boolean) => {
    navigator.mediaDevices.enumerateDevices()
      .then((devices) => {
        const audioInputDevices = devices.filter((i) => i.kind === AUDIO_INPUT);
        const audioOutputDevices = devices.filter((i) => i.kind === AUDIO_OUTPUT);
        setInputDevices(audioInputDevices);
        setOutputDevices(audioOutputDevices);
      });
    if (isAudioConnected) {
      updateRemovedDevices(inputDevices, outputDevices);
    }
  };

  const fallbackInputDevice = useCallback((fallbackDevice: MediaDeviceInfo) => {
    if (!fallbackDevice || !fallbackDevice.deviceId) return;

    logger.info({
      logCode: 'audio_device_live_selector',
      extraInfo: {
        userId: Auth.userID,
        meetingId: Auth.meetingID,
      },
    }, 'Current input device was removed. Fallback to default device');
    liveChangeInputDevice(fallbackDevice.deviceId).catch((error) => {
      notify(intl.formatMessage(intlMessages.deviceChangeFailed), true);
    });
  }, []);

  const fallbackOutputDevice = useCallback((fallbackDevice: MediaDeviceInfo) => {
    if (!fallbackDevice || !fallbackDevice.deviceId) return;
    logger.info({
      logCode: 'audio_device_live_selector',
      extraInfo: {
        userId: Auth.userID,
        meetingId: Auth.meetingID,
      },
    }, 'Current output device was removed. Fallback to default device');
    liveChangeOutputDevice(fallbackDevice.deviceId, true).catch((error) => {
      notify(intl.formatMessage(intlMessages.deviceChangeFailed), true);
    });
  }, []);

  const updateRemovedDevices = useCallback((
    audioInputDevices: MediaDeviceInfo[],
    audioOutputDevices: MediaDeviceInfo[],
  ) => {
    if (inputDeviceId
      && (inputDeviceId !== DEFAULT_DEVICE)
      && !audioInputDevices.find((d) => d.deviceId === inputDeviceId)) {
      fallbackInputDevice(audioInputDevices[0]);
    }

    if (outputDeviceId
      && (outputDeviceId !== DEFAULT_DEVICE)
      && !audioOutputDevices.find((d) => d.deviceId === outputDeviceId)) {
      fallbackOutputDevice(audioOutputDevices[0]);
    }
  }, [inputDeviceId]);

  useEffect(() => {
    if (enableDynamicAudioDeviceSelection && !isMobile) {
      updateDevices(inAudio);
    }
  }, [inAudio]);

  return (
    <div>
      {inAudio && inputStream && muteAlertEnabled && !listenOnly && muted && showMute ? (
        <MutedAlert {...{
          muted, inputStream, isPresenter,
        }}
          isViewer={!isModerator}
        />
      ) : null}
      {

        enableDynamicAudioDeviceSelection && !isMobile ? (
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
          />
        ) : (
          <>
            {(isConnected && !listenOnly) && <Mutetoggle
              talking={talking}
              muted={muted}
              disabled={disabled || isAudioLocked}
              isAudioLocked={isAudioLocked}
              toggleMuteMicrophone={toggleMuteMicrophone}
            />}
            <ListenOnly
              listenOnly={listenOnly}
              handleLeaveAudio={handleLeaveAudio}
              meetingIsBreakout={meetingIsBreakout}
            />
          </>
        )
      }
    </div>
  );
};

const InputStreamLiveSelectorContainer: React.FC = () => {
  const currentUser: Partial<User> = useCurrentUser((u: Partial<User>) => {
    if (!u.voice) {
      return {
        presenter: u.presenter,
        isModerator: u.isModerator,
        voice: null
      }
    }

    return {
      userId: u.userId,
      presenter: u.presenter,
      isModerator: u.isModerator,
      locked: u?.locked ?? false,
      voice: {
        muted: u?.voice?.muted ?? false,
        listenOnly: u?.voice?.listenOnly ?? false,
        talking: u?.voice?.talking ?? false,
      }
    }
  });

  const currentMeeting: Partial<Meeting> = useMeeting((m: Partial<Meeting>) => {
    return {
      lockSettings: m?.lockSettings,
      isBreakout: m?.isBreakout,
    }
  });
  const isConnected = useReactiveVar(AudioManager._isConnected.value) as boolean;
  const isConnecting = useReactiveVar(AudioManager._isConnecting.value) as boolean;
  const isHangingUp = useReactiveVar(AudioManager._isHangingUp.value) as boolean;
  const inputDeviceId = useReactiveVar(AudioManager._inputDeviceId.value) as string;
  const outputDeviceId = useReactiveVar(AudioManager._outputDeviceId.value) as string;
  const inputStream = useReactiveVar(AudioManager._inputStream) as string;
  return <InputStreamLiveSelector
    isPresenter={currentUser?.presenter ?? false}
    isModerator={currentUser?.isModerator ?? false}
    isAudioLocked={(!currentUser?.isModerator && currentUser?.locked && currentMeeting?.lockSettings?.disableMic) ?? false}
    listenOnly={currentUser?.voice?.listenOnly ?? false}
    muted={currentUser?.voice?.muted ?? false}
    talking={currentUser?.voice?.talking ?? false}
    inAudio={!!currentUser?.voice ?? false}
    showMute={(!!currentUser?.voice && !currentMeeting?.lockSettings?.disableMic) ?? false}
    isConnected={isConnected}
    disabled={isConnecting || isHangingUp}
    inputDeviceId={inputDeviceId}
    outputDeviceId={outputDeviceId}
    inputStream={inputStream}
    meetingIsBreakout={currentMeeting?.isBreakout ?? false}
  />;
};


export default InputStreamLiveSelectorContainer;