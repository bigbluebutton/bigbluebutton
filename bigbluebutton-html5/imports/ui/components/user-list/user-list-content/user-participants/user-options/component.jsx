import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import { withModalMounter } from '/imports/ui/components/modal/service';
import Button from '/imports/ui/components/button/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import { styles } from './styles';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  isMeetingMuted: PropTypes.bool.isRequired,
  toggleMuteAllUsers: PropTypes.func.isRequired,
  toggleMuteAllUsersExceptPresenter: PropTypes.func.isRequired,
  toggleStatus: PropTypes.func.isRequired,
  toggleLockView: PropTypes.func.isRequired,
};

const intlMessages = defineMessages({
  optionsLabel: {
    id: 'app.userList.userOptions.manageUsersLabel',
    description: 'Manage user label',
  },
  clearAllLabel: {
    id: 'app.userList.userOptions.clearAllLabel',
    description: 'Clear all label',
  },
  clearAllDesc: {
    id: 'app.userList.userOptions.clearAllDesc',
    description: 'Clear all description',
  },
  muteAllLabel: {
    id: 'app.userList.userOptions.muteAllLabel',
    description: 'Mute all label',
  },
  muteAllDesc: {
    id: 'app.userList.userOptions.muteAllDesc',
    description: 'Mute all description',
  },
  unmuteAllLabel: {
    id: 'app.userList.userOptions.unmuteAllLabel',
    description: 'Unmute all label',
  },
  unmuteAllDesc: {
    id: 'app.userList.userOptions.unmuteAllDesc',
    description: 'Unmute all desc',
  },
  lockViewersLabel: {
    id: 'app.userList.userOptions.lockViewersLabel',
    description: 'Lock viewers label',
  },
  lockViewersDesc: {
    id: 'app.userList.userOptions.lockViewersDesc',
    description: 'Lock viewers description',
  },
  muteAllExceptPresenterLabel: {
    id: 'app.userList.userOptions.muteAllExceptPresenterLabel',
    description: 'Mute all except presenter label',
  },
  muteAllExceptPresenterDesc: {
    id: 'app.userList.userOptions.muteAllExceptPresenterDesc',
    description: 'Mute all except presenter description',
  },
});

class UserOptions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isUserOptionsOpen: false,
    };

    this.onActionsShow = this.onActionsShow.bind(this);
    this.onActionsHide = this.onActionsHide.bind(this);
    this.alterMenu = this.alterMenu.bind(this);
  }

  componentWillMount() {
    const { intl, isMeetingMuted } = this.props;
    this.menuItems = _.compact([
      (<DropdownListItem
        key={_.uniqueId('list-item-')}
        icon="clear_status"
        label={intl.formatMessage(intlMessages.clearAllLabel)}
        description={intl.formatMessage(intlMessages.clearAllDesc)}
        onClick={this.props.toggleStatus}
      />),
      (<DropdownListItem
        key={_.uniqueId('list-item-')}
        icon="mute"
        label={intl.formatMessage(intlMessages.muteAllLabel)}
        description={intl.formatMessage(intlMessages.muteAllDesc)}
        onClick={this.props.toggleMuteAllUsers}
      />),
      (<DropdownListItem
        key={_.uniqueId('list-item-')}
        icon="mute"
        label={intl.formatMessage(intlMessages.muteAllExceptPresenterLabel)}
        description={intl.formatMessage(intlMessages.muteAllExceptPresenterDesc)}
        onClick={this.props.toggleMuteAllUsersExceptPresenter}
      />),
      (<DropdownListItem
        key={_.uniqueId('list-item-')}
        icon="lock"
        label={intl.formatMessage(intlMessages.lockViewersLabel)}
        description={intl.formatMessage(intlMessages.lockViewersDesc)}
        onClick={this.props.toggleLockView}
      />),
    ]);

    if (isMeetingMuted) {
      this.alterMenu();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isMeetingMuted !== this.props.isMeetingMuted) {
      this.alterMenu();
    }
  }

  onActionsShow() {
    this.setState({
      isUserOptionsOpen: true,
    });
  }

  onActionsHide() {
    this.setState({
      isUserOptionsOpen: false,
    });
  }

  alterMenu() {
    const { intl, isMeetingMuted } = this.props;

    if (isMeetingMuted) {
      const menuButton = (<DropdownListItem
        key={_.uniqueId('list-item-')}
        icon="unmute"
        label={intl.formatMessage(intlMessages.unmuteAllLabel)}
        description={intl.formatMessage(intlMessages.unmuteAllDesc)}
        onClick={this.props.toggleMuteAllUsers}
      />);
      this.menuItems.splice(1, 2, menuButton);
    } else {
      const muteMeetingButtons = [(<DropdownListItem
        key={_.uniqueId('list-item-')}
        icon="mute"
        label={intl.formatMessage(intlMessages.muteAllLabel)}
        description={intl.formatMessage(intlMessages.muteAllDesc)}
        onClick={this.props.toggleMuteAllUsers}
      />), (<DropdownListItem
        key={_.uniqueId('list-item-')}
        icon="mute"
        label={intl.formatMessage(intlMessages.muteAllExceptPresenterLabel)}
        description={intl.formatMessage(intlMessages.muteAllExceptPresenterDesc)}
        onClick={this.props.toggleMuteAllUsersExceptPresenter}
      />)];

      this.menuItems.splice(1, 1, muteMeetingButtons[0], muteMeetingButtons[1]);
    }
  }

  render() {
    const { intl } = this.props;

    return (
      <Dropdown
        ref={(ref) => { this.dropdown = ref; }}
        autoFocus={false}
        isOpen={this.state.isUserOptionsOpen}
        onShow={this.onActionsShow}
        onHide={this.onActionsHide}
        className={styles.dropdown}
      >
        <DropdownTrigger tabIndex={0}>
          <Button
            label={intl.formatMessage(intlMessages.optionsLabel)}
            icon="settings"
            circle
            ghost
            color="primary"
            hideLabel
            className={styles.optionsButton}
            onClick={() => null}
          />
        </DropdownTrigger>
        <DropdownContent
          className={styles.dropdownContent}
          placement="right top"
        >
          <DropdownList>
            {
              this.menuItems
            }
          </DropdownList>
        </DropdownContent>
      </Dropdown>
    );
  }
}

UserOptions.propTypes = propTypes;
export default withModalMounter(injectIntl(UserOptions));
