import React, { Component } from 'react';
import logger from '/imports/startup/client/logger';
import Auth from '/imports/ui/services/auth';
import mapUser from '/imports/ui/services/user/mapUser';
import Users from '/imports/api/users/';
import Meetings from '/imports/api/meetings';
import UserOptions from './component';


export default class UserOptionsContainer extends Component {
  constructor(props) {
    super(props);
    const meetingId = Auth.meetingID;
    const meeting = Meetings.findOne({ meetingId });

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
    logger.info('handleLockView function');
  }

  handleClearStatus() {
    const { users, setEmojiStatus } = this.props;

    users.map(user => setEmojiStatus(user.id, 'none'));
  }

  render() {
    const currentUser = Users.findOne({ userId: Auth.userID });
    const currentUserIsModerator = mapUser(currentUser).isModerator;
    const meetingId = Auth.meetingID;
    const meeting = Meetings.findOne({ meetingId });
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
