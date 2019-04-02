import { withTracker } from 'meteor/react-meteor-data';
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

const UserOptionsContainer = withTracker((props) => {
  const {
    meeting,
    users,
    setEmojiStatus,
    muteAllExceptPresenter,
    muteAllUsers,
  } = props;

  return {
    toggleMuteAllUsers: () => muteAllUsers(Auth.userID),
    toggleMuteAllUsersExceptPresenter: () => muteAllExceptPresenter(Auth.userID),
    toggleStatus: () => users.forEach(id => setEmojiStatus(id, 'none')),
    isMeetingMuted: meeting.voiceProp.muteOnStart,
    isUserPresenter: Service.isUserPresenter(),
    isUserModerator: Service.isUserModerator(),
    createBreakoutRoom: Service.createBreakoutRoom,
    meetingIsBreakout: Service.meetingIsBreakout(),
    hasBreakoutRoom: Service.hasBreakoutRoom(),
    meetingName: Service.meetingName(),
    users: Service.users(),
    getBreakouts: Service.getBreakouts,
    sendInvitation: Service.sendInvitation,
    getUsersNotAssigned: Service.getUsersNotAssigned,
  };
})(UserOptions);

UserOptionsContainer.propTypes = propTypes;

export default UserOptionsContainer;
