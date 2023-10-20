import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import LockViewersContainer from '/imports/ui/components/lock-viewers/container';
import GuestPolicyContainer from '/imports/ui/components/waiting-users/guest-policy/container';
import CreateBreakoutRoomContainer from '/imports/ui/components/actions-bar/create-breakout-room/container';
import CaptionsService from '/imports/ui/components/captions/service';
import WriterMenuContainer from '/imports/ui/components/captions/writer-menu/container';
import BBBMenu from '/imports/ui/components/common/menu/component';
import Styled from './styles';
import { getUserNamesLink } from '/imports/ui/components/user-list/service';
import Settings from '/imports/ui/services/settings';
import { isBreakoutRoomsEnabled, isLearningDashboardEnabled } from '/imports/ui/services/features';
import { uniqueId } from '/imports/utils/string-utils';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  isMeetingMuted: PropTypes.bool.isRequired,
  toggleMuteAllUsers: PropTypes.func.isRequired,
  toggleMuteAllUsersExceptPresenter: PropTypes.func.isRequired,
  toggleStatus: PropTypes.func.isRequired,
  toggleReactions: PropTypes.func.isRequired,
  guestPolicy: PropTypes.string.isRequired,
  meetingIsBreakout: PropTypes.bool.isRequired,
  hasBreakoutRoom: PropTypes.bool.isRequired,
  isBreakoutRecordable: PropTypes.bool.isRequired,
  dynamicGuestPolicy: PropTypes.bool.isRequired,
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
  clearAllReactionsLabel: {
    id: 'app.userList.userOptions.clearAllReactionsLabel',
    description: 'Clear all reactions label',
  },
  clearAllReactionsDesc: {
    id: 'app.userList.userOptions.clearAllReactionsDesc',
    description: 'Clear all reactions description',
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
  guestPolicyLabel: {
    id: 'app.userList.userOptions.guestPolicyLabel',
    description: 'Guest policy label',
  },
  guestPolicyDesc: {
    id: 'app.userList.userOptions.guestPolicyDesc',
    description: 'Guest policy description',
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
  learningDashboardLabel: {
    id: 'app.learning-dashboard.label',
    description: 'Activity Report label',
  },
  learningDashboardDesc: {
    id: 'app.learning-dashboard.description',
    description: 'Activity Report description',
  },
  saveUserNames: {
    id: 'app.actionsBar.actionsDropdown.saveUserNames',
    description: 'Save user name feature description',
  },
  captionsLabel: {
    id: 'app.actionsBar.actionsDropdown.captionsLabel',
    description: 'Captions menu toggle label',
  },
  captionsDesc: {
    id: 'app.actionsBar.actionsDropdown.captionsDesc',
    description: 'Captions menu toggle description',
  },
  savedNamesListTitle: {
    id: 'app.userList.userOptions.savedNames.title',
    description: '',
  },
  sortedFirstNameHeading: {
    id: 'app.userList.userOptions.sortedFirstName.heading',
    description: '',
  },
  sortedLastNameHeading: {
    id: 'app.userList.userOptions.sortedLastName.heading',
    description: '',
  },
  newTab: {
    id: 'app.modal.newTab',
    description: 'label used in aria description',
  }
});

const USER_STATUS_ENABLED = Meteor.settings.public.userStatus.enabled;
const USER_REACTION_ENABLED = Meteor.settings.public.userReaction.enabled;

class UserOptions extends PureComponent {
  constructor(props) {
    super(props);

    this.clearStatusId = uniqueId('list-item-');
    this.clearReactionId = uniqueId('list-item-');
    this.muteId = uniqueId('list-item-');
    this.muteAllId = uniqueId('list-item-');
    this.lockId = uniqueId('list-item-');
    this.guestPolicyId = uniqueId('list-item-');
    this.createBreakoutId = uniqueId('list-item-');
    this.learningDashboardId = uniqueId('list-item-');
    this.saveUsersNameId = uniqueId('list-item-');
    this.captionsId = uniqueId('list-item-');
    this.state = {
      isCreateBreakoutRoomModalOpen: false,
      isGuestPolicyModalOpen: false,
      isInvitation: false,
      isWriterMenuModalOpen: false,
      isLockViewersModalOpen: false,
    }

    this.handleCreateBreakoutRoomClick = this.handleCreateBreakoutRoomClick.bind(this);
    this.onCreateBreakouts = this.onCreateBreakouts.bind(this);
    this.onInvitationUsers = this.onInvitationUsers.bind(this);
    this.renderMenuItems = this.renderMenuItems.bind(this);
    this.onSaveUserNames = this.onSaveUserNames.bind(this);
    this.setCreateBreakoutRoomModalIsOpen = this.setCreateBreakoutRoomModalIsOpen.bind(this);
    this.setGuestPolicyModalIsOpen = this.setGuestPolicyModalIsOpen.bind(this);
    this.setWriterMenuModalIsOpen = this.setWriterMenuModalIsOpen.bind(this);
    this.setLockViewersModalIsOpen = this.setLockViewersModalIsOpen.bind(this);
  }

  onSaveUserNames() {
    const { intl, meetingName } = this.props;
    const lang = Settings.application.locale;
    const date = new Date();

    const dateString = lang ? date.toLocaleDateString(lang) : date.toLocaleDateString();
    const timeString = lang ? date.toLocaleTimeString(lang) : date.toLocaleTimeString();

    getUserNamesLink(
      intl.formatMessage(intlMessages.savedNamesListTitle,
        {
          0: meetingName,
          1: `${dateString}:${timeString}`,
        }),
      intl.formatMessage(intlMessages.sortedFirstNameHeading),
      intl.formatMessage(intlMessages.sortedLastNameHeading),
    ).dispatchEvent(new MouseEvent('click',
      { bubbles: true, cancelable: true, view: window }));
  }

  onCreateBreakouts() {
    return this.handleCreateBreakoutRoomClick(false);
  }

  onInvitationUsers() {
    return this.handleCreateBreakoutRoomClick(true);
  }

  handleCreateBreakoutRoomClick(isInvitation) {
    this.setState({isInvitation})
    return this.setCreateBreakoutRoomModalIsOpen(true);
  }

  renderMenuItems() {
    const {
      intl,
      isMeetingMuted,
      toggleStatus,
      toggleReactions,
      toggleMuteAllUsers,
      toggleMuteAllUsersExceptPresenter,
      meetingIsBreakout,
      hasBreakoutRoom,
      openLearningDashboardUrl,
      amIModerator,
      isMeteorConnected,
      dynamicGuestPolicy,
    } = this.props;

    const canCreateBreakout = amIModerator
      && !meetingIsBreakout
      && !hasBreakoutRoom
      && isBreakoutRoomsEnabled();

    const { locale } = intl;

    this.menuItems = [];

    if (isMeteorConnected) {
      if (!meetingIsBreakout) {
        this.menuItems.push({
          key: this.muteAllId,
          label: intl.formatMessage(intlMessages[isMeetingMuted ? 'unmuteAllLabel' : 'muteAllLabel']),
          description: intl.formatMessage(intlMessages[isMeetingMuted ? 'unmuteAllDesc' : 'muteAllDesc']),
          onClick: toggleMuteAllUsers,
          icon: isMeetingMuted ? 'unmute' : 'mute',
          dataTest: 'muteAll',
        });

        if (!isMeetingMuted) {
          this.menuItems.push({
            key: this.muteId,
            label: intl.formatMessage(intlMessages.muteAllExceptPresenterLabel),
            description: intl.formatMessage(intlMessages.muteAllExceptPresenterDesc),
            onClick: toggleMuteAllUsersExceptPresenter,
            icon: 'mute',
            dataTest: 'muteAllExceptPresenter',
          });
        }

        this.menuItems.push({
          key: this.lockId,
          label: intl.formatMessage(intlMessages.lockViewersLabel),
          description: intl.formatMessage(intlMessages.lockViewersDesc),
          onClick: () => this.setLockViewersModalIsOpen(true),
          icon: 'lock',
          dataTest: 'lockViewersButton',
        });

        if (dynamicGuestPolicy) {
          this.menuItems.push({
            key: this.guestPolicyId,
            icon: 'user',
            label: intl.formatMessage(intlMessages.guestPolicyLabel),
            description: intl.formatMessage(intlMessages.guestPolicyDesc),
            onClick: () => this.setGuestPolicyModalIsOpen(true),
            dataTest: 'guestPolicyLabel',
          });
        }
      }

      if (amIModerator) {
        this.menuItems.push({
          key: this.saveUsersNameId,
          label: intl.formatMessage(intlMessages.saveUserNames),
          // description: ,
          onClick: this.onSaveUserNames,
          icon: 'download',
          dataTest: 'downloadUserNamesList',
          divider: !USER_STATUS_ENABLED,
        });
      }

      if (USER_STATUS_ENABLED) {
        this.menuItems.push({
          key: this.clearStatusId,
          label: intl.formatMessage(intlMessages.clearAllLabel),
          description: intl.formatMessage(intlMessages.clearAllDesc),
          onClick: toggleStatus,
          icon: 'clear_status',
          divider: true,
        });
      }

      if (USER_REACTION_ENABLED) {
        this.menuItems.push({
          key: this.clearReactionId,
          label: intl.formatMessage(intlMessages.clearAllReactionsLabel),
          description: intl.formatMessage(intlMessages.clearAllReactionsDesc),
          onClick: toggleReactions,
          icon: 'clear_status',
          divider: true,
        });
      }

      if (canCreateBreakout) {
        this.menuItems.push({
          key: this.createBreakoutId,
          icon: 'rooms',
          label: intl.formatMessage(intlMessages.createBreakoutRoom),
          description: intl.formatMessage(intlMessages.createBreakoutRoomDesc),
          onClick: this.onCreateBreakouts,
          dataTest: 'createBreakoutRooms',
        });
      }

      if (amIModerator && CaptionsService.isCaptionsEnabled()) {
        this.menuItems.push({
          icon: 'closed_caption',
          label: intl.formatMessage(intlMessages.captionsLabel),
          description: intl.formatMessage(intlMessages.captionsDesc),
          key: this.captionsId,
          onClick: () => { this.setWriterMenuModalIsOpen(true); },
          dataTest: 'writeClosedCaptions',
        });
      }
      if (amIModerator) {
        if (isLearningDashboardEnabled()) {
          this.menuItems.push({
            icon: 'multi_whiteboard',
            iconRight: 'popout_window',
            label: intl.formatMessage(intlMessages.learningDashboardLabel),
            description: `${intl.formatMessage(intlMessages.learningDashboardDesc)} ${intl.formatMessage(intlMessages.newTab)}`,
            key: this.learningDashboardId,
            onClick: () => { openLearningDashboardUrl(locale); },
            dividerTop: true,
            dataTest: 'learningDashboard'
          });
        }
      }
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

  setCreateBreakoutRoomModalIsOpen(value) {
    this.setState({
      isCreateBreakoutRoomModalOpen: value,
    })
  }

  setGuestPolicyModalIsOpen(value) {
    this.setState({
      isGuestPolicyModalOpen: value,
    })
  }

  setWriterMenuModalIsOpen(value) {
    this.setState({isWriterMenuModalOpen: value});
  }

  setLockViewersModalIsOpen(value) {
    this.setState({isLockViewersModalOpen: value});
  }

  render() {
    const { intl, isRTL, isBreakoutRecordable } = this.props;
    const { isCreateBreakoutRoomModalOpen, isInvitation,
            isGuestPolicyModalOpen, isWriterMenuModalOpen,
            isLockViewersModalOpen } = this.state;

    return (
      <>
        <BBBMenu
          trigger={(
            <Styled.OptionsButton
              label={intl.formatMessage(intlMessages.optionsLabel)}
              data-test="manageUsers"
              icon="settings"
              color="light"
              hideLabel
              size="md"
              circle
              onClick={() => null}
            />
          )}
          actions={this.renderMenuItems()}
          opts={{
            id: "user-options-dropdown-menu",
            keepMounted: true,
            transitionDuration: 0,
            elevation: 3,
            getcontentanchorel: null,
            fullwidth: "true",
            anchorOrigin: { vertical: 'bottom', horizontal: isRTL ? 'right' : 'left' },
            transformOrigin: { vertical: 'top', horizontal: isRTL ? 'right' : 'left' },
          }}
        />
        {this.renderModal(isCreateBreakoutRoomModalOpen, this.setCreateBreakoutRoomModalIsOpen, "medium",
          CreateBreakoutRoomContainer, {isBreakoutRecordable, isInvitation})}
        {this.renderModal(isGuestPolicyModalOpen, this.setGuestPolicyModalIsOpen, "low",
          GuestPolicyContainer)}
        {this.renderModal(isWriterMenuModalOpen, this.setWriterMenuModalIsOpen, "low",
          WriterMenuContainer)}
        {this.renderModal(isLockViewersModalOpen, this.setLockViewersModalIsOpen, "low",
          LockViewersContainer)}
      </>
    );
  }
}

UserOptions.propTypes = propTypes;
export default injectIntl(UserOptions);
