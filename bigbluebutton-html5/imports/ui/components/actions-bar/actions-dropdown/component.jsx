import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import PresentationUploaderContainer from '/imports/ui/components/presentation/presentation-uploader/container';
import { withModalMounter } from '/imports/ui/components/modal/service';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import BreakoutRoom from '../create-breakout-room/component';
import { styles } from '../styles';

import ExternalVideoModal from '/imports/ui/components/external-video-player/modal/container';

const propTypes = {
  isUserPresenter: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
  mountModal: PropTypes.func.isRequired,
  isUserModerator: PropTypes.bool.isRequired,
  meetingIsBreakout: PropTypes.bool.isRequired,
  hasBreakoutRoom: PropTypes.bool.isRequired,
  createBreakoutRoom: PropTypes.func.isRequired,
  meetingName: PropTypes.string.isRequired,
  shortcuts: PropTypes.string.isRequired,
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  handleTakePresenter: PropTypes.func.isRequired,
};

const intlMessages = defineMessages({
  actionsLabel: {
    id: 'app.actionsBar.actionsDropdown.actionsLabel',
    description: 'Actions button label',
  },
  presentationLabel: {
    id: 'app.actionsBar.actionsDropdown.presentationLabel',
    description: 'Upload a presentation option label',
  },
  presentationDesc: {
    id: 'app.actionsBar.actionsDropdown.presentationDesc',
    description: 'adds context to upload presentation option',
  },
  desktopShareLabel: {
    id: 'app.actionsBar.actionsDropdown.desktopShareLabel',
    description: 'Desktop Share option label',
  },
  stopDesktopShareLabel: {
    id: 'app.actionsBar.actionsDropdown.stopDesktopShareLabel',
    description: 'Stop Desktop Share option label',
  },
  desktopShareDesc: {
    id: 'app.actionsBar.actionsDropdown.desktopShareDesc',
    description: 'adds context to desktop share option',
  },
  stopDesktopShareDesc: {
    id: 'app.actionsBar.actionsDropdown.stopDesktopShareDesc',
    description: 'adds context to stop desktop share option',
  },
  pollBtnLabel: {
    id: 'app.actionsBar.actionsDropdown.pollBtnLabel',
    description: 'poll menu toggle button label',
  },
  pollBtnDesc: {
    id: 'app.actionsBar.actionsDropdown.pollBtnDesc',
    description: 'poll menu toggle button description',
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
  takePresenter: {
    id: 'app.actionsBar.actionsDropdown.takePresenter',
    description: 'Label for take presenter role option',
  },
  takePresenterDesc: {
    id: 'app.actionsBar.actionsDropdown.takePresenterDesc',
    description: 'Description of take presenter role option',
  },
  externalVideoLabel: {
    id: 'app.actionsBar.actionsDropdown.shareExternalVideo',
    description: 'Share external video button',
  },
});

class ActionsDropdown extends Component {
  constructor(props) {
    super(props);
    this.handlePresentationClick = this.handlePresentationClick.bind(this);
    this.handleCreateBreakoutRoomClick = this.handleCreateBreakoutRoomClick.bind(this);
    this.onCreateBreakouts = this.onCreateBreakouts.bind(this);
    this.onInvitationUsers = this.onInvitationUsers.bind(this);

    this.presentationItemId = _.uniqueId('action-item-');
    this.recordId = _.uniqueId('action-item-');
    this.pollId = _.uniqueId('action-item-');
    this.createBreakoutRoomId = _.uniqueId('action-item-');
    this.takePresenterId = _.uniqueId('action-item-');

    this.handlePresentationClick = this.handlePresentationClick.bind(this);
    this.handleCreateBreakoutRoomClick = this.handleCreateBreakoutRoomClick.bind(this);
  }

  componentWillUpdate(nextProps) {
    const { isUserPresenter: isPresenter } = nextProps;
    const { isUserPresenter: wasPresenter, mountModal } = this.props;
    if (wasPresenter && !isPresenter) {
      mountModal(null);
    }
  }

  onCreateBreakouts() {
    return this.handleCreateBreakoutRoomClick(false);
  }

  onInvitationUsers() {
    return this.handleCreateBreakoutRoomClick(true);
  }

  getAvailableActions() {
    const {
      intl,
      isUserPresenter,
      isUserModerator,
      allowExternalVideo,
      meetingIsBreakout,
      hasBreakoutRoom,
      getUsersNotAssigned,
      users,
      handleTakePresenter,
    } = this.props;

    const {
      pollBtnLabel,
      pollBtnDesc,
      presentationLabel,
      presentationDesc,
      createBreakoutRoom,
      createBreakoutRoomDesc,
      invitationItem,
      takePresenter,
      takePresenterDesc,
    } = intlMessages;

    const {
      formatMessage,
    } = intl;

    const canCreateBreakout = isUserModerator
    && !meetingIsBreakout
    && !hasBreakoutRoom;

    const canInviteUsers = isUserModerator
    && !meetingIsBreakout
    && hasBreakoutRoom
    && getUsersNotAssigned(users).length;

    return _.compact([
      (isUserPresenter
        ? (
          <DropdownListItem
            icon="user"
            label={formatMessage(pollBtnLabel)}
            description={formatMessage(pollBtnDesc)}
            key={this.pollId}
            onClick={() => {
              Session.set('openPanel', 'poll');
              Session.set('forcePollOpen', true);
            }}
          />
        )
        : (
          <DropdownListItem
            icon="presentation"
            label={formatMessage(takePresenter)}
            description={formatMessage(takePresenterDesc)}
            key={this.takePresenterId}
            onClick={() => handleTakePresenter()}
          />
        )),
      (isUserPresenter
        ? (
          <DropdownListItem
            data-test="uploadPresentation"
            icon="presentation"
            label={formatMessage(presentationLabel)}
            description={formatMessage(presentationDesc)}
            key={this.presentationItemId}
            onClick={this.handlePresentationClick}
          />
        )
        : null),
      (isUserPresenter && allowExternalVideo
        ? (
          <DropdownListItem
            icon="video"
            label={intl.formatMessage(intlMessages.externalVideoLabel)}
            description="External Video"
            key="external-video"
            onClick={this.handleExternalVideoClick}
          />
        )
        : null),
      (canCreateBreakout
        ? (
          <DropdownListItem
            icon="rooms"
            label={formatMessage(createBreakoutRoom)}
            description={formatMessage(createBreakoutRoomDesc)}
            key={this.createBreakoutRoomId}
            onClick={this.onCreateBreakouts}
          />
        )
        : null),
      (canInviteUsers
        ? (
          <DropdownListItem
            icon="rooms"
            label={formatMessage(invitationItem)}
            key={this.createBreakoutRoomId}
            onClick={this.onInvitationUsers}
          />
        )
        : null),
    ]);
  }

  handleExternalVideoClick = () => {
    this.props.mountModal(<ExternalVideoModal />);
  }

  handlePresentationClick() {
    const { mountModal } = this.props;
    mountModal(<PresentationUploaderContainer />);
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

    mountModal(
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

  render() {
    const {
      intl,
      isUserPresenter,
      isUserModerator,
      shortcuts: OPEN_ACTIONS_AK,
    } = this.props;

    const availableActions = this.getAvailableActions();

    if ((!isUserPresenter && !isUserModerator) || availableActions.length === 0) return null;

    return (
      <Dropdown ref={(ref) => { this._dropdown = ref; }}>
        <DropdownTrigger tabIndex={0} accessKey={OPEN_ACTIONS_AK}>
          <Button
            hideLabel
            aria-label={intl.formatMessage(intlMessages.actionsLabel)}
            className={styles.button}
            label={intl.formatMessage(intlMessages.actionsLabel)}
            icon="plus"
            color="primary"
            size="lg"
            circle
            onClick={() => null}
          />
        </DropdownTrigger>
        <DropdownContent placement="top left">
          <DropdownList>
            {availableActions}
          </DropdownList>
        </DropdownContent>
      </Dropdown>
    );
  }
}

ActionsDropdown.propTypes = propTypes;

export default withShortcutHelper(withModalMounter(injectIntl(ActionsDropdown)), 'openActions');
