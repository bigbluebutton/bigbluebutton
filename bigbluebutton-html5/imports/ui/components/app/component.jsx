import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { throttle } from 'lodash';
import { defineMessages, injectIntl } from 'react-intl';
import Modal from 'react-modal';
import browserInfo from '/imports/utils/browserInfo';
import deviceInfo from '/imports/utils/deviceInfo';
import PollingContainer from '/imports/ui/components/polling/container';
import QuestioningContainer from '/imports/ui/components/questioning/container';
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
import { LAYOUT_TYPE, DEVICE_TYPE, ACTIONS, SMALL_VIEWPORT_BREAKPOINT } from '../layout/enums';
import {
  isMobile, isTablet, isTabletPortrait, isTabletLandscape, isDesktop,
} from '../layout/utils';
import LayoutEngine from '../layout/layout-manager/layoutEngine';
import getFromUserSettings from '/imports/ui/services/users-settings';
import NavBarContainer from '../nav-bar/container';
import SidebarNavigationContainer from '../sidebar-navigation/container';
import SidebarContentContainer from '../sidebar-content/container';
import { makeCall } from '/imports/ui/services/api';
import ConnectionStatusService from '/imports/ui/components/connection-status/service';
import DarkReader from 'darkreader';
import Settings from '/imports/ui/services/settings';
import { registerTitleView } from '/imports/utils/dom-utils';
import Notifications from '../notifications/container';
import GlobalStyles from '/imports/ui/stylesheets/styled-components/globalStyles';
import MediaService from '/imports/ui/components/media/service';
import ActionsBarContainer from '../actions-bar/container';
import { updateSettings } from '/imports/ui/components/settings/service';

const MOBILE_MEDIA = 'only screen and (max-width: 40em)';
const APP_CONFIG = Meteor.settings.public.app;
const DESKTOP_FONT_SIZE = APP_CONFIG.desktopFontSize;
const MOBILE_FONT_SIZE = APP_CONFIG.mobileFontSize;
const OVERRIDE_LOCALE = APP_CONFIG.defaultSettings.application.overrideLocale;
const HIDE_PRESENTATION = Meteor.settings.public.layout.hidePresentation;
const LAYOUT_CONFIG = Meteor.settings.public.layout;

const equalDouble = (n1, n2) => {
  const precision = 0.01;

  return Math.abs(n1 - n2) <= precision;
};

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
  questionQuizPublishedLabel: {
    id: 'app.whiteboard.annotations.questionQuiz',
    description: 'message displayed when a quiz is published',
  },
  questionQuizCorrectAnswer: {
    id: "app.questionQuiz.correctOptionLabel",
    description: "correct answer selected notification"
  },
  questionQuizIncorrectAnswer: {
    id: "app.questionQuiz.incorrectOptionLabel",
    description: "correct answer selected notification"
  },
  questionQuizUserInfoAnswer: {
    id: "app.questionQuiz.info.answer",
    description: "incorrect answer selected notification"
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
  locale: PropTypes.string,
  darkTheme: PropTypes.bool.isRequired,
};

const defaultProps = {
  actionsbar: null,
  captions: null,
  locale: OVERRIDE_LOCALE || navigator.language,
};

const isLayeredView = window.matchMedia(`(max-width: ${SMALL_VIEWPORT_BREAKPOINT}px)`);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enableResize: !window.matchMedia(MOBILE_MEDIA).matches,
    };

    this.handleWindowResize = throttle(this.handleWindowResize).bind(this);
    this.shouldAriaHide = this.shouldAriaHide.bind(this);

    this.throttledDeviceType = throttle(() => this.setDeviceType(),
      50, { trailing: true, leading: true }).bind(this);
  }

  componentDidMount() {
    const {
      locale,
      notify,
      intl,
      validIOSVersion,
      layoutContextDispatch,
      meetingLayout,
      settingsLayout,
      cameraWidth,
      cameraHeight,
      layoutPresOpen,
      layoutCamPosition,
      layoutFocusedCam,
      layoutRate,
      horizontalPosition,
      isRTL,
      shouldShowScreenshare,
      shouldShowExternalVideo,
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
    document.getElementsByTagName('html')[0].lang = locale;
    document.getElementsByTagName('html')[0].style.fontSize = fontSize;

    layoutContextDispatch({
      type: ACTIONS.SET_FONT_SIZE,
      value: parseInt(fontSize.slice(0, -2), 10),
    });

    const userLayout = LAYOUT_TYPE[getFromUserSettings('bbb_change_layout', false)];
    Settings.application.selectedLayout = settingsLayout
      || userLayout
      || meetingLayout;

    let selectedLayout = Settings.application.selectedLayout;
    if (isMobile()) {
      selectedLayout = selectedLayout === 'custom' ? 'smart' : selectedLayout;
      Settings.application.selectedLayout = selectedLayout;
    }
    Settings.save();

    const initialPresentation = !getFromUserSettings('bbb_hide_presentation', HIDE_PRESENTATION || !layoutPresOpen) || shouldShowScreenshare || shouldShowExternalVideo;
    MediaService.setPresentationIsOpen(layoutContextDispatch, initialPresentation);

    if (selectedLayout === 'custom') {
      setTimeout(() => {

        layoutContextDispatch({
          type: ACTIONS.SET_FOCUSED_CAMERA_ID,
          value: layoutFocusedCam,
        });

        layoutContextDispatch({
          type: ACTIONS.SET_CAMERA_DOCK_POSITION,
          value: layoutCamPosition,
        });

        if (!equalDouble(layoutRate, 0)) {
          let w, h;
          if (horizontalPosition) {
            w = window.innerWidth * layoutRate;
            h = cameraHeight;
          } else {
            w = cameraWidth;
            h = window.innerHeight * layoutRate;
          }

          layoutContextDispatch({
            type: ACTIONS.SET_CAMERA_DOCK_SIZE,
            value: {
              width: w,
              height: h,
              browserWidth: window.innerWidth,
              browserHeight: window.innerHeight,
            }
          });
        }
      }, 0);
    }

    const body = document.getElementsByTagName('body')[0];

    if (browserName) {
      body.classList.add(`browser-${browserName.split(' ').pop()
        .toLowerCase()}`);
    }

    body.classList.add(`os-${osName.split(' ').shift().toLowerCase()}`);

    body.classList.add(`lang-${locale.split('-')[0]}`);

    if (!validIOSVersion()) {
      notify(
        intl.formatMessage(intlMessages.iOSWarning), 'error', 'warning',
      );
    }

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

    if (deviceInfo.isMobile) makeCall('setMobileUser');

    ConnectionStatusService.startRoundTripTime();

    logger.info({ logCode: 'app_component_componentdidmount' }, 'Client loaded successfully');
  }

  componentDidUpdate(prevProps) {
    const {
      notify,
      currentUserEmoji,
      intl,
      hasPublishedQuestionQuiz,
      mountModal,
      deviceType,
      meetingLayout,
      meetingLayoutUpdatedAt,
      presentationIsOpen,
      focusedCamera,
      cameraPosition,
      presentationVideoRate,
      cameraWidth,
      cameraHeight,
      cameraIsResizing,
      isPresenter,
      isModerator,
      layoutPresOpen,
      layoutIsResizing,
      layoutCamPosition,
      layoutFocusedCam,
      layoutRate,
      horizontalPosition,
      selectedLayout, // layout name
      pushLayout, // is layout pushed
      pushLayoutMeeting,
      layoutContextDispatch,
      mountRandomUserModal,
      currentUserId,
      currentQuestionQuiz,
      setPushLayout,
      setMeetingLayout,
    } = this.props;

    this.renderDarkMode();

    const meetingLayoutDidChange = meetingLayout !== prevProps.meetingLayout;
    const pushLayoutMeetingDidChange = pushLayoutMeeting !== prevProps.pushLayoutMeeting;
    const shouldSwitchLayout = isPresenter
      ? meetingLayoutDidChange
      : (meetingLayoutDidChange || pushLayoutMeetingDidChange) && pushLayoutMeeting;

    if (shouldSwitchLayout) {

      let contextLayout = meetingLayout;
      if (isMobile()) {
        contextLayout = meetingLayout === 'custom' ? 'smart' : meetingLayout;
      }

      layoutContextDispatch({
        type: ACTIONS.SET_LAYOUT_TYPE,
        value: contextLayout,
      });

      updateSettings({
        application: {
          ...Settings.application,
          selectedLayout: contextLayout,
        },
      });
    }

    if (pushLayoutMeetingDidChange) {
      updateSettings({
        application: {
          ...Settings.application,
          pushLayout: pushLayoutMeeting,
        },
      });
    }

    if (meetingLayout === "custom" && !isPresenter) {

      if (layoutFocusedCam !== prevProps.layoutFocusedCam
        || meetingLayoutUpdatedAt !== prevProps.meetingLayoutUpdatedAt) {

        layoutContextDispatch({
          type: ACTIONS.SET_FOCUSED_CAMERA_ID,
          value: layoutFocusedCam,
        });
      }

      if (layoutCamPosition !== prevProps.layoutCamPosition
        || meetingLayoutUpdatedAt !== prevProps.meetingLayoutUpdatedAt) {

        layoutContextDispatch({
          type: ACTIONS.SET_CAMERA_DOCK_POSITION,
          value: layoutCamPosition,
        });
      }

      if (!equalDouble(layoutRate, prevProps.layoutRate)
        || meetingLayoutUpdatedAt !== prevProps.meetingLayoutUpdatedAt) {

        let w, h;
        if (horizontalPosition) {
          w = window.innerWidth * layoutRate;
          h = cameraHeight;
        } else {
          w = cameraWidth;
          h = window.innerHeight * layoutRate;
        }

        if (layoutIsResizing !== prevProps.layoutIsResizing) {
          layoutContextDispatch({
            type: ACTIONS.SET_CAMERA_DOCK_IS_RESIZING,
            value: layoutIsResizing,
          });
        }

        layoutContextDispatch({
          type: ACTIONS.SET_CAMERA_DOCK_SIZE,
          value: {
            width: w,
            height: h,
            browserWidth: window.innerWidth,
            browserHeight: window.innerHeight,
          }
        });
      }

      if (layoutPresOpen !== prevProps.layoutPresOpen
        || meetingLayoutUpdatedAt !== prevProps.meetingLayoutUpdatedAt) {

        layoutContextDispatch({
          type: ACTIONS.SET_PRESENTATION_IS_OPEN,
          value: layoutPresOpen,
        });
      }
    }

    const layoutChanged = presentationIsOpen !== prevProps.presentationIsOpen
      || selectedLayout !== prevProps.selectedLayout
      || cameraIsResizing !== prevProps.cameraIsResizing
      || cameraPosition !== prevProps.cameraPosition
      || focusedCamera !== prevProps.focusedCamera
      || !equalDouble(presentationVideoRate, prevProps.presentationVideoRate);

    if ((pushLayout && layoutChanged) // change layout sizes / states
      || (pushLayout !== prevProps.pushLayout) // push layout once after presenter toggles / special case where we set pushLayout to false in all viewers
    ) {
      if (isPresenter) {
        setMeetingLayout();
      } else if (isModerator) {
        setPushLayout();
      }
    }

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
    if (!prevProps.hasPublishedQuestionQuiz && hasPublishedQuestionQuiz) {
      currentQuestionQuiz.then((res) => {
        const newQuestionQuiz = res;
        if (newQuestionQuiz?.responses) {
          let isUserRespondedToQuiz = false
          newQuestionQuiz.responses.forEach((response) => {
            if (response.userId === currentUserId) {
              isUserRespondedToQuiz = true;
              if(response.isCorrect)
              return notify(
                `${intl.formatMessage(intlMessages.questionQuizPublishedLabel)}. 
                  ${intl.formatMessage(intlMessages.questionQuizUserInfoAnswer)} ${intl.formatMessage(
                  intlMessages.questionQuizCorrectAnswer)}!`, 'success', 'polling',
              );
              notify(
                `${intl.formatMessage(intlMessages.questionQuizPublishedLabel)}. 
              ${intl.formatMessage(intlMessages.questionQuizUserInfoAnswer)} ${intl.formatMessage(
                  intlMessages.questionQuizIncorrectAnswer)}!`, 'warning', 'polling',
              );
            }
          })
          !isUserRespondedToQuiz && (
            notify(
              intl.formatMessage(intlMessages.questionQuizPublishedLabel), 'info', 'polling',
            )
          )
        }
      })
    }

    if (deviceType === null || prevProps.deviceType !== deviceType) this.throttledDeviceType();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize, false);
    ConnectionStatusService.stopRoundTripTime();
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

    return darkTheme
      ? DarkReader.enable(
        { brightness: 100, contrast: 90 },
        { invert: [Styled.DtfInvert], ignoreInlineStyle: [Styled.DtfCss] },
      )
      : DarkReader.disable();
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
      isPresenter,
      selectedLayout,
      presentationIsOpen,
    } = this.props;
    return (
      <>
        <Notifications />
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
          <SidebarContentContainer />
          <NavBarContainer main="new" />
          <NewWebcamContainer isLayoutSwapped={!presentationIsOpen} />
          {shouldShowPresentation ? <PresentationAreaContainer presentationIsOpen={presentationIsOpen} /> : null}
          {shouldShowScreenshare ? <ScreenshareContainer isLayoutSwapped={!presentationIsOpen} /> : null}
          {
            shouldShowExternalVideo
              ? <ExternalVideoContainer isLayoutSwapped={!presentationIsOpen} isPresenter={isPresenter} />
              : null
          }
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
          <QuestioningContainer />
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
