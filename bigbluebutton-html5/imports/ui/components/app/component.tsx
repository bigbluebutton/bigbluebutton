import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
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
import SidebarContentAuxiliaryContainer from '/imports/ui/components/sidebar-content/sidebar-content-auxiliary/container';
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
import WebRTCStatsObserver from '/imports/ui/components/stats/component';
import ChatAlertContainerGraphql from '../chat/chat-graphql/alert/component';
import VoiceActivityAdapter from '../../core/adapters/voice-activity';
import LayoutObserver from '../layout/observer';
import BBBLiveKitRoomContainer from '/imports/ui/components/livekit/component';
import { LAYOUT_TYPE } from '/imports/ui/components/layout/enums';
import AudioCaptionsLiveContainer from '/imports/ui/components/audio/audio-graphql/audio-captions/live/component';
import BreakoutRoomsAppObserver from '../breakout-room/breakout-observer/component';
import { DispatcherFunction } from '../layout/layoutTypes';
import { PluginConfigFromGraphql } from '../plugins-engine/types';
import useJoinLogger from './hooks/useJoinLogger';
import useAppInitialization from './hooks/useAppInitialization';
import usePollShortcut from './hooks/usePollShortcut';
import useUserStatusNotifications from './hooks/useUserStatusNotifications';
import { NotesRenderMode } from '/imports/ui/components/notes/constants';
import RequestPresenterContainer from '/imports/ui/components/request-presenter/container';

interface AppProps {
  darkTheme: boolean;
  hideNotificationToasts: boolean;
  isBreakout: boolean;
  meetingId: string;
  meetingName: string;
  currentUserAway?: boolean;
  currentUserRaiseHand?: boolean;
  currentUserHasVoice: boolean;
  shouldShowExternalVideo: boolean;
  shouldShowPresentation: boolean;
  shouldShowScreenshare: boolean;
  isSharedNotesPinned: boolean;
  presentationIsOpen: boolean;
  pluginConfig: PluginConfigFromGraphql[] | undefined;
  genericMainContentId: string;
  selectedLayout: typeof LAYOUT_TYPE[keyof typeof LAYOUT_TYPE];
  isNotificationEnabled: boolean;
  isNonMediaLayout: boolean;
  isRaiseHandEnabled: boolean;
  hideActionsBar: boolean;
  isPollingEnabled: boolean;
  layoutContextDispatch: DispatcherFunction;
}

const App: React.FC<AppProps> = ({
  darkTheme,
  hideNotificationToasts,
  isBreakout,
  meetingId,
  meetingName,
  currentUserAway,
  currentUserRaiseHand,
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
  currentUserHasVoice,
  hideActionsBar,
  isPollingEnabled,
  layoutContextDispatch,
}) => {
  const intl = useIntl();

  useAppInitialization();
  useJoinLogger(meetingId, meetingName, isBreakout);
  usePollShortcut(layoutContextDispatch, isPollingEnabled);
  useUserStatusNotifications(meetingId, currentUserAway, currentUserRaiseHand, intl);

  useEffect(() => {
    AppService.setDarkTheme(darkTheme);
  }, [darkTheme]);

  const renderActionsBar = () => {
    if (hideActionsBar) return null;

    return (
      <ActionsBarContainer
        presentationIsOpen={presentationIsOpen}
      />
    );
  };

  if (selectedLayout !== LAYOUT_TYPE.PRESENTATION_ONLY) {
    return (
      <>
        <BreakoutRoomsAppObserver />
        <WebRTCStatsObserver />
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
          <SidebarContentAuxiliaryContainer />
          <NavBarContainer main="new" />
          <WebcamContainer />
          {!isNonMediaLayout && <ExternalVideoPlayerContainer />}
          <GenericContentMainAreaContainer
            genericMainContentId={genericMainContentId}
          />
          {shouldShowPresentation ? (
            <PresentationContainer
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
          <AudioCaptionsLiveContainer />
          {!hideNotificationToasts && isNotificationEnabled && (
            <PresentationUploaderToastContainer intl={intl} />
          )}
          <BreakoutJoinConfirmationContainerGraphQL />
          <BBBLiveKitRoomContainer />
          <AudioContainer currentUserHasVoice={currentUserHasVoice} />
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
        <RequestPresenterContainer />
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
          darkTheme={darkTheme}
          presentationIsOpen={presentationIsOpen}
        />
      </Styled.Layout>
    </>
  );
};

export default App;
