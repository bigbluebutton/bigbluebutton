import React, { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import EndMeetingConfirmationContainer from '/imports/ui/components/end-meeting-confirmation/container';
import MobileAppModal from '/imports/ui/components/mobile-app-modal/mobile-app-modal-graphql/component';
import LayoutModalContainer from '/imports/ui/components/layout/modal/container';
import BBBMenu from '/imports/ui/components/common/menu/component';
import FullscreenService from '/imports/ui/components/common/fullscreen-button/service';
import { colorDanger, colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import { OptionsDropdownItemType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/options-dropdown-item/enums';
import Styled from './styles';
import browserInfo from '/imports/utils/browserInfo';
import deviceInfo from '/imports/utils/deviceInfo';
import Session from '/imports/ui/services/storage/in-memory';
import { LAYOUT_TYPE } from '/imports/ui/components/layout/enums';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';

const intlMessages = defineMessages({
  optionsLabel: {
    id: 'app.navBar.optionsDropdown.optionsLabel',
    description: 'Options button label',
  },
  fullscreenLabel: {
    id: 'app.navBar.optionsDropdown.fullscreenLabel',
    description: 'Make fullscreen option label',
  },
  settingsLabel: {
    id: 'app.navBar.optionsDropdown.settingsLabel',
    description: 'Open settings option label',
  },
  leaveSessionLabel: {
    id: 'app.navBar.optionsDropdown.leaveSessionLabel',
    description: 'Leave session button label',
  },
  fullscreenDesc: {
    id: 'app.navBar.optionsDropdown.fullscreenDesc',
    description: 'Describes fullscreen option',
  },
  settingsDesc: {
    id: 'app.navBar.optionsDropdown.settingsDesc',
    description: 'Describes settings option',
  },
  leaveSessionDesc: {
    id: 'app.navBar.optionsDropdown.leaveSessionDesc',
    description: 'Describes leave session option',
  },
  exitFullscreenDesc: {
    id: 'app.navBar.optionsDropdown.exitFullscreenDesc',
    description: 'Describes exit fullscreen option',
  },
  exitFullscreenLabel: {
    id: 'app.navBar.optionsDropdown.exitFullscreenLabel',
    description: 'Exit fullscreen option label',
  },
  hotkeysLabel: {
    id: 'app.navBar.optionsDropdown.hotkeysLabel',
    description: 'Hotkeys options label',
  },
  hotkeysDesc: {
    id: 'app.navBar.optionsDropdown.hotkeysDesc',
    description: 'Describes hotkeys option',
  },
  openAppLabel: {
    id: 'app.navBar.optionsDropdown.openAppLabel',
    description: 'Open mobile app label',
  },
  endMeetingLabel: {
    id: 'app.navBar.optionsDropdown.endMeetingForAllLabel',
    description: 'End meeting options label',
  },
  endMeetingDesc: {
    id: 'app.navBar.optionsDropdown.endMeetingDesc',
    description: 'Describes settings option closing the current meeting',
  },
  startCaption: {
    id: 'app.audio.captions.button.start',
    description: 'Start audio captions',
  },
  stopCaption: {
    id: 'app.audio.captions.button.stop',
    description: 'Stop audio captions',
  },
  layoutModal: {
    id: 'app.actionsBar.actionsDropdown.layoutModal',
    description: 'Label for layouts selection button',
  },
  awayLabel: {
    id: 'app.actionsBar.reactions.away',
    description: 'Away Label',
  },
  activeLabel: {
    id: 'app.actionsBar.reactions.active',
    description: 'Active Label',
  },
});

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  handleToggleFullscreen: PropTypes.func.isRequired,
  noIOSFullscreen: PropTypes.bool,
  amIModerator: PropTypes.bool,
  shortcuts: PropTypes.string,
  isBreakoutRoom: PropTypes.bool,
  isMeteorConnected: PropTypes.bool.isRequired,
  isDropdownOpen: PropTypes.bool,
  audioCaptionsEnabled: PropTypes.bool,
  audioCaptionsActive: PropTypes.bool.isRequired,
  audioCaptionsSet: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
  isDirectLeaveButtonEnabled: PropTypes.bool.isRequired,
  optionsDropdownItems: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
  })).isRequired,
  userLeaveMeeting: PropTypes.func.isRequired,
};

const defaultProps = {
  noIOSFullscreen: true,
  amIModerator: false,
  shortcuts: '',
  isBreakoutRoom: false,
  isDropdownOpen: false,
  audioCaptionsEnabled: false,
};

const { isSafari, isTabletApp } = browserInfo;
const FULLSCREEN_CHANGE_EVENT = isSafari ? 'webkitfullscreenchange' : 'fullscreenchange';

class OptionsDropdown extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isEndMeetingConfirmationModalOpen: false,
      isMobileAppModalOpen: false,
      isFullscreen: false,
      isLayoutModalOpen: false,
    };

    // Set the logout code to 680 because it's not a real code and can be matched on the other side
    this.LOGOUT_CODE = '680';

    this.leaveSession = this.leaveSession.bind(this);
    this.onFullscreenChange = this.onFullscreenChange.bind(this);
    this.setEndMeetingConfirmationModalIsOpen = this.setEndMeetingConfirmationModalIsOpen.bind(this);
    this.setMobileAppModalIsOpen = this.setMobileAppModalIsOpen.bind(this);
    this.setLayoutModalIsOpen = this.setLayoutModalIsOpen.bind(this);
  }

  componentDidMount() {
    document.documentElement.addEventListener(FULLSCREEN_CHANGE_EVENT, this.onFullscreenChange);
  }

  componentWillUnmount() {
    document.documentElement.removeEventListener(FULLSCREEN_CHANGE_EVENT, this.onFullscreenChange);
  }

  onFullscreenChange() {
    const { isFullscreen } = this.state;
    const newIsFullscreen = FullscreenService.isFullScreen(document.documentElement);
    if (isFullscreen !== newIsFullscreen) {
      this.setState({ isFullscreen: newIsFullscreen });
    }
  }

  getFullscreenItem(menuItems) {
    const {
      intl,
      noIOSFullscreen,
      handleToggleFullscreen,
    } = this.props;
    const { isFullscreen } = this.state;

    const ALLOW_FULLSCREEN = window.meetingClientSettings.public.app.allowFullscreen;

    if (noIOSFullscreen || !ALLOW_FULLSCREEN) return null;

    let fullscreenLabel = intl.formatMessage(intlMessages.fullscreenLabel);
    let fullscreenDesc = intl.formatMessage(intlMessages.fullscreenDesc);
    let fullscreenIcon = 'fullscreen';

    if (isFullscreen) {
      fullscreenLabel = intl.formatMessage(intlMessages.exitFullscreenLabel);
      fullscreenDesc = intl.formatMessage(intlMessages.exitFullscreenDesc);
      fullscreenIcon = 'exit_fullscreen';
    }

    return (
      menuItems.push(
        {
          key: 'list-item-fullscreen',
          icon: fullscreenIcon,
          label: fullscreenLabel,
          description: fullscreenDesc,
          onClick: () => handleToggleFullscreen(),
        },
      )
    );
  }

  leaveSession() {
    const { userLeaveMeeting } = this.props;
    
    userLeaveMeeting();
    // we don't check askForFeedbackOnLogout here,
    // it is checked in meeting-ended component
    Session.setItem('codeError', this.LOGOUT_CODE);
  }

  setEndMeetingConfirmationModalIsOpen(value) {
    this.setState({isEndMeetingConfirmationModalOpen: value})
  }

  setMobileAppModalIsOpen(value) {
    this.setState({isMobileAppModalOpen: value})
  }

  setLayoutModalIsOpen(value) {
    this.setState({ isLayoutModalOpen: value });
  }

  renderMenuItems() {
    const {
      intl, amIModerator, isBreakoutRoom, isMeteorConnected, audioCaptionsEnabled,
      audioCaptionsActive, audioCaptionsSet, isMobile, optionsDropdownItems,
      isDirectLeaveButtonEnabled, isLayoutsEnabled,
    } = this.props;

    const { isIos } = deviceInfo;

    const allowedToEndMeeting = amIModerator && !isBreakoutRoom;

    const {
      allowLogout: allowLogoutSetting,
    } = window.meetingClientSettings.public.app;

    this.menuItems = [];

    this.getFullscreenItem(this.menuItems);

    const BBB_TABLET_APP_CONFIG = window.meetingClientSettings.public.app.bbbTabletApp;

    if (isIos &&
      !isTabletApp &&
      BBB_TABLET_APP_CONFIG.enabled == true &&
      BBB_TABLET_APP_CONFIG.iosAppStoreUrl !== '') {
      this.menuItems.push(
        {
          key: 'list-item-help',
          icon: 'popout_window',
          label: intl.formatMessage(intlMessages.openAppLabel),
          onClick: () => this.setMobileAppModalIsOpen(true),
        },
      );
    }

    if (audioCaptionsEnabled && isMobile) {
      this.menuItems.push(
        {
          key: 'audioCaptions',
          dataTest: 'audioCaptions',
          icon: audioCaptionsActive ? 'closed_caption_stop' : 'closed_caption',
          label: intl.formatMessage(
            audioCaptionsActive ? intlMessages.stopCaption : intlMessages.startCaption,
          ),
          onClick: () => audioCaptionsSet(!audioCaptionsActive),
        },
      );
    }

    const Settings = getSettingsSingletonInstance();
    const { selectedLayout } = Settings.application;
    const shouldShowManageLayoutButton = selectedLayout !== LAYOUT_TYPE.CAMERAS_ONLY
      && selectedLayout !== LAYOUT_TYPE.PRESENTATION_ONLY
      && selectedLayout !== LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY;

    if (shouldShowManageLayoutButton && isLayoutsEnabled) {
      this.menuItems.push(
        {
          key: 'list-item-layout-modal',
          icon: 'manage_layout',
          label: intl.formatMessage(intlMessages.layoutModal),
          onClick: () => this.setLayoutModalIsOpen(true),
          dataTest: 'manageLayoutBtn',
        },
      );
    }

    optionsDropdownItems.forEach((item) => {
      switch (item.type) {
        case OptionsDropdownItemType.OPTION:
          this.menuItems.push({
            key: item.id,
            icon: item.icon,
            onClick: item.onClick,
            label: item.label,
          });
          break;
        case OptionsDropdownItemType.SEPARATOR:
          this.menuItems.push({
            key: item.id,
            isSeparator: true,
          });
          break;
        default:
          break;
      }
    });

    if (isMeteorConnected && !isDirectLeaveButtonEnabled) {
      const bottomItems = [{
        key: 'list-item-separator',
        isSeparator: true,
      }];

      if (allowLogoutSetting) {
        bottomItems.push({
          key: 'list-item-logout',
          dataTest: 'optionsLogoutButton',
          icon: 'logout',
          label: intl.formatMessage(intlMessages.leaveSessionLabel),
          description: intl.formatMessage(intlMessages.leaveSessionDesc),
          onClick: () => this.leaveSession(),
        });
      }

      if (allowedToEndMeeting) {
        const customStyles = { background: colorDanger, color: colorWhite };

        bottomItems.push({
          key: 'list-item-end-meeting',
          icon: 'close',
          label: intl.formatMessage(intlMessages.endMeetingLabel),
          description: intl.formatMessage(intlMessages.endMeetingDesc),
          customStyles,
          onClick: () => this.setEndMeetingConfirmationModalIsOpen(true),
        });
      }

      if (bottomItems.length > 1) this.menuItems.push(...bottomItems);
    }

    return this.menuItems;
  }

  renderModal(isOpen, setIsOpen, priority, Component, otherOptions) {
    return isOpen ? <Component 
      {...{
        ...otherOptions,
        onRequestClose: () => setIsOpen(false),
        priority,
        setIsOpen,
        isOpen
      }}
    /> : null
  }

  render() {
    const {
      intl,
      shortcuts: OPEN_OPTIONS_AK,
      isDropdownOpen,
      isMobile,
      isRTL,
    } = this.props;

    const {
      isEndMeetingConfirmationModalOpen, isMobileAppModalOpen, isLayoutModalOpen,
    } = this.state;

    const customStyles = { top: '1rem' };

    return (
      <>
        <BBBMenu
          accessKey={OPEN_OPTIONS_AK}
          customStyles={!isMobile ? customStyles : null}
          trigger={(
            <Styled.DropdownButton
              state={isDropdownOpen ? 'open' : 'closed'}
              label={intl.formatMessage(intlMessages.optionsLabel)}
              icon="more"
              data-test="optionsButton"
              color="dark"
              size="md"
              circle
              hideLabel
              // FIXME: Without onClick react proptypes keep warning
              // even after the DropdownTrigger inject an onClick handler
              onClick={() => null}
            />
          )}
          actions={this.renderMenuItems()}
          opts={{
            id: 'app-settings-dropdown-menu',
            keepMounted: true,
            transitionDuration: 0,
            elevation: 3,
            getcontentanchorel: null,
            fullwidth: 'true',
            anchorOrigin: { vertical: 'bottom', horizontal: isRTL ? 'left' : 'right' },
            transformorigin: { vertical: 'top', horizontal: isRTL ? 'left' : 'right' },
          }}
        />
        {this.renderModal(isEndMeetingConfirmationModalOpen, this.setEndMeetingConfirmationModalIsOpen, 
          "low", EndMeetingConfirmationContainer)}
        {this.renderModal(isMobileAppModalOpen, this.setMobileAppModalIsOpen, "low",
          MobileAppModal)}
        {this.renderModal(
          isLayoutModalOpen,
          this.setLayoutModalIsOpen,
          'low',
          LayoutModalContainer,
        )}

      </>
    );
  }
}
OptionsDropdown.propTypes = propTypes;
OptionsDropdown.defaultProps = defaultProps;
export default injectIntl(OptionsDropdown);
