import React, {
  useState, useEffect, useCallback,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import PollingContainer from '/imports/ui/components/polling/container';
import ActivityCheckContainer from '/imports/ui/components/activity-check/container';
import RequestUnmuteContainer from '/imports/ui/components/request-unmute-modal/container';
import ToastContainer from '/imports/ui/components/common/toast/container';
import WakeLockContainer from '../wake-lock/container';
import NotificationsBarContainer from '../notifications-bar/container';
import AudioContainer from '../audio/container';
import BannerBarContainer from '/imports/ui/components/banner-bar/container';
import RaiseHandNotifier from '/imports/ui/components/raisehand-notifier/container';
import ManyWebcamsNotifier from '/imports/ui/components/video-provider/many-users-notify/container';
import AudioCaptionsSpeechContainer from '/imports/ui/components/audio/audio-graphql/audio-captions/speech/component';
import ScreenReaderAlertContainer from '../screenreader-alert/container';
import ScreenReaderAlertAdapter from '../screenreader-alert/adapter';
import WebcamContainer from '../webcam/component';
import PresentationContainer from '../presentation/container';
import ScreenshareContainer from '../screenshare/container';
import ExternalVideoPlayerContainer from '../external-video-player/external-video-player-graphql/component';
import GenericContentMainAreaContainer from '../generic-content/generic-main-content/container';
import EmojiRainContainer from '../emoji-rain/container';
import Styled from './styles';
import LayoutEngine from '../layout/layout-manager/layoutEngine';
import NavBarContainer from '../nav-bar/container';
import SidebarNavigationContainer from '../sidebar-navigation/container';
import SidebarContentContainer from '../sidebar-content/container';
import PluginsEngineManager from '../plugins-engine/manager';
import Notifications from '../notifications/component';
import GlobalStyles from '/imports/ui/stylesheets/styled-components/globalStyles';
import ActionsBarContainer from '../actions-bar/container';
import PushLayoutEngine from '../layout/push-layout/pushLayoutEngine';
import NotesContainer from '/imports/ui/components/notes/component';
import AppService from '/imports/ui/components/app/service';
import PresentationUploaderToastContainer from '/imports/ui/components/presentation/presentation-toast/presentation-uploader-toast/container';
import BreakoutJoinConfirmationContainerGraphQL from '../breakout-join-confirmation/breakout-join-confirmation-graphql/component';
import FloatingWindowContainer from '/imports/ui/components/floating-window/container';
import ChatAlertContainerGraphql from '../chat/chat-graphql/alert/component';
import VoiceActivityAdapter from '../../core/adapters/voice-activity';
import LayoutObserver from '../layout/observer';
import BBBLiveKitRoomContainer from '/imports/ui/components/livekit/component';
import { LAYOUT_TYPE } from '/imports/ui/components/layout/enums';
import BreakoutRoomsAppObserver from '../breakout-room/breakout-observer/component';
import { DispatcherFunction } from '../layout/layoutTypes';
import { PluginConfigFromGraphql } from '../plugins-engine/types';
import useJoinLogger from './hooks/useJoinLogger';
import useAppInitialization from './hooks/useAppInitialization';
import usePollShortcut from './hooks/usePollShortcut';
import useUserStatusNotifications from './hooks/useUserStatusNotifications';
import NotesRenderMode from '/imports/ui/components/notes/constants';

interface AppProps {
  darkTheme: boolean;
  hideNotificationToasts: boolean;
  isBreakout: boolean;
  meetingId: string;
  meetingName: string;
  currentUserAway?: boolean;
  currentUserRaiseHand?: boolean;
  fitToWidth: boolean;
  shouldShowExternalVideo: boolean;
  shouldShowPresentation: boolean;
  shouldShowScreenshare: boolean;
  isSharedNotesPinned: boolean;
  presentationIsOpen: boolean;
  pluginConfig: PluginConfigFromGraphql[] | undefined;
  genericMainContentId: string;
  selectedLayout: string;
  isNotificationEnabled: boolean;
  isNonMediaLayout: boolean;
  isRaiseHandEnabled: boolean;
  hideActionsBar: boolean;
  audioCaptions: React.ReactNode;
  captionsStyle: {
    left: number;
    right: number;
    maxWidth: number;
  };
  isPollingEnabled: boolean;
  layoutContextDispatch: DispatcherFunction;
  handlePresentationFitToWidth: (fitToWidth: boolean) => void;
}
const messages = defineMessages({
  captions: {
    id: 'app.audio.captions.live.captions',
    description: 'Accessible label for the audio captions region',
  },
});

const App: React.FC<AppProps> = ({
  darkTheme,
  hideNotificationToasts,
  isBreakout,
  meetingId,
  meetingName,
  currentUserAway,
  currentUserRaiseHand,
  fitToWidth,
  shouldShowExternalVideo,
  shouldShowPresentation,
  shouldShowScreenshare,
  isSharedNotesPinned,
  presentationIsOpen,
  pluginConfig,
  genericMainContentId,
  selectedLayout,
  isNotificationEnabled,
  isNonMediaLayout,
  isRaiseHandEnabled,
  hideActionsBar,
  audioCaptions,
  captionsStyle,
  isPollingEnabled,
  layoutContextDispatch,
  handlePresentationFitToWidth,
}) => {
  const intl = useIntl();
  // State
  const [isAudioModalOpen, setIsAudioModalOpen] = useState<boolean>(false);
  const [isVideoPreviewModalOpen, setIsVideoPreviewModalOpen] = useState<boolean>(false);
  const [presentationFitToWidth, setPresentationFitToWidth] = useState<boolean>(false);

  useAppInitialization();
  useJoinLogger(meetingId, meetingName, isBreakout);
  usePollShortcut(layoutContextDispatch, isPollingEnabled);
  useUserStatusNotifications(currentUserAway, currentUserRaiseHand, intl);

  useEffect(() => {
    AppService.setDarkTheme(darkTheme);
  }, [darkTheme]);

  useEffect(() => {
    setPresentationFitToWidth(fitToWidth);
  }, [fitToWidth]);

  const handleSetPresentationFitToWidth = useCallback((fitToWidth: boolean) => {
    handlePresentationFitToWidth(fitToWidth);
    setPresentationFitToWidth(fitToWidth);
  }, [handlePresentationFitToWidth]);

  const renderActionsBar = () => {
    if (hideActionsBar) return null;

    return (
      <ActionsBarContainer
        presentationIsOpen={presentationIsOpen}
        setPresentationFitToWidth={handleSetPresentationFitToWidth}
      />
    );
  };

  const renderAudioCaptions = () => {
    if (!audioCaptions) return null;

    return (
      <Styled.CaptionsWrapper
        as="section"
        aria-label={intl.formatMessage(messages.captions)}
        style={{
          position: 'absolute',
          left: captionsStyle.left,
          right: captionsStyle.right,
          maxWidth: captionsStyle.maxWidth,
        }}
      >
        {audioCaptions}
      </Styled.CaptionsWrapper>
    );
  };

  if (selectedLayout !== LAYOUT_TYPE.PRESENTATION_ONLY) {
    return (
      <>
        <BreakoutRoomsAppObserver />
        <ScreenReaderAlertAdapter />
        <PluginsEngineManager pluginConfig={pluginConfig} />
        <FloatingWindowContainer />
        <Notifications />
        <PushLayoutEngine
          shouldShowScreenshare={shouldShowScreenshare}
          shouldShowExternalVideo={shouldShowExternalVideo}
        />
        <LayoutEngine />
        <LayoutObserver />
        <GlobalStyles />
        <Styled.Layout
          id="layout"
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          <ActivityCheckContainer />
          <RequestUnmuteContainer />
          <ScreenReaderAlertContainer />
          <BannerBarContainer />
          <NotificationsBarContainer />
          <SidebarNavigationContainer />
          <SidebarContentContainer isSharedNotesPinned={isSharedNotesPinned} />
          <NavBarContainer main="new" />
          <WebcamContainer />
          {!isNonMediaLayout && <ExternalVideoPlayerContainer />}
          <GenericContentMainAreaContainer
            genericMainContentId={genericMainContentId}
          />
          {shouldShowPresentation ? (
            <PresentationContainer
              setPresentationFitToWidth={handleSetPresentationFitToWidth}
              fitToWidth={presentationFitToWidth}
              darkTheme={darkTheme}
              presentationIsOpen={presentationIsOpen}
            />
          ) : null}
          {!isNonMediaLayout && (
            <ScreenshareContainer shouldShowScreenshare={shouldShowScreenshare} />
          )}
          {isSharedNotesPinned ? (
            <NotesContainer
              renderMode={NotesRenderMode.PINNED}
            />
          ) : null}
          <AudioCaptionsSpeechContainer />
          {renderAudioCaptions()}
          {!hideNotificationToasts && isNotificationEnabled && (
            <PresentationUploaderToastContainer intl={intl} />
          )}
          <BreakoutJoinConfirmationContainerGraphQL />
          <BBBLiveKitRoomContainer />
          <AudioContainer
            isAudioModalOpen={isAudioModalOpen}
            setAudioModalIsOpen={setIsAudioModalOpen}
            isVideoPreviewModalOpen={isVideoPreviewModalOpen}
            setVideoPreviewModalIsOpen={setIsVideoPreviewModalOpen}
          />
          {!hideNotificationToasts && isNotificationEnabled && (
            <ToastContainer rtl />
          )}
          <ChatAlertContainerGraphql />
          {isRaiseHandEnabled && <RaiseHandNotifier />}
          <ManyWebcamsNotifier />
          <PollingContainer />
          <WakeLockContainer />
          {renderActionsBar()}
          <EmojiRainContainer />
          <VoiceActivityAdapter />
        </Styled.Layout>
      </>
    );
  }

  // Only load presentation for presentationOnly
  return (
    <>
      <ScreenReaderAlertAdapter />
      <PluginsEngineManager pluginConfig={pluginConfig} />
      <LayoutEngine />
      <LayoutObserver />
      <GlobalStyles />
      <Styled.Layout
        id="layout"
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <ScreenReaderAlertContainer />
        <PresentationContainer
          setPresentationFitToWidth={setPresentationFitToWidth}
          fitToWidth={presentationFitToWidth}
          darkTheme={darkTheme}
          presentationIsOpen={presentationIsOpen}
        />
      </Styled.Layout>
    </>
  );
};

export default App;
