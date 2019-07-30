import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import Auth from '/imports/ui/services/auth';
import Service from '/imports/ui/components/actions-bar/service';
import userListService from '/imports/ui/components/user-list/service';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { notify } from '/imports/ui/services/notification';
import mapUser from '/imports/ui/services/user/mapUser';
import Users from '/imports/api/users';
import UserOptions from './component';

const propTypes = {
  users: PropTypes.arrayOf(Object).isRequired,
  muteAllUsers: PropTypes.func.isRequired,
  muteAllExceptPresenter: PropTypes.func.isRequired,
  setEmojiStatus: PropTypes.func.isRequired,
  meeting: PropTypes.shape({}).isRequired,
  intl: intlShape.isRequired,
};

const intlMessages = defineMessages({
  clearStatusMessage: {
    id: 'app.userList.content.participants.options.clearedStatus',
    description: 'Used in toast notification when emojis have been cleared',
  },
});

const UserOptionsContainer = withTracker((props) => {
  const {
    meeting,
    users,
    setEmojiStatus,
    muteAllExceptPresenter,
    muteAllUsers,
    intl,
  } = props;

  const toggleStatus = () => {
    users.forEach(id => setEmojiStatus(id, 'none'));
    notify(
      intl.formatMessage(intlMessages.clearStatusMessage), 'info', 'clear_status',
    );
  };
  const currentUser = Users.findOne({ userId: Auth.userID });
  return {
    toggleMuteAllUsers: () => muteAllUsers(Auth.userID),
    toggleMuteAllUsersExceptPresenter: () => muteAllExceptPresenter(Auth.userID),
    toggleStatus,
    isMeetingMuted: meeting.voiceProp.muteOnStart,
    isUserPresenter: Service.isUserPresenter(),
    isUserModerator: Service.isUserModerator(),
    meetingIsBreakout: Service.meetingIsBreakout(),
    getUsersNotAssigned: Service.getUsersNotAssigned,
    hasBreakoutRoom: Service.hasBreakoutRoom(),
    isBreakoutEnabled: Service.isBreakoutEnabled(),
    isBreakoutRecordable: Service.isBreakoutRecordable(),
    users: Service.users(),
    userListService,
    isMeteorConnected: Meteor.status().connected,
    currentUser: currentUser ? mapUser(currentUser) : {},
  };
})(UserOptions);

UserOptionsContainer.propTypes = propTypes;

export default injectIntl(UserOptionsContainer);
