import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { throttle } from 'lodash';
import { defineMessages, injectIntl } from 'react-intl';
import Modal from 'react-modal';
import browser from 'browser-detect';
import PanelManager from '/imports/ui/components/panel-manager/component';
import PollingContainer from '/imports/ui/components/polling/container';
import logger from '/imports/startup/client/logger';
import ActivityCheckContainer from '/imports/ui/components/activity-check/container';
import UserInfoContainer from '/imports/ui/components/user-info/container';
import BreakoutRoomInvitation from '/imports/ui/components/breakout-room/invitation/container';
import { Meteor } from 'meteor/meteor';
import ToastContainer from '../toast/container';
import ModalContainer from '../modal/container';
import NotificationsBarContainer from '../notifications-bar/container';
import AudioContainer from '../audio/container';
import ChatAlertContainer from '../chat/alert/container';
import BannerBarContainer from '/imports/ui/components/banner-bar/container';
import WaitingNotifierContainer from '/imports/ui/components/waiting-users/alert/container';
import LockNotifier from '/imports/ui/components/lock-viewers/notify/container';
import StatusNotifier from '/imports/ui/components/status-notifier/container';
import MediaService from '/imports/ui/components/media/service';
import ManyWebcamsNotifier from '/imports/ui/components/video-provider/many-users-notify/container';
import UploaderContainer from '/imports/ui/components/presentation/presentation-uploader/container';
import RandomUserSelectContainer from '/imports/ui/components/modal/random-user/container';
import { withDraggableContext } from '../media/webcam-draggable-overlay/context';
import { styles } from './styles';
import {
  LAYOUT_TYPE, DEVICE_TYPE, ACTIONS, PANELS,
} from '../layout/enums';
import {
  isMobile, isTablet, isTabletPortrait, isTabletLandscape, isDesktop,
} from '../layout/utils';
import CustomLayout from '../layout/layout-manager/customLayout';
import SmartLayout from '../layout/layout-manager/smartLayout';
import PresentationFocusLayout from '../layout/layout-manager/presentationFocusLayout';
import VideoFocusLayout from '../layout/layout-manager/videoFocusLayout';
import NavBarContainer from '../nav-bar/container';
import SidebarNavigationContainer from '../sidebar-navigation/container';
import SidebarContentContainer from '../sidebar-content/container';
import { makeCall } from '/imports/ui/services/api';

const MOBILE_MEDIA = 'only screen and (max-width: 40em)';
const APP_CONFIG = Meteor.settings.public.app;
const DESKTOP_FONT_SIZE = APP_CONFIG.desktopFontSize;
const MOBILE_FONT_SIZE = APP_CONFIG.mobileFontSize;
const ENABLE_NETWORK_MONITORING = Meteor.settings.public.networkMonitoring.enableNetworkMonitoring;

const intlMessages = defineMessages({
  userListLabel: {
    id: 'app.userList.label',
    description: 'Aria-label for Userlist Nav',
  },
  chatLabel: {
    id: 'app.chat.label',
    description: 'Aria-label for Chat Section',
  },
  mediaLabel: {
    id: 'app.media.label',
    description: 'Aria-label for Media Section',
  },
  actionsBarLabel: {
    id: 'app.actionsBar.label',
    description: 'Aria-label for ActionsBar Section',
  },
  iOSWarning: {
    id: 'app.iOSWarning.label',
    description: 'message indicating to upgrade ios version',
  },
  clearedEmoji: {
    id: 'app.toast.clearedEmoji.label',
    description: 'message for cleared emoji status',
  },
  setEmoji: {
    id: 'app.toast.setEmoji.label',
    description: 'message when a user emoji has been set',
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
});

const propTypes = {
  navbar: PropTypes.element,
  sidebar: PropTypes.element,
  media: PropTypes.element,
  actionsbar: PropTypes.element,
  captions: PropTypes.element,
  locale: PropTypes.string,
};

const defaultProps = {
  navbar: null,
  sidebar: null,
  media: null,
  actionsbar: null,
  captions: null,
  locale: 'en',
};

const LAYERED_BREAKPOINT = 640;
const isLayeredView = window.matchMedia(`(max-width: ${LAYERED_BREAKPOINT}px)`);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enableResize: !window.matchMedia(MOBILE_MEDIA).matches,
    };

    this.handleWindowResize = throttle(this.handleWindowResize).bind(this);
    this.shouldAriaHide = this.shouldAriaHide.bind(this);
    this.renderMedia = withDraggableContext(this.renderMedia.bind(this));

    this.throttledDeviceType = throttle(() => this.setDeviceType(),
      50, { trailing: true, leading: true }).bind(this);
  }

  componentDidMount() {
    const {
      locale,
      notify,
      intl,
      validIOSVersion,
      startBandwidthMonitoring,
      handleNetworkConnection,
    } = this.props;
    const BROWSER_RESULTS = browser();
    const isMobileBrowser = BROWSER_RESULTS.mobile || BROWSER_RESULTS.os.includes('Android');

    MediaService.setSwapLayout();
    Modal.setAppElement('#app');
    document.getElementsByTagName('html')[0].lang = locale;
    document.getElementsByTagName('html')[0].style.fontSize = isMobileBrowser ? MOBILE_FONT_SIZE : DESKTOP_FONT_SIZE;

    const body = document.getElementsByTagName('body')[0];
    if (BROWSER_RESULTS && BROWSER_RESULTS.name) {
      body.classList.add(`browser-${BROWSER_RESULTS.name}`);
    }
    if (BROWSER_RESULTS && BROWSER_RESULTS.os) {
      body.classList.add(`os-${BROWSER_RESULTS.os.split(' ').shift().toLowerCase()}`);
    }

    if (!validIOSVersion()) {
      notify(
        intl.formatMessage(intlMessages.iOSWarning), 'error', 'warning',
      );
    }

    this.handleWindowResize();
    window.addEventListener('resize', this.handleWindowResize, false);
    window.ondragover = (e) => { e.preventDefault(); };
    window.ondrop = (e) => { e.preventDefault(); };

    if (ENABLE_NETWORK_MONITORING) {
      if (navigator.connection) {
        handleNetworkConnection();
        navigator.connection.addEventListener('change', handleNetworkConnection);
      }

      startBandwidthMonitoring();
    }

    if (isMobileBrowser) makeCall('setMobileUser');

    logger.info({ logCode: 'app_component_componentdidmount' }, 'Client loaded successfully');

    window.addEventListener('resize', this.deviceType);
    this.throttledDeviceType();
  }

  componentDidUpdate(prevProps) {
    const {
      meetingMuted,
      notify,
      currentUserEmoji,
      intl,
      hasPublishedPoll,
      randomlySelectedUser,
      currentUserId,
      mountModal,
      deviceType,
    } = this.props;

    if (randomlySelectedUser === currentUserId) mountModal(<RandomUserSelectContainer />);

    if (prevProps.currentUserEmoji.status !== currentUserEmoji.status) {
      const formattedEmojiStatus = intl.formatMessage({ id: `app.actionsBar.emojiMenu.${currentUserEmoji.status}Label` })
        || currentUserEmoji.status;

      notify(
        currentUserEmoji.status === 'none'
          ? intl.formatMessage(intlMessages.clearedEmoji)
          : intl.formatMessage(intlMessages.setEmoji, ({ 0: formattedEmojiStatus })),
        'info',
        currentUserEmoji.status === 'none'
          ? 'clear_status'
          : 'user',
      );
    }
    if (!prevProps.meetingMuted && meetingMuted) {
      notify(
        intl.formatMessage(intlMessages.meetingMuteOn), 'info', 'mute',
      );
    }
    if (prevProps.meetingMuted && !meetingMuted) {
      notify(
        intl.formatMessage(intlMessages.meetingMuteOff), 'info', 'unmute',
      );
    }
    if (!prevProps.hasPublishedPoll && hasPublishedPoll) {
      notify(
        intl.formatMessage(intlMessages.pollPublishedLabel), 'info', 'polling',
      );
    }

    if (prevProps.deviceType !== deviceType) this.throttledDeviceType();
  }

  componentWillUnmount() {
    const { handleNetworkConnection } = this.props;
    window.removeEventListener('resize', this.handleWindowResize, false);
    if (navigator.connection) {
      navigator.connection.addEventListener('change', handleNetworkConnection, false);
    }
  }

  setDeviceType() {
    const { deviceType, newLayoutContextDispatch } = this.props;
    let newDeviceType = null;
    if (isMobile()) newDeviceType = DEVICE_TYPE.MOBILE;
    if (isTablet()) newDeviceType = DEVICE_TYPE.TABLET;
    if (isTabletPortrait()) newDeviceType = DEVICE_TYPE.TABLET_PORTRAIT;
    if (isTabletLandscape()) newDeviceType = DEVICE_TYPE.TABLET_LANDSCAPE;
    if (isDesktop()) newDeviceType = DEVICE_TYPE.DESKTOP;

    if (newDeviceType !== deviceType) {
      newLayoutContextDispatch({
        type: ACTIONS.SET_DEVICE_TYPE,
        value: newDeviceType,
      });
    }
  }

  handleWindowResize() {
    const { enableResize } = this.state;
    const shouldEnableResize = !window.matchMedia(MOBILE_MEDIA).matches;
    if (enableResize === shouldEnableResize) return;

    this.setState({ enableResize: shouldEnableResize });
  }

  shouldAriaHide() {
    const { sidebarNavPanel, sidebarContentPanel, isPhone } = this.props;
    return sidebarContentPanel !== PANELS.NONE
      && sidebarNavPanel !== PANELS.NONE
      && (isPhone || isLayeredView.matches);
  }

  renderPanel() {
    const { enableResize } = this.state;
    const { sidebarNavPanel, sidebarContentPanel, isRTL } = this.props;

    return (
      <PanelManager
        {...{
          sidebarNavPanel,
          sidebarContentPanel,
          enableResize,
          isRTL,
        }}
        shouldAriaHide={this.shouldAriaHide}
      />
    );
  }

  renderCaptions() {
    const { captions } = this.props;

    if (!captions) return null;

    return (
      <div className={styles.captionsWrapper}>
        {captions}
      </div>
    );
  }

  renderMedia() {
    const {
      media,
      intl,
    } = this.props;

    if (!media) return null;

    return (
      <section
        className={styles.media}
        aria-label={intl.formatMessage(intlMessages.mediaLabel)}
        aria-hidden={this.shouldAriaHide()}
      >
        {media}
        {this.renderCaptions()}
      </section>
    );
  }

  renderActionsBar() {
    const {
      actionsbar,
      intl,
    } = this.props;

    if (!actionsbar) return null;

    return (
      <section
        className={styles.actionsbar}
        aria-label={intl.formatMessage(intlMessages.actionsBarLabel)}
        aria-hidden={this.shouldAriaHide()}
      >
        {actionsbar}
      </section>
    );
  }

  renderActivityCheck() {
    const { User } = this.props;

    const { inactivityCheck, responseDelay } = User;

    return (inactivityCheck ? (
      <ActivityCheckContainer
        inactivityCheck={inactivityCheck}
        responseDelay={responseDelay}
      />) : null);
  }

  renderUserInformation() {
    const { UserInfo, User } = this.props;

    return (UserInfo.length > 0 ? (
      <UserInfoContainer
        UserInfo={UserInfo}
        requesterUserId={User.userId}
        meetingId={User.meetingId}
      />) : null);
  }

  renderLayoutManager() {
    const { layoutType } = this.props;
    switch (layoutType) {
      case LAYOUT_TYPE.CUSTOM_LAYOUT:
        return <CustomLayout />;
      case LAYOUT_TYPE.SMART_LAYOUT:
        return <SmartLayout />;
      case LAYOUT_TYPE.PRESENTATION_FOCUS:
        return <PresentationFocusLayout />;
      case LAYOUT_TYPE.VIDEO_FOCUS:
        return <VideoFocusLayout />;
      default:
        return <CustomLayout />;
    }
  }

  render() {
    const {
      customStyle,
      customStyleUrl,
      layoutManagerLoaded,
      sidebarNavPanel,
      sidebarContentPanel,
    } = this.props;

    return (
      <Fragment>
        <CustomLayout />
        {(layoutManagerLoaded === 'legacy' || layoutManagerLoaded === 'both')
          && (
            <main
              className={styles.main}
              style={{
                width: layoutManagerLoaded !== 'both' ? '100%' : '50%',
                height: layoutManagerLoaded !== 'both' ? '100%' : '50%',
              }}
            >
              {this.renderActivityCheck()}
              {this.renderUserInformation()}
              <BannerBarContainer />
              <NotificationsBarContainer />
              <section className={styles.wrapper}>
                <div className={
                  sidebarNavPanel !== PANELS.NONE
                    && sidebarContentPanel !== PANELS.NONE
                    ? styles.content
                    : styles.noPanelContent
                }
                >
                  <NavBarContainer main="legacy" />
                  {this.renderMedia()}
                  {this.renderActionsBar()}
                </div>
                {this.renderPanel()}
              </section>
              <UploaderContainer />
              <BreakoutRoomInvitation />
              <PollingContainer />
              <ModalContainer />
              <AudioContainer />
              <ToastContainer rtl />
              <ChatAlertContainer />
              <WaitingNotifierContainer />
              <LockNotifier />
              <StatusNotifier status="raiseHand" />
              <ManyWebcamsNotifier />
              {customStyleUrl ? <link rel="stylesheet" type="text/css" href={customStyleUrl} /> : null}
              {customStyle ? <link rel="stylesheet" type="text/css" href={`data:text/css;charset=UTF-8,${encodeURIComponent(customStyle)}`} /> : null}
            </main>
          )
        }
        {(layoutManagerLoaded === 'new' || layoutManagerLoaded === 'both')
          && (
            <Fragment>
              <div
                id="newLayout"
                className={styles.newLayout}
                style={{
                  width: layoutManagerLoaded !== 'both' ? '100%' : '50%',
                  height: layoutManagerLoaded !== 'both' ? '100%' : '50%',
                }}
              >
                <NavBarContainer main="new" />
                <SidebarNavigationContainer />
                <SidebarContentContainer />
              </div>
            </Fragment>
          )}
      </Fragment>
    );
  }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

export default injectIntl(App);
