import React, {
  useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { ThemeProvider } from '@mui/material/styles';
import Styled from './styles';
import SetupPanel from './setup-panel/component';
import { PreFlightErrorDialog } from './error-screen/component';
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
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import { setDarkTheme } from '/imports/ui/components/app/service';
import muiThemes from '/imports/ui/services/theme/mui';
import useMediaQuery from '/imports/ui/hooks/useMediaQuery';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';

const intlMessages = defineMessages({
  title: {
    id: 'app.preFlight.title',
    description: 'Title of the pre-flight setup panel',
  },
});

export interface PreFlightError {
  header: React.ReactNode;
  actions: React.ReactNode;
  // Closing the phone dialog.
  onClose: () => void;
}

interface PreFlightProps {
  // The session heading and whatever states it: above the panel on a phone,
  // beside it otherwise.
  header: React.ReactNode;
  topInfo?: React.ReactNode;
  // What commits the setup - the join button. Rendered after the panel in both
  // layouts, so it never precedes the controls it commits.
  actions?: React.ReactNode;
  // Off for an invalid guest and for one denied before the panel came up: no
  // camera stream and no microphone prompt.
  showSetupPanel?: boolean;
  // An error that interrupts the screen: it takes the header's and the
  // actions' place beside the panel, and opens as a dialog over the unchanged
  // screen on a phone.
  error?: PreFlightError | null;
}

const PreFlight: React.FC<PreFlightProps> = ({
  header,
  topInfo = null,
  actions = null,
  showSetupPanel = true,
  error = null,
}) => {
  const intl = useIntl();
  const loadingContextInfo = useContext(LoadingContext);
  const { data: currentUserData, loading: currentUserLoading } = useCurrentUser((u) => ({
    isModerator: u.isModerator,
  }));
  const isRoleLoaded = !currentUserLoading && !!currentUserData;
  const { canUseMicrophone, canListenOnly } = getAudioModeAvailability(!!currentUserData?.isModerator);
  // The screen mounts outside App, so nothing has resolved the theme yet: the
  // boot script only knows what was persisted, while the setting also carries
  // bbb_prefer_dark_theme and the system preference.
  const { darkTheme } = useSettings(SETTINGS.APPLICATION) as { darkTheme?: boolean };
  const isPhoneWidth = useMediaQuery(smallOnly);

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
  const [cameraFailed, setCameraFailed] = useState(false);
  const commitCameraRef = useRef<(() => void) | null>(null);
  const audioModeTouched = useRef(false);

  useEffect(() => {
    setDarkTheme(darkTheme);
  }, [darkTheme]);

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

    const willShareCamera = shareCamera && !cameraFailed;

    setPreFlightShareCamera(willShareCamera);
    if (willShareCamera) commitCameraRef.current?.();

    setPreFlightCompleted(true);
  }, [audioMode, joinMuted, shareCamera, cameraFailed]);

  const contextValue = useMemo(() => ({
    audioMode,
    setAudioMode,
    joinMuted,
    setJoinMuted,
    shareCamera,
    setShareCamera,
    cameraFailed,
    setCameraFailed,
    commitCameraRef,
    commit,
  }), [audioMode, setAudioMode, joinMuted, setJoinMuted, shareCamera, cameraFailed, commit]);

  return (
    <PreFlightContext.Provider value={contextValue}>
      {/* The device selectors and the virtual background controls are MUI, whose
          surfaces come from its own theme rather than the palette's variables. */}
      <ThemeProvider theme={darkTheme ? muiThemes.dark : muiThemes.light}>
        <Styled.Page data-test="preFlight">
          {isPhoneWidth && (
            <Styled.HeaderColumn>
              {topInfo}
              {header}
            </Styled.HeaderColumn>
          )}
          {showSetupPanel && (
            <Styled.SetupColumn>
              <Styled.PanelTitle>{intl.formatMessage(intlMessages.title)}</Styled.PanelTitle>
              <CustomBackgroundsProvider>
                <SetupPanel />
              </CustomBackgroundsProvider>
            </Styled.SetupColumn>
          )}
          <Styled.ContentColumn>
            {!isPhoneWidth && topInfo && <Styled.TopInfo>{topInfo}</Styled.TopInfo>}
            {!isPhoneWidth && error ? (
              <Styled.CenterStack>
                {error.header}
                <Styled.ActionBar>{error.actions}</Styled.ActionBar>
              </Styled.CenterStack>
            ) : (
              <Styled.CenterStack>
                {!isPhoneWidth && header}
                {actions && <Styled.ActionBar>{actions}</Styled.ActionBar>}
              </Styled.CenterStack>
            )}
          </Styled.ContentColumn>
        </Styled.Page>
        {isPhoneWidth && error && (
          <PreFlightErrorDialog onClose={error.onClose}>
            {error.header}
            {error.actions}
          </PreFlightErrorDialog>
        )}
      </ThemeProvider>
    </PreFlightContext.Provider>
  );
};

export default PreFlight;
