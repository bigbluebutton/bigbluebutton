import React, { PureComponent } from 'react';
import { defineMessages, injectIntl, IntlShape } from 'react-intl';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import EndMeetingConfirmationContainer from '/imports/ui/components/end-meeting-confirmation/container';
import MobileAppModal from '/imports/ui/components/mobile-app-modal/mobile-app-modal-graphql/component';
import OverflowMenuButton from '/imports/ui/components/common/bar-overflow/overflow-menu-button/component';
import FullscreenService from '/imports/ui/components/common/fullscreen-button/service';
import { colorDanger, colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import { OptionsDropdownItemType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/options-dropdown-item/enums';
import Styled from './styles';
import browserInfo from '/imports/utils/browserInfo';
import deviceInfo from '/imports/utils/deviceInfo';
import Session from '/imports/ui/services/storage/in-memory';
import { ModalRegistration } from '/imports/ui/core/singletons/modalController';
import { OverflowMenuEntry } from '/imports/ui/components/common/bar-overflow/types';

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
  leaveBreakoutLabel: {
    id: 'app.navBar.optionsDropdown.leaveBreakoutLabel',
    description: 'Leave breakout button label',
  },
  leaveBreakoutDesc: {
    id: 'app.navBar.optionsDropdown.leaveBreakoutDesc',
    description: 'Describes leave breakout option',
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
});

interface OptionsDropdownProps {
  intl: IntlShape;
  handleToggleFullscreen: () => void;
  noIOSFullscreen?: boolean;
  amIModerator?: boolean;
  shortcuts?: string;
  isBreakoutRoom?: boolean;
  isConnected: boolean;
  isDropdownOpen?: boolean;
  audioCaptionsEnabled?: boolean;
  audioCaptionsActive: boolean;
  audioCaptionsSet: (value: boolean) => void;
  isMobile: boolean;
  isRTL?: boolean;
  isDirectLeaveButtonEnabled: boolean;
  optionsDropdownItems: PluginSdk.OptionsDropdownInterface[];
  userLeaveMeeting: () => void;
  overflowEntries?: OverflowMenuEntry[];
}

interface OptionsDropdownState {
  isFullscreen: boolean;
}

const { isSafari, isTabletApp } = browserInfo;
const FULLSCREEN_CHANGE_EVENT = isSafari ? 'webkitfullscreenchange' : 'fullscreenchange';

class OptionsDropdown extends PureComponent<OptionsDropdownProps, OptionsDropdownState> {
  private LOGOUT_CODE: string;

  private menuItems!: OverflowMenuEntry[];

  // Both are assigned by their ModalRegistration render prop, which runs before any menu click.
  private setEndMeetingConfirmationModalIsOpen!: () => void;

  private setMobileAppModalIsOpen!: () => void;

  constructor(props: OptionsDropdownProps) {
    super(props);

    this.state = { isFullscreen: false };

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

  getFullscreenItem(menuItems: OverflowMenuEntry[]) {
    const {
      intl,
      noIOSFullscreen = true,
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
          dataTest: 'optionsFullscreen',
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
    Session.setItem('codeError', this.LOGOUT_CODE);
  }

  renderMenuItems() {
    const {
      intl, amIModerator = false, isBreakoutRoom = false, isConnected, audioCaptionsEnabled = false,
      audioCaptionsActive, audioCaptionsSet, isMobile, optionsDropdownItems,
      isDirectLeaveButtonEnabled,
    } = this.props;

    const { isIos } = deviceInfo;

    const allowedToEndMeeting = amIModerator && !isBreakoutRoom;

    const {
      allowLogout: allowLogoutSetting,
    } = window.meetingClientSettings.public.app;

    this.menuItems = [];

    this.getFullscreenItem(this.menuItems);

    const BBB_TABLET_APP_CONFIG = window.meetingClientSettings.public.app.bbbTabletApp;

    if (isIos
      && !isTabletApp
      && BBB_TABLET_APP_CONFIG.enabled === true
      && BBB_TABLET_APP_CONFIG.iosAppStoreUrl !== '') {
      this.menuItems.push(
        {
          key: 'list-item-help',
          icon: 'popout_window',
          label: intl.formatMessage(intlMessages.openAppLabel),
          onClick: () => this.setMobileAppModalIsOpen(),
        },
      );
    }

    if (audioCaptionsEnabled && isMobile) {
      this.menuItems.push({
        key: 'audioCaptions',
        dataTest: 'audioCaptions',
        icon: audioCaptionsActive ? 'closed_caption_stop' : 'closed_caption',
        label: intl.formatMessage(audioCaptionsActive
          ? intlMessages.stopCaption : intlMessages.startCaption),
        onClick: () => audioCaptionsSet(!audioCaptionsActive),
      });
    }

    optionsDropdownItems.forEach((item) => {
      switch (item.type) {
        case OptionsDropdownItemType.OPTION: {
          const option = item as PluginSdk.OptionsDropdownOption;
          this.menuItems.push({
            key: option.id,
            icon: option.icon,
            onClick: option.onClick,
            label: option.label,
            dataTest: option.dataTest,
          });
          break;
        }
        case OptionsDropdownItemType.SEPARATOR:
          this.menuItems.push({ key: item.id, isSeparator: true, dataTest: item.dataTest });
          break;
        default:
          break;
      }
    });

    if (isConnected && !isDirectLeaveButtonEnabled) {
      const bottomItems: OverflowMenuEntry[] = [{ key: 'list-item-separator', isSeparator: true }];

      if (allowLogoutSetting) {
        const leaveLabel = isBreakoutRoom
          ? intlMessages.leaveBreakoutLabel
          : intlMessages.leaveSessionLabel;
        const leaveDesc = isBreakoutRoom
          ? intlMessages.leaveBreakoutDesc
          : intlMessages.leaveSessionDesc;

        bottomItems.push({
          key: 'list-item-logout',
          dataTest: 'optionsLogoutButton',
          icon: 'logout',
          label: intl.formatMessage(leaveLabel),
          description: intl.formatMessage(leaveDesc),
          keepInMenu: true,
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
          keepInMenu: true,
          onClick: () => this.setEndMeetingConfirmationModalIsOpen(),
        });
      }

      if (bottomItems.length > 1) this.menuItems.push(...bottomItems);
    }

    return this.menuItems;
  }

  render() {
    const {
      intl,
      shortcuts: OPEN_OPTIONS_AK = '',
      isDropdownOpen = false,
      isMobile,
      isRTL,
      overflowEntries = [],
    } = this.props;
    const customStyles = { top: '1rem' };
    const nativeEntries = this.renderMenuItems();
    const entries = overflowEntries.length > 0
      ? [...overflowEntries, { key: 'overflow-entries-separator', isSeparator: true }, ...nativeEntries]
      : nativeEntries;

    return (
      <>
        <OverflowMenuButton
          entries={entries}
          trigger={{
            label: intl.formatMessage(intlMessages.optionsLabel),
            dataTest: 'optionsButton',
            className: 'bbb-options-button',
            size: 'md',
            color: 'dark',
            accessKey: OPEN_OPTIONS_AK,
            component: Styled.DropdownButton,
            state: isDropdownOpen ? 'open' : 'closed',
          }}
          customStyles={!isMobile ? customStyles : null}
          overrideMobileStyles
          menuOpts={{
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

        {/* End Meeting Modal */}
        <ModalRegistration id="endMeetingModal" priority="low">
          {({
            isOpen,
            id,
            open,
            close,
          }) => {
            this.setEndMeetingConfirmationModalIsOpen = isOpen ? close : open;
            return isOpen && (
              <EndMeetingConfirmationContainer onRequestClose={close} priority="low" isOpen={isOpen} id={id} setIsOpen={isOpen ? close : open} />
            );
          }}
        </ModalRegistration>

        {/* Mobile App Modal */}
        <ModalRegistration id="mobileAppModal" priority="low">
          {({
            isOpen,
            open,
            close,
          }) => {
            this.setMobileAppModalIsOpen = isOpen ? close : open;
            return isOpen && (
              <MobileAppModal onRequestClose={close} priority="low" isOpen={isOpen} />
            );
          }}
        </ModalRegistration>
      </>
    );
  }
}

export default injectIntl(OptionsDropdown);
