import React, { PureComponent } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { withModalMounter } from '/imports/ui/components/modal/service';
import EndMeetingConfirmationContainer from '/imports/ui/components/end-meeting-confirmation/container';
import { makeCall } from '/imports/ui/services/api';
import AboutContainer from '/imports/ui/components/about/container';
import SettingsMenuContainer from '/imports/ui/components/settings/container';
import Button from '/imports/ui/components/button/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import DropdownListSeparator from '/imports/ui/components/dropdown/list/separator/component';
import ShortcutHelpComponent from '/imports/ui/components/shortcut-help/component';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import FullscreenService from '../../fullscreen-button/service';

import { styles } from '../styles';

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
});

const propTypes = {
  intl: intlShape.isRequired,
  handleToggleFullscreen: PropTypes.func.isRequired,
  mountModal: PropTypes.func.isRequired,
  noIOSFullscreen: PropTypes.bool,
  amIModerator: PropTypes.bool,
  shortcuts: PropTypes.string,
  isBreakoutRoom: PropTypes.bool,
  isMeteorConnected: PropTypes.bool.isRequired,
};

const defaultProps = {
  noIOSFullscreen: true,
  amIModerator: false,
  shortcuts: '',
  isBreakoutRoom: false,
};

const ALLOW_FULLSCREEN = Meteor.settings.public.app.allowFullscreen;

class SettingsDropdown extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isSettingOpen: false,
      isFullscreen: false,
    };

    // Set the logout code to 680 because it's not a real code and can be matched on the other side
    this.LOGOUT_CODE = '680';

    this.onActionsShow = this.onActionsShow.bind(this);
    this.onActionsHide = this.onActionsHide.bind(this);
    this.leaveSession = this.leaveSession.bind(this);
    this.onFullscreenChange = this.onFullscreenChange.bind(this);
  }

  componentDidMount() {
    document.documentElement.addEventListener('fullscreenchange', this.onFullscreenChange);
  }

  componentWillUnmount() {
    document.documentElement.removeEventListener('fullscreenchange', this.onFullscreenChange);
  }

  onActionsShow() {
    this.setState({
      isSettingOpen: true,
    });
  }

  onActionsHide() {
    this.setState({
      isSettingOpen: false,
    });
  }

  onFullscreenChange() {
    const { isFullscreen } = this.state;
    const newIsFullscreen = FullscreenService.isFullScreen(document.documentElement);
    if (isFullscreen !== newIsFullscreen) {
      this.setState({ isFullscreen: newIsFullscreen });
    }
  }

  getFullscreenItem() {
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
      <DropdownListItem
        key="list-item-fullscreen"
        icon={fullscreenIcon}
        label={fullscreenLabel}
        description={fullscreenDesc}
        onClick={handleToggleFullscreen}
      />
    );
  }

  leaveSession() {
    makeCall('userLeftMeeting');
    // we don't check askForFeedbackOnLogout here,
    // it is checked in meeting-ended component
    Session.set('codeError', this.LOGOUT_CODE);
    // mountModal(<MeetingEndedComponent code={LOGOUT_CODE} />);
  }

  renderMenuItems() {
    const {
      intl, mountModal, amIModerator, isBreakoutRoom, isMeteorConnected,
    } = this.props;

    const allowedToEndMeeting = amIModerator && !isBreakoutRoom;

    const {
      showHelpButton: helpButton,
      helpLink,
      allowLogout: allowLogoutSetting,
    } = Meteor.settings.public.app;

    const logoutOption = (
      <DropdownListItem
        key="list-item-logout"
        icon="logout"
        label={intl.formatMessage(intlMessages.leaveSessionLabel)}
        description={intl.formatMessage(intlMessages.leaveSessionDesc)}
        onClick={() => this.leaveSession()}
      />
    );

    const shouldRenderLogoutOption = (isMeteorConnected && allowLogoutSetting)
      ? logoutOption
      : null;

    return _.compact([
      this.getFullscreenItem(),
      (<DropdownListItem
        key="list-item-settings"
        icon="settings"
        label={intl.formatMessage(intlMessages.settingsLabel)}
        description={intl.formatMessage(intlMessages.settingsDesc)}
        onClick={() => mountModal(<SettingsMenuContainer />)}
      />),
      (<DropdownListItem
        key="list-item-about"
        icon="about"
        label={intl.formatMessage(intlMessages.aboutLabel)}
        description={intl.formatMessage(intlMessages.aboutDesc)}
        onClick={() => mountModal(<AboutContainer />)}
      />),
      !helpButton ? null
        : (
          <DropdownListItem
            key="list-item-help"
            icon="help"
            iconRight="popout_window"
            label={intl.formatMessage(intlMessages.helpLabel)}
            description={intl.formatMessage(intlMessages.helpDesc)}
            onClick={() => window.open(`${helpLink}`)}
          />
        ),
      (<DropdownListItem
        key="list-item-shortcuts"
        icon="shortcuts"
        label={intl.formatMessage(intlMessages.hotkeysLabel)}
        description={intl.formatMessage(intlMessages.hotkeysDesc)}
        onClick={() => mountModal(<ShortcutHelpComponent />)}
      />),
      (isMeteorConnected ? <DropdownListSeparator key={_.uniqueId('list-separator-')} /> : null),
      allowedToEndMeeting && isMeteorConnected
        ? (<DropdownListItem
          key="list-item-end-meeting"
          icon="application"
          label={intl.formatMessage(intlMessages.endMeetingLabel)}
          description={intl.formatMessage(intlMessages.endMeetingDesc)}
          onClick={() => mountModal(<EndMeetingConfirmationContainer />)}
        />
        )
        : null,
      shouldRenderLogoutOption,
    ]);
  }

  render() {
    const {
      intl,
      shortcuts: OPEN_OPTIONS_AK,
    } = this.props;

    const { isSettingOpen } = this.state;

    return (
      <Dropdown
        autoFocus
        keepOpen={isSettingOpen}
        onShow={this.onActionsShow}
        onHide={this.onActionsHide}
      >
        <DropdownTrigger tabIndex={0} accessKey={OPEN_OPTIONS_AK}>
          <Button
            label={intl.formatMessage(intlMessages.optionsLabel)}
            icon="more"
            ghost
            circle
            hideLabel
            className={styles.btn}

            // FIXME: Without onClick react proptypes keep warning
            // even after the DropdownTrigger inject an onClick handler
            onClick={() => null}
          />
        </DropdownTrigger>
        <DropdownContent placement="bottom right">
          <DropdownList>
            {this.renderMenuItems()}
          </DropdownList>
        </DropdownContent>
      </Dropdown>
    );
  }
}
SettingsDropdown.propTypes = propTypes;
SettingsDropdown.defaultProps = defaultProps;
export default withShortcutHelper(withModalMounter(injectIntl(SettingsDropdown)), 'openOptions');
