import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import Auth from '/imports/ui/services/auth';
import Service from '/imports/ui/components/actions-bar/service';
import userListService from '/imports/ui/components/user-list/service';
import logger from '/imports/startup/client/logger';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { notify } from '/imports/ui/services/notification';
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

  const isMeetingMuteOnStart = () => {
    const { voiceProp } = meeting;
    const { muteOnStart } = voiceProp;
    return muteOnStart;
  };

  const meetingMuteDisabledLog = () => logger.info({
    logCode: 'useroptions_unmute_all',
    extraInfo: { logType: 'moderator_action' },
  }, 'moderator disabled meeting mute');

  return {
    toggleMuteAllUsers: () => {
      muteAllUsers(Auth.userID);
      if (isMeetingMuteOnStart()) {
        return meetingMuteDisabledLog();
      }
      return logger.info({
        logCode: 'useroptions_mute_all',
        extraInfo: { logType: 'moderator_action' },
      }, 'moderator enabled meeting mute, all users muted');
    },
    toggleMuteAllUsersExceptPresenter: () => {
      muteAllExceptPresenter(Auth.userID);
      if (isMeetingMuteOnStart()) {
        return meetingMuteDisabledLog();
      }
      return logger.info({
        logCode: 'useroptions_mute_all_except_presenter',
        extraInfo: { logType: 'moderator_action' },
      }, 'moderator enabled meeting mute, all users muted except presenter');
    },
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
  };
})(UserOptions);

UserOptionsContainer.propTypes = propTypes;

export default injectIntl(UserOptionsContainer);
