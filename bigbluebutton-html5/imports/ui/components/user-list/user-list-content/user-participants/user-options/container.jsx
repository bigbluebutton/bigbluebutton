import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Auth from '/imports/ui/services/auth';
import Service from '/imports/ui/components/actions-bar/service';
import UserOptions from './component';


const propTypes = {
  users: PropTypes.arrayOf(Object).isRequired,
  muteAllUsers: PropTypes.func.isRequired,
  muteAllExceptPresenter: PropTypes.func.isRequired,
  setEmojiStatus: PropTypes.func.isRequired,
  meeting: PropTypes.shape({}).isRequired,
  currentUser: PropTypes.shape({
    isModerator: PropTypes.bool.isRequired,
  }).isRequired,
};

export default class UserOptionsContainer extends PureComponent {
  constructor(props) {
    super(props);

    const { meeting } = this.props;

    this.state = {
      meetingMuted: meeting.voiceProp.muteOnStart,
    };

    this.muteMeeting = this.muteMeeting.bind(this);
    this.muteAllUsersExceptPresenter = this.muteAllUsersExceptPresenter.bind(this);
    this.handleClearStatus = this.handleClearStatus.bind(this);
  }

  muteMeeting() {
    const { muteAllUsers } = this.props;
    muteAllUsers(Auth.userID);
  }

  muteAllUsersExceptPresenter() {
    const { muteAllExceptPresenter } = this.props;
    muteAllExceptPresenter(Auth.userID);
  }

  handleClearStatus() {
    const { users, setEmojiStatus } = this.props;

    users.forEach((id) => {
      setEmojiStatus(id, 'none');
    });
  }

  render() {
    const { currentUser } = this.props;
    const currentUserIsModerator = currentUser.isModerator;

    const { meetingMuted } = this.state;

    return (
      currentUserIsModerator
        ? (
          <UserOptions
            toggleMuteAllUsers={this.muteMeeting}
            toggleMuteAllUsersExceptPresenter={this.muteAllUsersExceptPresenter}
            toggleStatus={this.handleClearStatus}
            isMeetingMuted={meetingMuted}
            createBreakoutRoom={Service.createBreakoutRoom}
            meetingName={Service.meetingName()}
            users={Service.users()}
          />) : null
    );
  }
}

UserOptionsContainer.propTypes = propTypes;
