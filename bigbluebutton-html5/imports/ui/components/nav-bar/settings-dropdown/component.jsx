import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import cx from 'classnames';
import _ from 'lodash';
import Button from '/imports/ui/components/button/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListSeparator from '/imports/ui/components/dropdown/list/separator/component';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { styles } from '../styles';
import ShortcutHelpListItem from './shortcuts-help/component';
import OpenSettingsListItem from './settings/component';
import LogoutListItem from './logout/component';
import FullScreenListItemContainer from './full-screen/container';
import OpenAboutListItem from './about/component';

const intlMessages = defineMessages({
  optionsLabel: {
    id: 'app.navBar.settingsDropdown.optionsLabel',
    description: 'Options button label',
  },
});

class SettingsDropdown extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isSettingOpen: false,
    };

    this.onActionsShow = this.onActionsShow.bind(this);
    this.onActionsHide = this.onActionsHide.bind(this);
    this.getListItems = this.getListItems.bind(this);
  }

  componentWillMount() {
    this.menuItems = [
      (<FullScreenListItemContainer key={_.uniqueId('list-fullscreen-')} />),
      (<OpenSettingsListItem key={_.uniqueId('list-settings-')} />),
      (<OpenAboutListItem key={_.uniqueId('list-about-')} />),
      (<ShortcutHelpListItem key={_.uniqueId('list-help-')} />),
      (<DropdownListSeparator key={_.uniqueId('list-separator-')} />),
      (<LogoutListItem key={_.uniqueId('list-logout-')} />),
    ];
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

  render() {
    const { intl } = this.props;

    return (
      <Dropdown
        autoFocus
        isOpen={this.state.isSettingOpen}
        onShow={this.onActionsShow}
        onHide={this.onActionsHide}
      >
        <DropdownTrigger tabIndex={0}>
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
