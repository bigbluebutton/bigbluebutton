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
import LiveKitVoiceActivityAdapter from '../../core/adapters/livekit-voice-activity';
import LayoutObserver from '../layout/observer';
import LiveKitMembershipsManager from '/imports/ui/components/livekit/memberships-manager/component';
import { LAYOUT_TYPE } from '/imports/ui/components/layout/enums';
import AudioCaptionsLiveContainer from '/imports/ui/components/audio/audio-graphql/audio-captions/live/component';
import BreakoutRoomsAppObserver from '../breakout-room/breakout-observer/component';
import { DispatcherFunction } from '../layout/layoutTypes';
import { PluginConfigFromGraphql } from '../plugins-engine/types';
import useJoinLogger from './hooks/useJoinLogger';
import useAppInitialization from './hooks/useAppInitialization';
import usePollShortcut from './hooks/usePollShortcut';
import useUserStatusNotifications from './hooks/useUserStatusNotifications';
import useSystemThemeSync from './hooks/useSystemThemeSync';
import { NotesRenderMode } from '/imports/ui/components/notes/constants';
import RequestPresenterContainer from '/imports/ui/components/request-presenter/container';
import DocumentTitleManager from './document-title-manager/component';
import ProfiledSubtree from '/imports/ui/core/telemetry/ProfiledSubtree';

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
  useSystemThemeSync();

  useEffect(() => {
    AppService.setDarkTheme(darkTheme);
  }, [darkTheme]);

  const renderActionsBar = () => {
    if (hideActionsBar) return null;

    return (
      <ProfiledSubtree id="actions-bar">
        <ActionsBarContainer
          presentationIsOpen={presentationIsOpen}
        />
      </ProfiledSubtree>
    );
  };

  if (selectedLayout !== LAYOUT_TYPE.PRESENTATION_ONLY) {
    return (
      <ProfiledSubtree id="app">
        <BreakoutRoomsAppObserver />
        <WebRTCStatsObserver />
        <ScreenReaderAlertAdapter />
        <ProfiledSubtree id="plugins">
          <PluginsEngineManager pluginConfig={pluginConfig} />
        </ProfiledSubtree>
        <FloatingWindowContainer />
        <Notifications />
        <PushLayoutEngine
          shouldShowScreenshare={shouldShowScreenshare}
          shouldShowExternalVideo={shouldShowExternalVideo}
        />
        <ProfiledSubtree id="layout-engine">
          <LayoutEngine />
        </ProfiledSubtree>
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
          <DocumentTitleManager />
          <RequestUnmuteContainer />
          <ScreenReaderAlertContainer />
          <BannerBarContainer />
          <NotificationsBarContainer />
          <ProfiledSubtree id="sidebar-navigation">
            <SidebarNavigationContainer />
          </ProfiledSubtree>
          <SidebarContentContainer isSharedNotesPinned={isSharedNotesPinned} />
          <SidebarContentAuxiliaryContainer />
          <ProfiledSubtree id="nav-bar">
            <NavBarContainer main="new" />
          </ProfiledSubtree>
          <ProfiledSubtree id="webcams">
            <WebcamContainer />
          </ProfiledSubtree>
          {!isNonMediaLayout && (
            <ProfiledSubtree id="external-video">
              <ExternalVideoPlayerContainer />
            </ProfiledSubtree>
          )}
          <GenericContentMainAreaContainer
            genericMainContentId={genericMainContentId}
          />
          {shouldShowPresentation ? (
            <ProfiledSubtree id="presentation">
              <PresentationContainer
                darkTheme={darkTheme}
                presentationIsOpen={presentationIsOpen}
              />
            </ProfiledSubtree>
          ) : null}
          {!isNonMediaLayout && (
            <ProfiledSubtree id="screenshare">
              <ScreenshareContainer shouldShowScreenshare={shouldShowScreenshare} />
            </ProfiledSubtree>
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
          <LiveKitMembershipsManager />
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
          <LiveKitVoiceActivityAdapter />
        </Styled.Layout>
        <RequestPresenterContainer />
      </ProfiledSubtree>
    );
  }

  // Only load presentation for presentationOnly
  return (
    <ProfiledSubtree id="app">
      <ScreenReaderAlertAdapter />
      <ProfiledSubtree id="plugins">
        <PluginsEngineManager pluginConfig={pluginConfig} />
      </ProfiledSubtree>
      {/* The plugins engine consumes voice state in this layout too. */}
      <LiveKitVoiceActivityAdapter />
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
        <ProfiledSubtree id="presentation">
          <PresentationContainer
            darkTheme={darkTheme}
            presentationIsOpen={presentationIsOpen}
          />
        </ProfiledSubtree>
      </Styled.Layout>
    </ProfiledSubtree>
  );
};

export default App;
