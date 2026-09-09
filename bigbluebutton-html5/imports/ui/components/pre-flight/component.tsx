import React, {
  useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';
import SetupPanel from './setup-panel/component';
import PreFlightContext, { AUDIO_MODES, AudioMode } from './context';
import { setPreFlightCompleted, setPreFlightShareCamera } from './service';
import { getAudioModeAvailability } from './audio-options';
import { LoadingContext } from '/imports/ui/components/common/loading-screen/loading-screen-HOC/component';
import AudioService, {
  setUserSelectedListenOnly,
  setUserSelectedMicrophone,
} from '/imports/ui/components/audio/service';
import Storage from '/imports/ui/services/storage/session';
import { CustomBackgroundsProvider } from '/imports/ui/components/video-preview/virtual-background/context';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import getFromUserSettings from '/imports/ui/services/users-settings';
import meetingStaticData from '/imports/ui/core/singletons/meetingStaticData';

const intlMessages = defineMessages({
  title: {
    id: 'app.preFlight.title',
    description: 'Title of the pre-flight setup panel',
  },
});

interface PreFlightProps {
  children: React.ReactNode;
  // A denied or invalid guest gets no camera stream and no microphone prompt.
  showSetupPanel?: boolean;
}

const PreFlight: React.FC<PreFlightProps> = ({ children, showSetupPanel = true }) => {
  const intl = useIntl();
  const loadingContextInfo = useContext(LoadingContext);
  const { data: currentUserData, loading: currentUserLoading } = useCurrentUser((u) => ({
    isModerator: u.isModerator,
  }));
  const isRoleLoaded = !currentUserLoading && !!currentUserData;
  const { canUseMicrophone, canListenOnly } = getAudioModeAvailability(!!currentUserData?.isModerator);

  const [audioMode, setAudioModeState] = useState<AudioMode>(
    canUseMicrophone ? AUDIO_MODES.MICROPHONE : AUDIO_MODES.LISTEN_ONLY,
  );
  const [joinMuted, setJoinMutedState] = useState(
    () => !!meetingStaticData.getMeetingData()?.voiceSettings?.muteOnStart,
  );
  const [shareCamera, setShareCamera] = useState(() => {
    const KURENTO_CONFIG = window.meetingClientSettings.public.kurento;
    const enableVideo = getFromUserSettings('bbb_enable_video', KURENTO_CONFIG.enableVideo);
    const autoShareWebcam = getFromUserSettings('bbb_auto_share_webcam', KURENTO_CONFIG.autoShareWebcam);
    return !!enableVideo && !!autoShareWebcam;
  });
  const commitCameraRef = useRef<(() => void) | null>(null);
  const audioModeTouched = useRef(false);

  useEffect(() => {
    if (loadingContextInfo.isLoading) {
      loadingContextInfo.setLoading(false);
    }
  }, [loadingContextInfo.isLoading]);

  // The role only arrives on a later render, so the default is re-derived when
  // it lands - unless the user has already picked a mode.
  useEffect(() => {
    if (!isRoleLoaded || audioModeTouched.current) return;
    setAudioModeState(canUseMicrophone ? AUDIO_MODES.MICROPHONE : AUDIO_MODES.LISTEN_ONLY);
  }, [isRoleLoaded, canUseMicrophone]);

  // Keep an explicit choice within what the meeting allows.
  useEffect(() => {
    if (!isRoleLoaded) return;
    if (!canUseMicrophone && audioMode === AUDIO_MODES.MICROPHONE) {
      setAudioModeState(AUDIO_MODES.LISTEN_ONLY);
    }
    if (!canListenOnly && canUseMicrophone && audioMode === AUDIO_MODES.LISTEN_ONLY) {
      setAudioModeState(AUDIO_MODES.MICROPHONE);
    }
  }, [isRoleLoaded, canUseMicrophone, canListenOnly, audioMode]);

  const setAudioMode = useCallback((mode: AudioMode) => {
    audioModeTouched.current = true;
    setAudioModeState(mode);
  }, []);

  const setJoinMuted = useCallback((muted: boolean) => {
    setJoinMutedState(muted);
  }, []);

  const commit = useCallback(() => {
    const listenOnly = audioMode === AUDIO_MODES.LISTEN_ONLY;

    setUserSelectedMicrophone(!listenOnly);
    setUserSelectedListenOnly(listenOnly);

    if (!listenOnly) {
      Storage.setItem(AudioService.getStorageMuteStateKey(), joinMuted);
    }

    setPreFlightShareCamera(shareCamera);
    if (shareCamera) commitCameraRef.current?.();

    setPreFlightCompleted(true);
  }, [audioMode, joinMuted, shareCamera]);

  const contextValue = useMemo(() => ({
    audioMode,
    setAudioMode,
    joinMuted,
    setJoinMuted,
    shareCamera,
    setShareCamera,
    commitCameraRef,
    commit,
  }), [audioMode, setAudioMode, joinMuted, setJoinMuted, shareCamera, commit]);

  return (
    <PreFlightContext.Provider value={contextValue}>
      <Styled.Page data-test="preFlight">
        {showSetupPanel && (
          <Styled.SetupColumn>
            <Styled.PanelTitle>{intl.formatMessage(intlMessages.title)}</Styled.PanelTitle>
            <CustomBackgroundsProvider>
              <SetupPanel />
            </CustomBackgroundsProvider>
          </Styled.SetupColumn>
        )}
        <Styled.ContentColumn>
          {children}
        </Styled.ContentColumn>
      </Styled.Page>
    </PreFlightContext.Provider>
  );
};

export default PreFlight;
