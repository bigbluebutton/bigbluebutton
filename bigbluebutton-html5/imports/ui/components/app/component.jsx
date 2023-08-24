import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { throttle } from 'lodash';
import { defineMessages, injectIntl } from 'react-intl';
import Modal from 'react-modal';
import browserInfo from '/imports/utils/browserInfo';
import deviceInfo from '/imports/utils/deviceInfo';
import PollingContainer from '/imports/ui/components/polling/container';
import logger from '/imports/startup/client/logger';
import ActivityCheckContainer from '/imports/ui/components/activity-check/container';
import UserInfoContainer from '/imports/ui/components/user-info/container';
import BreakoutRoomInvitation from '/imports/ui/components/breakout-room/invitation/container';
import { Meteor } from 'meteor/meteor';
import ToastContainer from '/imports/ui/components/common/toast/container';
import PadsSessionsContainer from '/imports/ui/components/pads/sessions/container';
import ModalContainer from '/imports/ui/components/common/modal/container';
import NotificationsBarContainer from '../notifications-bar/container';
import AudioContainer from '../audio/container';
import ChatAlertContainer from '../chat/alert/container';
import BannerBarContainer from '/imports/ui/components/banner-bar/container';
import StatusNotifier from '/imports/ui/components/status-notifier/container';
import ManyWebcamsNotifier from '/imports/ui/components/video-provider/many-users-notify/container';
import AudioCaptionsSpeechContainer from '/imports/ui/components/audio/captions/speech/container';
import UploaderContainer from '/imports/ui/components/presentation/presentation-uploader/container';
import CaptionsSpeechContainer from '/imports/ui/components/captions/speech/container';
import RandomUserSelectContainer from '/imports/ui/components/common/modal/random-user/container';
import ScreenReaderAlertContainer from '../screenreader-alert/container';
import NewWebcamContainer from '../webcam/container';
import PresentationAreaContainer from '../presentation/presentation-area/container';
import ScreenshareContainer from '../screenshare/container';
import ExternalVideoContainer from '../external-video-player/container';
import Styled from './styles';
import { DEVICE_TYPE, ACTIONS, SMALL_VIEWPORT_BREAKPOINT, PANELS } from '../layout/enums';
import {
  isMobile, isTablet, isTabletPortrait, isTabletLandscape, isDesktop,
} from '../layout/utils';
import LayoutEngine from '../layout/layout-manager/layoutEngine';
import NavBarContainer from '../nav-bar/container';
import SidebarNavigationContainer from '../sidebar-navigation/container';
import SidebarContentContainer from '../sidebar-content/container';
import { makeCall } from '/imports/ui/services/api';
import ConnectionStatusService from '/imports/ui/components/connection-status/service';
import Settings from '/imports/ui/services/settings';
import { registerTitleView } from '/imports/utils/dom-utils';
import Notifications from '../notifications/container';
import GlobalStyles from '/imports/ui/stylesheets/styled-components/globalStyles';
import ActionsBarContainer from '../actions-bar/container';
import PushLayoutEngine from '../layout/push-layout/pushLayoutEngine';
import AudioService from '/imports/ui/components/audio/service';
import NotesContainer from '/imports/ui/components/notes/container';
import DEFAULT_VALUES from '../layout/defaultValues';
import AppService from '/imports/ui/components/app/service';

const MOBILE_MEDIA = 'only screen and (max-width: 40em)';
const APP_CONFIG = Meteor.settings.public.app;
const DESKTOP_FONT_SIZE = APP_CONFIG.desktopFontSize;
const MOBILE_FONT_SIZE = APP_CONFIG.mobileFontSize;
const LAYOUT_CONFIG = Meteor.settings.public.layout;
const CONFIRMATION_ON_LEAVE = Meteor.settings.public.app.askForConfirmationOnLeave;

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
  clearedEmoji: {
    id: 'app.toast.clearedEmoji.label',
    description: 'message for cleared emoji status',
  },
  setEmoji: {
    id: 'app.toast.setEmoji.label',
    description: 'message when a user emoji has been set',
  },
  raisedHand: {
    id: 'app.toast.setEmoji.raiseHand',
    description: 'toast message for raised hand notification',
  },
  loweredHand: {
    id: 'app.toast.setEmoji.lowerHand',
    description: 'toast message for lowered hand notification',
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
    description: 'view name apended to document title',
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
  actionsbar: PropTypes.element,
  captions: PropTypes.element,
  darkTheme: PropTypes.bool.isRequired,
};

const defaultProps = {
  actionsbar: null,
  captions: null,
};

const isLayeredView = window.matchMedia(`(max-width: ${SMALL_VIEWPORT_BREAKPOINT}px)`);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enableResize: !window.matchMedia(MOBILE_MEDIA).matches,
      presentationFitToWidth: false,
    };

    this.setPresentationFitToWidth = this.setPresentationFitToWidth.bind(this);
    this.handleWindowResize = throttle(this.handleWindowResize).bind(this);
    this.shouldAriaHide = this.shouldAriaHide.bind(this);

    this.throttledDeviceType = throttle(() => this.setDeviceType(),
      50, { trailing: true, leading: true }).bind(this);
  }

  componentDidMount() {
    const {
      notify,
      intl,
      layoutContextDispatch,
      isRTL,
    } = this.props;
    const { browserName } = browserInfo;
    const { osName } = deviceInfo;

    registerTitleView(intl.formatMessage(intlMessages.defaultViewLabel));

    layoutContextDispatch({
      type: ACTIONS.SET_IS_RTL,
      value: isRTL,
    });

    Modal.setAppElement('#app');

    const fontSize = isMobile() ? MOBILE_FONT_SIZE : DESKTOP_FONT_SIZE;
    document.getElementsByTagName('html')[0].style.fontSize = fontSize;

    layoutContextDispatch({
      type: ACTIONS.SET_FONT_SIZE,
      value: parseInt(fontSize.slice(0, -2), 10),
    });

    const body = document.getElementsByTagName('body')[0];

    if (browserName) {
      body.classList.add(`browser-${browserName.split(' ').pop()
        .toLowerCase()}`);
    }

    body.classList.add(`os-${osName.split(' ').shift().toLowerCase()}`);

    this.handleWindowResize();
    window.addEventListener('resize', this.handleWindowResize, false);
    window.addEventListener('localeChanged', () => {
      layoutContextDispatch({
        type: ACTIONS.SET_IS_RTL,
        value: Settings.application.isRTL,
      });
    });
    window.ondragover = (e) => { e.preventDefault(); };
    window.ondrop = (e) => { e.preventDefault(); };

    if (CONFIRMATION_ON_LEAVE) {
      window.onbeforeunload = (event) => {
        AudioService.muteMicrophone();
        event.stopImmediatePropagation();
        event.preventDefault();
        // eslint-disable-next-line no-param-reassign
        event.returnValue = '';
      };
    }

    if (deviceInfo.isMobile) makeCall('setMobileUser');

    ConnectionStatusService.startRoundTripTime();

    logger.info({ logCode: 'app_component_componentdidmount' }, 'Client loaded successfully');
  }

  componentDidUpdate(prevProps) {
    const {
      notify,
      currentUserEmoji,
      intl,
      mountModal,
      deviceType,
      mountRandomUserModal,
      selectedLayout,
      sidebarContentIsOpen,
      layoutContextDispatch,
      numCameras,
      presentationIsOpen,
      ignorePollNotifications,
    } = this.props;

    this.renderDarkMode();

    if (mountRandomUserModal) mountModal(<RandomUserSelectContainer />);

    if (prevProps.currentUserEmoji.status !== currentUserEmoji.status) {
      const formattedEmojiStatus = intl.formatMessage({ id: `app.actionsBar.emojiMenu.${currentUserEmoji.status}Label` })
        || currentUserEmoji.status;

      const raisedHand = currentUserEmoji.status === 'raiseHand';

      let statusLabel = '';
      if (currentUserEmoji.status === 'none') {
        statusLabel = prevProps.currentUserEmoji.status === 'raiseHand'
          ? intl.formatMessage(intlMessages.loweredHand)
          : intl.formatMessage(intlMessages.clearedEmoji);
      } else {
        statusLabel = raisedHand
          ? intl.formatMessage(intlMessages.raisedHand)
          : intl.formatMessage(intlMessages.setEmoji, ({ 0: formattedEmojiStatus }));
      }

      notify(
        statusLabel,
        'info',
        currentUserEmoji.status === 'none'
          ? 'clear_status'
          : 'user',
      );
    }

    if (deviceType === null || prevProps.deviceType !== deviceType) this.throttledDeviceType();

    if (
      selectedLayout !== prevProps.selectedLayout
      && selectedLayout?.toLowerCase?.()?.includes?.('focus')
      && !sidebarContentIsOpen
      && deviceType !== DEVICE_TYPE.MOBILE
      && numCameras > 0
      && presentationIsOpen
    ) {
      setTimeout(() => {
        layoutContextDispatch({
          type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
          value: true,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_ID_CHAT_OPEN,
          value: DEFAULT_VALUES.idChatOpen,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
          value: PANELS.CHAT,
        });
      }, 0);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize, false);
    window.onbeforeunload = null;
    ConnectionStatusService.stopRoundTripTime();
  }

  setPresentationFitToWidth(presentationFitToWidth) {
    this.setState({ presentationFitToWidth });
  }

  handleWindowResize() {
    const { enableResize } = this.state;
    const shouldEnableResize = !window.matchMedia(MOBILE_MEDIA).matches;
    if (enableResize === shouldEnableResize) return;

    this.setState({ enableResize: shouldEnableResize });
    this.throttledDeviceType();
  }

  setDeviceType() {
    const { deviceType, layoutContextDispatch } = this.props;
    let newDeviceType = null;
    if (isMobile()) newDeviceType = DEVICE_TYPE.MOBILE;
    if (isTablet()) newDeviceType = DEVICE_TYPE.TABLET;
    if (isTabletPortrait()) newDeviceType = DEVICE_TYPE.TABLET_PORTRAIT;
    if (isTabletLandscape()) newDeviceType = DEVICE_TYPE.TABLET_LANDSCAPE;
    if (isDesktop()) newDeviceType = DEVICE_TYPE.DESKTOP;

    if (newDeviceType !== deviceType) {
      layoutContextDispatch({
        type: ACTIONS.SET_DEVICE_TYPE,
        value: newDeviceType,
      });
    }
  }

  shouldAriaHide() {
    const { sidebarNavigationIsOpen, sidebarContentIsOpen, isPhone } = this.props;
    return sidebarNavigationIsOpen
      && sidebarContentIsOpen
      && (isPhone || isLayeredView.matches);
  }

  renderCaptions() {
    const {
      captions,
      captionsStyle,
    } = this.props;

    if (!captions) return null;

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
        {captions}
      </Styled.CaptionsWrapper>
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

  renderActionsBar() {
    const {
      intl,
      actionsBarStyle,
      hideActionsBar,
      setPushLayout,
      setMeetingLayout,
      presentationIsOpen,
      selectedLayout,
    } = this.props;

    const { showPushLayoutButton } = LAYOUT_CONFIG;

    if (hideActionsBar) return null;

    return (
      <Styled.ActionsBar
        id="ActionsBar"
        role="region"
        aria-label={intl.formatMessage(intlMessages.actionsBarLabel)}
        aria-hidden={this.shouldAriaHide()}
        style={
          {
            position: 'absolute',
            top: actionsBarStyle.top,
            left: actionsBarStyle.left,
            height: actionsBarStyle.height,
            width: actionsBarStyle.width,
            padding: actionsBarStyle.padding,
          }
        }
      >
        <ActionsBarContainer
          setPushLayout={setPushLayout}
          setMeetingLayout={setMeetingLayout}
          showPushLayout={showPushLayoutButton && selectedLayout === 'custom'}
          presentationIsOpen={presentationIsOpen}
          setPresentationFitToWidth={this.setPresentationFitToWidth}
        />
      </Styled.ActionsBar>
    );
  }

  renderActivityCheck() {
    const { User } = this.props;

    const { inactivityCheck, responseDelay } = User;

    return (inactivityCheck ? (
      <ActivityCheckContainer
        inactivityCheck={inactivityCheck}
        responseDelay={responseDelay}
      />
    ) : null);
  }

  renderUserInformation() {
    const { UserInfo, User } = this.props;

    return (UserInfo.length > 0 ? (
      <UserInfoContainer
        UserInfo={UserInfo}
        requesterUserId={User.userId}
        meetingId={User.meetingId}
      />
    ) : null);
  }

  renderDarkMode() {
    const { darkTheme } = this.props;

    AppService.setDarkTheme(darkTheme);
  }

  mountPushLayoutEngine() {
    const {
      cameraWidth,
      cameraHeight,
      cameraIsResizing,
      cameraPosition,
      focusedCamera,
      horizontalPosition,
      isMeetingLayoutResizing,
      isPresenter,
      isModerator,
      layoutContextDispatch,
      meetingLayout,
      meetingLayoutCameraPosition,
      meetingLayoutFocusedCamera,
      meetingLayoutVideoRate,
      meetingPresentationIsOpen,
      meetingLayoutUpdatedAt,
      presentationIsOpen,
      presentationVideoRate,
      pushLayout,
      pushLayoutMeeting,
      selectedLayout,
      setMeetingLayout,
      setPushLayout,
      shouldShowScreenshare,
      shouldShowExternalVideo,
    } = this.props;

    return (
      <PushLayoutEngine
        {...{
          cameraWidth,
          cameraHeight,
          cameraIsResizing,
          cameraPosition,
          focusedCamera,
          horizontalPosition,
          isMeetingLayoutResizing,
          isPresenter,
          isModerator,
          layoutContextDispatch,
          meetingLayout,
          meetingLayoutCameraPosition,
          meetingLayoutFocusedCamera,
          meetingLayoutVideoRate,
          meetingPresentationIsOpen,
          meetingLayoutUpdatedAt,
          presentationIsOpen,
          presentationVideoRate,
          pushLayout,
          pushLayoutMeeting,
          selectedLayout,
          setMeetingLayout,
          setPushLayout,
          shouldShowScreenshare,
          shouldShowExternalVideo,
        }}
      />
    );
  }

  render() {
    const {
      customStyle,
      customStyleUrl,
      audioAlertEnabled,
      pushAlertEnabled,
      shouldShowPresentation,
      shouldShowScreenshare,
      shouldShowExternalVideo,
      shouldShowSharedNotes,
      isPresenter,
      selectedLayout,
      presentationIsOpen,
      darkTheme,
    } = this.props;

    const { presentationFitToWidth } = this.state;

    return (
      <>
        <Notifications />
        {this.mountPushLayoutEngine()}
        {selectedLayout ? <LayoutEngine layoutType={selectedLayout} /> : null}
        <GlobalStyles />
        <Styled.Layout
          id="layout"
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          {this.renderActivityCheck()}
          {this.renderUserInformation()}
          <ScreenReaderAlertContainer />
          <BannerBarContainer />
          <NotificationsBarContainer />
          <SidebarNavigationContainer />
          <SidebarContentContainer isSharedNotesPinned={shouldShowSharedNotes} />
          <NavBarContainer main="new" />
          <NewWebcamContainer isLayoutSwapped={!presentationIsOpen} />
          <Styled.TextMeasure id="text-measure" />
          {shouldShowPresentation ? <PresentationAreaContainer setPresentationFitToWidth={this.setPresentationFitToWidth} fitToWidth={presentationFitToWidth} darkTheme={darkTheme} presentationIsOpen={presentationIsOpen} /> : null}
          {shouldShowScreenshare ? <ScreenshareContainer isLayoutSwapped={!presentationIsOpen} /> : null}
          {
            shouldShowExternalVideo
              ? <ExternalVideoContainer isLayoutSwapped={!presentationIsOpen} isPresenter={isPresenter} />
              : null
          }
          {shouldShowSharedNotes
            ? (
              <NotesContainer
                area="media"
                layoutType={selectedLayout}
              />
            ) : null}
          {this.renderCaptions()}
          <AudioCaptionsSpeechContainer />
          {this.renderAudioCaptions()}
          <UploaderContainer />
          <CaptionsSpeechContainer />
          <BreakoutRoomInvitation />
          <AudioContainer />
          <ToastContainer rtl />
          {(audioAlertEnabled || pushAlertEnabled)
            && (
              <ChatAlertContainer
                audioAlertEnabled={audioAlertEnabled}
                pushAlertEnabled={pushAlertEnabled}
              />
            )}
          <StatusNotifier status="raiseHand" />
          <ManyWebcamsNotifier />
          <PollingContainer />
          <ModalContainer />
          <PadsSessionsContainer />
          {this.renderActionsBar()}
          {customStyleUrl ? <link rel="stylesheet" type="text/css" href={customStyleUrl} /> : null}
          {customStyle ? <link rel="stylesheet" type="text/css" href={`data:text/css;charset=UTF-8,${encodeURIComponent(customStyle)}`} /> : null}
        </Styled.Layout>
      </>
    );
  }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

export default injectIntl(App);
