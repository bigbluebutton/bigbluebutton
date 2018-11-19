import React, { Component } from 'react';
import PropTypes from 'prop-types';
import logger from '/imports/startup/client/logger';
import Auth from '/imports/ui/services/auth';
import mapUser from '/imports/ui/services/user/mapUser';
import Users from '/imports/api/users/';
import Meetings from '/imports/api/meetings';
import UserOptions from './component';


const propTypes = {
  users: PropTypes.arrayOf(Object).isRequired,
  muteAllUsers: PropTypes.func.isRequired,
  muteAllExceptPresenter: PropTypes.func.isRequired,
  setEmojiStatus: PropTypes.func.isRequired,
};

export default class UserOptionsContainer extends Component {
  constructor(props) {
    super(props);
    const meeting = Meetings.findOne({ meetingId: Auth.meetingID });

    this.state = {
      meetingMuted: meeting.voiceProp.muteOnStart,
    };

    this.muteMeeting = this.muteMeeting.bind(this);
    this.muteAllUsersExceptPresenter = this.muteAllUsersExceptPresenter.bind(this);
    this.handleLockView = this.handleLockView.bind(this);
    this.handleClearStatus = this.handleClearStatus.bind(this);
  }

  muteMeeting() {
    const { muteAllUsers } = this.props;
    const currentUser = Users.findOne({ userId: Auth.userID });

    muteAllUsers(currentUser.userId);
  }

  muteAllUsersExceptPresenter() {
    const { muteAllExceptPresenter } = this.props;
    const currentUser = Users.findOne({ userId: Auth.userID });

    muteAllExceptPresenter(currentUser.userId);
  }

  handleLockView() {
    // Temporary lock method, will be changed in future PR
    logger.info('handleLockView function');
  }

  handleClearStatus() {
    const { users, setEmojiStatus } = this.props;

    users.forEach((user) => {
      if (user.emoji.status !== 'none') {
        setEmojiStatus(user.id, 'none');
      }
    });
  }

  render() {
    const currentUser = Users.findOne({ userId: Auth.userID });
    const currentUserIsModerator = mapUser(currentUser).isModerator;
    const meeting = Meetings.findOne({ meetingId: Auth.meetingID });

    this.state.meetingMuted = meeting.voiceProp.muteOnStart;

    return (
      currentUserIsModerator ?
        <UserOptions
          toggleMuteAllUsers={this.muteMeeting}
          toggleMuteAllUsersExceptPresenter={this.muteAllUsersExceptPresenter}
          toggleLockView={this.handleLockView}
          toggleStatus={this.handleClearStatus}
          isMeetingMuted={this.state.meetingMuted}
        /> : null
    );
  }
}

UserOptionsContainer.propTypes = propTypes;
