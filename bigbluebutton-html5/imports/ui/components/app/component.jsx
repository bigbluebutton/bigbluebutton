import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import ReactModal from 'react-modal';
import browserInfo from '/imports/utils/browserInfo';
import deviceInfo from '/imports/utils/deviceInfo';
import Session from '/imports/ui/services/storage/in-memory';
import PollingContainer from '/imports/ui/components/polling/container';
import logger from '/imports/startup/client/logger';
import ActivityCheckContainer from '/imports/ui/components/activity-check/container';
import ToastContainer from '/imports/ui/components/common/toast/container';
import KEY_CODES from '/imports/utils/keyCodes';
import WakeLockContainer from '../wake-lock/container';
import NotificationsBarContainer from '../notifications-bar/container';
import AudioContainer from '../audio/container';
import BannerBarContainer from '/imports/ui/components/banner-bar/container';
import RaiseHandNotifier from '/imports/ui/components/raisehand-notifier/container';
import ManyWebcamsNotifier from '/imports/ui/components/video-provider/many-users-notify/container';
import AudioCaptionsSpeechContainer from '/imports/ui/components/audio/audio-graphql/audio-captions/speech/component';
import UploaderContainer from '/imports/ui/components/presentation/presentation-uploader/container';
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
import { PANELS, ACTIONS } from '../layout/enums';
import GlobalStyles from '/imports/ui/stylesheets/styled-components/globalStyles';
import ActionsBarContainer from '../actions-bar/container';
import PushLayoutEngine from '../layout/push-layout/pushLayoutEngine';
import NotesContainer from '/imports/ui/components/notes/component';
import AppService from '/imports/ui/components/app/service';
import TimeSync from './app-graphql/time-sync/component';
import PresentationUploaderToastContainer from '/imports/ui/components/presentation/presentation-toast/presentation-uploader-toast/container';
import BreakoutJoinConfirmationContainerGraphQL from '../breakout-join-confirmation/breakout-join-confirmation-graphql/component';
import FloatingWindowContainer from '/imports/ui/components/floating-window/container';
import ChatAlertContainerGraphql from '../chat/chat-graphql/alert/component';
import { notify } from '/imports/ui/services/notification';
import VoiceActivityAdapter from '../../core/adapters/voice-activity';
import LayoutObserver from '../layout/observer';
import BBBLiveKitRoomContainer from '/imports/ui/components/livekit/component';

const intlMessages = defineMessages({
  userListLabel: {
    id: 'app.userList.label',
    description: 'Aria-label for Userlist Nav',
  },
  chatLabel: {
    id: 'app.chat.label',
    description: 'Aria-label for Chat Section',
  },
  actionsBarLabel: {
    id: 'app.actionsBar.label',
    description: 'Aria-label for ActionsBar Section',
  },
  clearedReaction: {
    id: 'app.toast.clearedReactions.label',
    description: 'message for cleared reactions',
  },
  raisedHand: {
    id: 'app.toast.setEmoji.raiseHand',
    description: 'toast message for raised hand notification',
  },
  loweredHand: {
    id: 'app.toast.setEmoji.lowerHand',
    description: 'toast message for lowered hand notification',
  },
  away: {
    id: 'app.toast.setEmoji.away',
    description: 'toast message for set away notification',
  },
  notAway: {
    id: 'app.toast.setEmoji.notAway',
    description: 'toast message for remove away notification',
  },
  meetingMuteOn: {
    id: 'app.toast.meetingMuteOn.label',
    description: 'message used when meeting has been muted',
  },
  meetingMuteOff: {
    id: 'app.toast.meetingMuteOff.label',
    description: 'message used when meeting has been unmuted',
  },
  pollPublishedLabel: {
    id: 'app.whiteboard.annotations.poll',
    description: 'message displayed when a poll is published',
  },
  defaultViewLabel: {
    id: 'app.title.defaultViewLabel',
    description: 'view name appended to document title',
  },
  promotedLabel: {
    id: 'app.toast.promotedLabel',
    description: 'notification message when promoted',
  },
  demotedLabel: {
    id: 'app.toast.demotedLabel',
    description: 'notification message when demoted',
  },
});

const propTypes = {
  darkTheme: PropTypes.bool.isRequired,
  hideNotificationToasts: PropTypes.bool.isRequired,
  isBreakout: PropTypes.bool.isRequired,
  meetingId: PropTypes.string.isRequired,
  meetingName: PropTypes.string.isRequired,
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAudioModalOpen: false,
      isVideoPreviewModalOpen: false,
      presentationFitToWidth: false,
      isJoinLogged: false,
    };

    this.timeOffsetInterval = null;

    this.setPresentationFitToWidth = this.setPresentationFitToWidth.bind(this);
    this.setAudioModalIsOpen = this.setAudioModalIsOpen.bind(this);
    this.setVideoPreviewModalIsOpen = this.setVideoPreviewModalIsOpen.bind(this);
    this.customPollShortcutHandler = this.customPollShortcutHandler.bind(this);
    this.logJoin = this.logJoin.bind(this);
  }

  componentDidMount() {
    const { browserName } = browserInfo;
    const { osName } = deviceInfo;
    const { isJoinLogged } = this.state;
    const { isPollingEnabled } = this.props;

    Session.setItem('videoPreviewFirstOpen', true);

    ReactModal.setAppElement('#app');

    const body = document.getElementsByTagName('body')[0];

    if (browserName) {
      body.classList.add(`browser-${browserName.split(' ').pop().toLowerCase()}`);
    }

    body.classList.add(`os-${osName.split(' ').shift().toLowerCase()}`);

    window.ondragover = (e) => { e.preventDefault(); };
    window.ondrop = (e) => { e.preventDefault(); };

    if (isPollingEnabled) {
      window.addEventListener('keydown', this.customPollShortcutHandler);
    }

    if (!isJoinLogged) {
      this.logJoin();
    }

    AppService.initializeEmojiData();
  }

  componentDidUpdate(prevProps) {
    const {
      currentUserAway,
      currentUserRaiseHand,
      intl,
      fitToWidth,
    } = this.props;

    const { isJoinLogged } = this.state;

    this.renderDarkMode();

    if (prevProps.currentUserAway !== currentUserAway) {
      if (currentUserAway === true) {
        notify(intl.formatMessage(intlMessages.away), 'info', 'user');
      } else {
        notify(intl.formatMessage(intlMessages.notAway), 'info', 'clear_status');
      }
    }

    if (prevProps.currentUserRaiseHand !== currentUserRaiseHand) {
      if (currentUserRaiseHand === true) {
        notify(intl.formatMessage(intlMessages.raisedHand), 'info', 'user');
      } else {
        notify(intl.formatMessage(intlMessages.loweredHand), 'info', 'clear_status');
      }
    }

    if (prevProps.fitToWidth !== fitToWidth) {
      this.setState({ presentationFitToWidth: fitToWidth });
    }

    if (!isJoinLogged) {
      this.logJoin();
    }
  }

  componentWillUnmount() {
    const { isPollingEnabled } = this.props;
    window.onbeforeunload = null;

    if (this.timeOffsetInterval) {
      clearInterval(this.timeOffsetInterval);
    }

    if (isPollingEnabled) {
      window.removeEventListener('keydown', this.customPollShortcutHandler);
    }
  }

  setPresentationFitToWidth(presentationFitToWidth) {
    const { handlePresentationFitToWidth } = this.props;
    handlePresentationFitToWidth(presentationFitToWidth);
    this.setState({ presentationFitToWidth });
  }

  setAudioModalIsOpen(value) {
    this.setState({ isAudioModalOpen: value });
  }

  setVideoPreviewModalIsOpen(value) {
    this.setState({ isVideoPreviewModalOpen: value });
  }

  customPollShortcutHandler(e) {
    const {
      altKey, ctrlKey, metaKey, keyCode,
    } = e;
    const { layoutContextDispatch } = this.props;
    const isPollShortcut = altKey && keyCode === KEY_CODES.P && (ctrlKey || metaKey);

    if (isPollShortcut) {
      if (Session.equals('pollInitiated', true)) {
        Session.setItem('resetPollPanel', true);
      }

      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
        value: true,
      });
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
        value: PANELS.POLL,
      });

      Session.setItem('forcePollOpen', true);
      Session.setItem('customPollShortcut', true);
    }
  }

  logJoin() {
    const { isJoinLogged } = this.state;
    const { meetingId, meetingName, isBreakout } = this.props;

    const logMessage = isBreakout ? 'User joined breakout room' : 'User joined main room';

    if (!isJoinLogged && meetingId) {
      logger.info({
        logCode: 'app_component_componentdidmount',
        extraInfo: {
          meetingId,
          meetingName,
        },
      }, logMessage);
      this.setState({ isJoinLogged: true });
    }
  }

  renderDarkMode() {
    const { darkTheme } = this.props;

    AppService.setDarkTheme(darkTheme);
  }

  renderActionsBar() {
    const {
      hideActionsBar,
      presentationIsOpen,
    } = this.props;

    if (hideActionsBar) return null;

    return (
      <ActionsBarContainer
        presentationIsOpen={presentationIsOpen}
        setPresentationFitToWidth={this.setPresentationFitToWidth}
      />
    );
  }

  renderAudioCaptions() {
    const {
      audioCaptions,
      captionsStyle,
    } = this.props;

    if (!audioCaptions) return null;

    return (
      <Styled.CaptionsWrapper
        role="region"
        style={
          {
            position: 'absolute',
            left: captionsStyle.left,
            right: captionsStyle.right,
            maxWidth: captionsStyle.maxWidth,
          }
        }
      >
        {audioCaptions}
      </Styled.CaptionsWrapper>
    );
  }

  render() {
    const {
      shouldShowExternalVideo,
      shouldShowPresentation,
      shouldShowScreenshare,
      isSharedNotesPinned,
      presentationIsOpen,
      darkTheme,
      intl,
      pluginConfig,
      genericMainContentId,
      hideNotificationToasts,
      isNotificationEnabled,
      isNonMediaLayout,
      isRaiseHandEnabled,
    } = this.props;

    const {
      isAudioModalOpen,
      isVideoPreviewModalOpen,
      presentationFitToWidth,
    } = this.state;
    return (
      <>
        <ScreenReaderAlertAdapter />
        <PluginsEngineManager pluginConfig={pluginConfig} />
        <FloatingWindowContainer />
        <TimeSync />
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
          <ScreenReaderAlertContainer />
          <BannerBarContainer />
          <NotificationsBarContainer />
          <SidebarNavigationContainer />
          <SidebarContentContainer isSharedNotesPinned={isSharedNotesPinned} />
          <NavBarContainer main="new" />
          <WebcamContainer />
          {
            !isNonMediaLayout
              && <ExternalVideoPlayerContainer />
          }
          <GenericContentMainAreaContainer
            genericMainContentId={genericMainContentId}
          />
          {
          shouldShowPresentation
            ? (
              <PresentationContainer
                setPresentationFitToWidth={this.setPresentationFitToWidth}
                fitToWidth={presentationFitToWidth}
                darkTheme={darkTheme}
                presentationIsOpen={presentationIsOpen}
              />
            )
            : null
            }
          {
            !isNonMediaLayout
            && <ScreenshareContainer shouldShowScreenshare={shouldShowScreenshare} />
          }

          {isSharedNotesPinned
            ? (
              <NotesContainer
                area="media"
              />
            ) : null}
          <AudioCaptionsSpeechContainer />
          {this.renderAudioCaptions()}
          { (
            !hideNotificationToasts
            && isNotificationEnabled) && <PresentationUploaderToastContainer intl={intl} /> }
          <UploaderContainer />
          <BreakoutJoinConfirmationContainerGraphQL />
          <BBBLiveKitRoomContainer />
          <AudioContainer {...{
            isAudioModalOpen,
            setAudioModalIsOpen: this.setAudioModalIsOpen,
            isVideoPreviewModalOpen,
            setVideoPreviewModalIsOpen: this.setVideoPreviewModalIsOpen,
          }}
          />
          { (
            !hideNotificationToasts
            && isNotificationEnabled) && <ToastContainer rtl /> }
          <ChatAlertContainerGraphql />
          {isRaiseHandEnabled && <RaiseHandNotifier />}
          <ManyWebcamsNotifier />
          <PollingContainer />
          <WakeLockContainer />
          {this.renderActionsBar()}
          <EmojiRainContainer />
          <VoiceActivityAdapter />
        </Styled.Layout>
      </>
    );
  }
}

App.propTypes = propTypes;

export default injectIntl(App);
