import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import cx from 'classnames';
import _ from 'lodash';
import { withModalMounter } from '/imports/ui/components/modal/service';

import LogoutConfirmationContainer from '/imports/ui/components/logout-confirmation/container';
import AboutContainer from '/imports/ui/components/about/container';
import SettingsMenuContainer from '/imports/ui/components/settings/container';

import Button from '/imports/ui/components/button/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import DropdownListSeparator from '/imports/ui/components/dropdown/list/separator/component';

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
});

class SettingsDropdown extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isSettingOpen: false
    };

    this.onActionsShow = this.onActionsShow.bind(this);
    this.onActionsHide = this.onActionsHide.bind(this);
    this.getListItems = this.getListItems.bind(this);
  }

  componentWillMount() {
    this.createMenu();
  }

  componentWillReceiveProps(nextProps) {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (this.props.isFullScreen !== nextProps.isFullScreen && !iOS) {
      this.alterMenu(nextProps.isFullScreen);
    }
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

  getListItems() {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    // we slice the list item to be hidden, for iOS devices, in order to avoid the error
    // thrown if the DropdownList receives a null value.
    return (iOS) ? this.menuItems.slice(1) : this.menuItems;
  }

  createMenu() {
    const { intl, mountModal } = this.props;

    this.menuItems = [
      (<DropdownListItem
        key={_.uniqueId('list-item-')}
        icon='fullscreen'
        label={intl.formatMessage(intlMessages.fullscreenLabel)}
        description={intl.formatMessage(intlMessages.fullscreenDesc)}
        onClick={this.props.handleToggleFullscreen}
      />),
      (<DropdownListItem
        key={_.uniqueId('list-item-')}
        icon="settings"
        label={intl.formatMessage(intlMessages.settingsLabel)}
        description={intl.formatMessage(intlMessages.settingsDesc)}
        onClick={() => mountModal(<SettingsMenuContainer />)}
      />),
      (<DropdownListItem
        key={_.uniqueId('list-item-')}
        icon="about"
        label={intl.formatMessage(intlMessages.aboutLabel)}
        description={intl.formatMessage(intlMessages.aboutDesc)}
        onClick={() => mountModal(<AboutContainer />)}
      />),
      (<DropdownListSeparator key={_.uniqueId('list-separator-')} />),
      (<DropdownListItem
        key={_.uniqueId('list-item-')}
        icon="logout"
        label={intl.formatMessage(intlMessages.leaveSessionLabel)}
        description={intl.formatMessage(intlMessages.leaveSessionDesc)}
        onClick={() => mountModal(<LogoutConfirmationContainer />)}
      />),
    ];
  }

  alterMenu(fullScreenTrue){
    const { intl } = this.props;
    
    let fullscreenLabel;
    let fullscreenDesc;
    let fullscreenIcon;

    if (fullScreenTrue) {
      fullscreenLabel = intl.formatMessage(intlMessages.exitFullscreenLabel);
      fullscreenDesc = intl.formatMessage(intlMessages.exitFullscreenDesc);
      fullscreenIcon = 'exit_fullscreen';
    } else {
      fullscreenLabel = intl.formatMessage(intlMessages.fullscreenLabel);
      fullscreenDesc = intl.formatMessage(intlMessages.fullscreenDesc);
      fullscreenIcon = 'fullscreen';
    }

    let newFullScreenButton = (<DropdownListItem
      key={_.uniqueId('list-item-')}
      icon={fullscreenIcon}
      label={fullscreenLabel}
      description={fullscreenDesc}
      onClick={this.props.handleToggleFullscreen}
    />)
    const result = this.menuItems.slice(1)
    result.unshift(newFullScreenButton)
    this.menuItems = result
  }
  render() {
    const { intl } = this.props;

    return (
      <Dropdown
        autoFocus
        isOpen={this.state.isSettingOpen}
        onShow={this.onActionsShow}
        onHide={this.onActionsHide}
      >
        <DropdownTrigger tabIndex={0} accessKey="o">
          <Button
            label={intl.formatMessage(intlMessages.optionsLabel)}
            icon="more"
            ghost
            circle
            hideLabel
            className={cx(styles.btn, styles.btnSettings)}

            // FIXME: Without onClick react proptypes keep warning
            // even after the DropdownTrigger inject an onClick handler
            onClick={() => null}
          />
        </DropdownTrigger>
        <DropdownContent placement="bottom right">
          <DropdownList>
            {
              this.getListItems()
            }
          </DropdownList>
        </DropdownContent>
      </Dropdown>
    );
  }
}

export default withModalMounter(injectIntl(SettingsDropdown));
