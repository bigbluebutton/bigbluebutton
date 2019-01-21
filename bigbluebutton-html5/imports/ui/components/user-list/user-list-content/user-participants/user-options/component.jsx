import React, { PureComponent } from 'react';
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
import LockViewersContainer from '/imports/ui/components/lock-viewers/container';
import BreakoutRoom from '/imports/ui/components/actions-bar/create-breakout-room/component';
import { styles } from './styles';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  isMeetingMuted: PropTypes.bool.isRequired,
  toggleMuteAllUsers: PropTypes.func.isRequired,
  toggleMuteAllUsersExceptPresenter: PropTypes.func.isRequired,
  toggleStatus: PropTypes.func.isRequired,
  mountModal: PropTypes.func.isRequired,
  users: PropTypes.arrayOf(Object).isRequired,
  meetingName: PropTypes.string.isRequired,
  createBreakoutRoom: PropTypes.func.isRequired,
  meetingIsBreakout: PropTypes.bool.isRequired,
  hasBreakoutRoom: PropTypes.bool.isRequired,
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
  createBreakoutRoom: {
    id: 'app.actionsBar.actionsDropdown.createBreakoutRoom',
    description: 'Create breakout room option',
  },
  createBreakoutRoomDesc: {
    id: 'app.actionsBar.actionsDropdown.createBreakoutRoomDesc',
    description: 'Description of create breakout room option',
  },
  invitationItem: {
    id: 'app.invitation.title',
    description: 'invitation to breakout title',
  },
});

class UserOptions extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isUserOptionsOpen: false,
    };

    this.clearStatusId = _.uniqueId('list-item-');
    this.muteId = _.uniqueId('list-item-');
    this.muteAllId = _.uniqueId('list-item-');
    this.lockId = _.uniqueId('list-item-');
    this.createBreakoutId = _.uniqueId('list-item-');

    this.onActionsShow = this.onActionsShow.bind(this);
    this.onActionsHide = this.onActionsHide.bind(this);
    this.alterMenu = this.alterMenu.bind(this);
    this.handleCreateBreakoutRoomClick = this.handleCreateBreakoutRoomClick.bind(this);
    this.onCreateBreakouts = this.onCreateBreakouts.bind(this);
    this.onInvitationUsers = this.onInvitationUsers.bind(this);
    this.renderMenuItems = this.renderMenuItems.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { isMeetingMuted } = this.props;
    if (prevProps.isMeetingMuted !== isMeetingMuted) {
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

  onCreateBreakouts() {
    return this.handleCreateBreakoutRoomClick(false);
  }

  onInvitationUsers() {
    return this.handleCreateBreakoutRoomClick(true);
  }

  handleCreateBreakoutRoomClick(isInvitation) {
    const {
      createBreakoutRoom,
      mountModal,
      meetingName,
      users,
      getUsersNotAssigned,
      getBreakouts,
      sendInvitation,
    } = this.props;

    return mountModal(
      <BreakoutRoom
        {...{
          createBreakoutRoom,
          meetingName,
          users,
          getUsersNotAssigned,
          isInvitation,
          getBreakouts,
          sendInvitation,
        }}
      />,
    );
  }

  alterMenu() {
    const {
      intl,
      isMeetingMuted,
      toggleMuteAllUsers,
      toggleMuteAllUsersExceptPresenter,
    } = this.props;

    if (isMeetingMuted) {
      const menuButton = (
        <DropdownListItem
          key={_.uniqueId('list-item-')}
          icon="unmute"
          label={intl.formatMessage(intlMessages.unmuteAllLabel)}
          description={intl.formatMessage(intlMessages.unmuteAllDesc)}
          onClick={toggleMuteAllUsers}
        />
      );
      this.menuItems.splice(1, 2, menuButton);
    } else {
      const muteMeetingButtons = [(<DropdownListItem
        key={_.uniqueId('list-item-')}
        icon="mute"
        label={intl.formatMessage(intlMessages.muteAllLabel)}
        description={intl.formatMessage(intlMessages.muteAllDesc)}
        onClick={toggleMuteAllUsers}
      />), (<DropdownListItem
        key={_.uniqueId('list-item-')}
        icon="mute"
        label={intl.formatMessage(intlMessages.muteAllExceptPresenterLabel)}
        description={intl.formatMessage(intlMessages.muteAllExceptPresenterDesc)}
        onClick={toggleMuteAllUsersExceptPresenter}
      />)];

      this.menuItems.splice(1, 1, muteMeetingButtons[0], muteMeetingButtons[1]);
    }
  }

  renderMenuItems() {
    const {
      intl,
      isMeetingMuted,
      mountModal,
      toggleStatus,
      toggleMuteAllUsers,
      toggleMuteAllUsersExceptPresenter,
      meetingIsBreakout,
      hasBreakoutRoom,
      getUsersNotAssigned,
      isUserModerator,
      users,
    } = this.props;

    const canCreateBreakout = isUserModerator
    && !meetingIsBreakout
    && !hasBreakoutRoom;

    const canInviteUsers = isUserModerator
    && !meetingIsBreakout
    && hasBreakoutRoom
    && getUsersNotAssigned(users).length;

    this.menuItems = _.compact([
      (<DropdownListItem
        key={this.clearStatusId}
        icon="clear_status"
        label={intl.formatMessage(intlMessages.clearAllLabel)}
        description={intl.formatMessage(intlMessages.clearAllDesc)}
        onClick={toggleStatus}
      />),
      (<DropdownListItem
        key={this.muteAllId}
        icon="mute"
        label={intl.formatMessage(intlMessages.muteAllLabel)}
        description={intl.formatMessage(intlMessages.muteAllDesc)}
        onClick={toggleMuteAllUsers}
      />),
      (<DropdownListItem
        key={this.muteId}
        icon="mute"
        label={intl.formatMessage(intlMessages.muteAllExceptPresenterLabel)}
        description={intl.formatMessage(intlMessages.muteAllExceptPresenterDesc)}
        onClick={toggleMuteAllUsersExceptPresenter}
      />),
      (<DropdownListItem
        key={this.lockId}
        icon="lock"
        label={intl.formatMessage(intlMessages.lockViewersLabel)}
        description={intl.formatMessage(intlMessages.lockViewersDesc)}
        onClick={() => mountModal(<LockViewersContainer />)}
      />),
      (canCreateBreakout
        ? (
          <DropdownListItem
            key={this.createBreakoutId}
            icon="rooms"
            label={intl.formatMessage(intlMessages.createBreakoutRoom)}
            description={intl.formatMessage(intlMessages.createBreakoutRoomDesc)}
            onClick={this.onCreateBreakouts}
          />
        ) : null
      ),
      (canInviteUsers
        ? (
          <DropdownListItem
            icon="rooms"
            label={intl.formatMessage(intlMessages.invitationItem)}
            key={this.createBreakoutId}
            onClick={this.onInvitationUsers}
          />
        )
        : null),
    ]);

    if (isMeetingMuted) {
      this.alterMenu();
    }

    return this.menuItems;
  }

  render() {
    const { isUserOptionsOpen } = this.state;
    const { intl } = this.props;

    return (
      <Dropdown
        ref={(ref) => { this.dropdown = ref; }}
        autoFocus={false}
        isOpen={isUserOptionsOpen}
        onShow={this.onActionsShow}
        onHide={this.onActionsHide}
        className={styles.dropdown}
      >
        <DropdownTrigger tabIndex={0}>
          <Button
            label={intl.formatMessage(intlMessages.optionsLabel)}
            icon="settings"
            ghost
            color="primary"
            hideLabel
            className={styles.optionsButton}
            size="sm"
            onClick={() => null}
          />
        </DropdownTrigger>
        <DropdownContent
          className={styles.dropdownContent}
          placement="right top"
        >
          <DropdownList>
            {
              this.renderMenuItems()
            }
          </DropdownList>
        </DropdownContent>
      </Dropdown>
    );
  }
}

UserOptions.propTypes = propTypes;
export default withModalMounter(injectIntl(UserOptions));
