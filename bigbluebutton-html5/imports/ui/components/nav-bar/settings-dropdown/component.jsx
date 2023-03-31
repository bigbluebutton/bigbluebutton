import React, { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
import EndMeetingConfirmationContainer from '/imports/ui/components/end-meeting-confirmation/container';
import { makeCall } from '/imports/ui/services/api';
import AboutContainer from '/imports/ui/components/about/container';
import MobileAppModal from '/imports/ui/components/mobile-app-modal/container';
import SettingsMenuContainer from '/imports/ui/components/settings/container';
import BBBMenu from '/imports/ui/components/common/menu/component';
import ShortcutHelpComponent from '/imports/ui/components/shortcut-help/component';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import FullscreenService from '/imports/ui/components/common/fullscreen-button/service';
import { colorDanger, colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import Styled from './styles';
import browserInfo from '/imports/utils/browserInfo';
import deviceInfo from '/imports/utils/deviceInfo';

const intlMessages = defineMessages({
  optionsLabel: {
    id: 'app.navBar.settingsDropdown.optionsLabel',
    description: 'Options button label',
  },
  fullscreenLabel: {
    id: 'app.navBar.settingsDropdown.fullscreenLabel',
    description: 'Make fullscreen option label',
  },
  settingsLabel: {
    id: 'app.navBar.settingsDropdown.settingsLabel',
    description: 'Open settings option label',
  },
  aboutLabel: {
    id: 'app.navBar.settingsDropdown.aboutLabel',
    description: 'About option label',
  },
  aboutDesc: {
    id: 'app.navBar.settingsDropdown.aboutDesc',
    description: 'Describes about option',
  },
  leaveSessionLabel: {
    id: 'app.navBar.settingsDropdown.leaveSessionLabel',
    description: 'Leave session button label',
  },
  fullscreenDesc: {
    id: 'app.navBar.settingsDropdown.fullscreenDesc',
    description: 'Describes fullscreen option',
  },
  settingsDesc: {
    id: 'app.navBar.settingsDropdown.settingsDesc',
    description: 'Describes settings option',
  },
  leaveSessionDesc: {
    id: 'app.navBar.settingsDropdown.leaveSessionDesc',
    description: 'Describes leave session option',
  },
  exitFullscreenDesc: {
    id: 'app.navBar.settingsDropdown.exitFullscreenDesc',
    description: 'Describes exit fullscreen option',
  },
  exitFullscreenLabel: {
    id: 'app.navBar.settingsDropdown.exitFullscreenLabel',
    description: 'Exit fullscreen option label',
  },
  hotkeysLabel: {
    id: 'app.navBar.settingsDropdown.hotkeysLabel',
    description: 'Hotkeys options label',
  },
  hotkeysDesc: {
    id: 'app.navBar.settingsDropdown.hotkeysDesc',
    description: 'Describes hotkeys option',
  },
  helpLabel: {
    id: 'app.navBar.settingsDropdown.helpLabel',
    description: 'Help options label',
  },
  openAppLabel: {
    id: 'app.navBar.settingsDropdown.openAppLabel',
    description: 'Open mobile app label',
  },
  helpDesc: {
    id: 'app.navBar.settingsDropdown.helpDesc',
    description: 'Describes help option',
  },
  endMeetingLabel: {
    id: 'app.navBar.settingsDropdown.endMeetingLabel',
    description: 'End meeting options label',
  },
  endMeetingDesc: {
    id: 'app.navBar.settingsDropdown.endMeetingDesc',
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
});

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  handleToggleFullscreen: PropTypes.func.isRequired,
  mountModal: PropTypes.func.isRequired,
  noIOSFullscreen: PropTypes.bool,
  amIModerator: PropTypes.bool,
  shortcuts: PropTypes.string,
  isBreakoutRoom: PropTypes.bool,
  isMeteorConnected: PropTypes.bool.isRequired,
  isDropdownOpen: PropTypes.bool,
  audioCaptionsEnabled: PropTypes.bool.isRequired,
  audioCaptionsActive: PropTypes.bool.isRequired,
  audioCaptionsSet: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
};

const defaultProps = {
  noIOSFullscreen: true,
  amIModerator: false,
  shortcuts: '',
  isBreakoutRoom: false,
  isDropdownOpen: false,
};

const ALLOW_FULLSCREEN = Meteor.settings.public.app.allowFullscreen;
const BBB_TABLET_APP_CONFIG = Meteor.settings.public.app.bbbTabletApp;
const { isSafari, isTabletApp } = browserInfo;
const FULLSCREEN_CHANGE_EVENT = isSafari ? 'webkitfullscreenchange' : 'fullscreenchange';

class SettingsDropdown extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isFullscreen: false,
    };

    // Set the logout code to 680 because it's not a real code and can be matched on the other side
    this.LOGOUT_CODE = '680';

    this.leaveSession = this.leaveSession.bind(this);
    this.onFullscreenChange = this.onFullscreenChange.bind(this);
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
          onClick: handleToggleFullscreen,
        },
      )
    );
  }

  leaveSession() {
    makeCall('userLeftMeeting');
    // we don't check askForFeedbackOnLogout here,
    // it is checked in meeting-ended component
    Session.set('codeError', this.LOGOUT_CODE);
  }

  renderMenuItems() {
    const {
      intl, mountModal, amIModerator, isBreakoutRoom, isMeteorConnected, audioCaptionsEnabled,
      audioCaptionsActive, audioCaptionsSet, isMobile,
    } = this.props;

    const { isIos } = deviceInfo;

    const allowedToEndMeeting = amIModerator && !isBreakoutRoom;

    const {
      showHelpButton: helpButton,
      helpLink,
      allowLogout: allowLogoutSetting,
    } = Meteor.settings.public.app;

    this.menuItems = [];

    this.getFullscreenItem(this.menuItems);

    this.menuItems.push(
      {
        key: 'list-item-settings',
        icon: 'settings',
        dataTest: 'settings',
        label: intl.formatMessage(intlMessages.settingsLabel),
        description: intl.formatMessage(intlMessages.settingsDesc),
        onClick: () => mountModal(<SettingsMenuContainer />),
      },
      {
        key: 'list-item-about',
        icon: 'about',
        dataTest: 'aboutModal',
        label: intl.formatMessage(intlMessages.aboutLabel),
        description: intl.formatMessage(intlMessages.aboutDesc),
        onClick: () => mountModal(<AboutContainer />),
      },
    );

    if (helpButton) {
      this.menuItems.push(
        {
          key: 'list-item-help',
          icon: 'help',
          iconRight: 'popout_window',
          label: intl.formatMessage(intlMessages.helpLabel),
          dataTest: 'helpButton',
          description: intl.formatMessage(intlMessages.helpDesc),
          onClick: () => window.open(`${helpLink}`),
        },
      );
    }

    if (isIos &&
      !isTabletApp &&
      BBB_TABLET_APP_CONFIG.enabled == true &&
      BBB_TABLET_APP_CONFIG.iosAppStoreUrl !== '') {
      this.menuItems.push(
        {
          key: 'list-item-help',
          icon: 'popout_window',
          label: intl.formatMessage(intlMessages.openAppLabel),
          onClick: () => mountModal(<MobileAppModal />),
         }
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

    this.menuItems.push(
      {
        key: 'list-item-shortcuts',
        icon: 'shortcuts',
        label: intl.formatMessage(intlMessages.hotkeysLabel),
        description: intl.formatMessage(intlMessages.hotkeysDesc),
        onClick: () => mountModal(<ShortcutHelpComponent />),
        divider: true,
      },
    );

    if (allowLogoutSetting && isMeteorConnected) {
      this.menuItems.push(
        {
          key: 'list-item-logout',
          dataTest: 'logout',
          icon: 'logout',
          label: intl.formatMessage(intlMessages.leaveSessionLabel),
          description: intl.formatMessage(intlMessages.leaveSessionDesc),
          onClick: () => this.leaveSession(),
        },
      );
    }

    if (allowedToEndMeeting && isMeteorConnected) {
      const customStyles = { background: colorDanger, color: colorWhite };

      this.menuItems.push(
        {
          key: 'list-item-end-meeting',
          icon: 'application',
          label: intl.formatMessage(intlMessages.endMeetingLabel),
          description: intl.formatMessage(intlMessages.endMeetingDesc),
          customStyles,
          onClick: () => mountModal(<EndMeetingConfirmationContainer />),
        },
      );
    }

    return this.menuItems;
  }

  render() {
    const {
      intl,
      shortcuts: OPEN_OPTIONS_AK,
      isDropdownOpen,
      isMobile,
      isRTL,
    } = this.props;

    const customStyles = { top: '1rem' };

    return (
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
          getContentAnchorEl: null,
          fullwidth: 'true',
          anchorOrigin: { vertical: 'bottom', horizontal: isRTL ? 'left' : 'right' },
          transformorigin: { vertical: 'top', horizontal: isRTL ? 'left' : 'right' },
        }}
      />
    );
  }
}
SettingsDropdown.propTypes = propTypes;
SettingsDropdown.defaultProps = defaultProps;
export default withShortcutHelper(withModalMounter(injectIntl(SettingsDropdown)), 'openOptions');
