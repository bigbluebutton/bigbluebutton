import { withTracker } from 'meteor/react-meteor-data';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import { LockStruct } from './context';
import Users from '/imports/api/users';
import { withLockContext } from './withContext';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const lockContextContainer = (component) => withTracker(() => {
  const lockSetting = new LockStruct();
  const Meeting = Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { lockSettingsProps: 1 } });
  const User = Users.findOne({ userId: Auth.userID, meetingId: Auth.meetingID },
    { fields: { role: 1, locked: 1 } });
  const userIsLocked = User ? User.locked && User.role !== ROLE_MODERATOR : true;
  const lockSettings = Meeting.lockSettingsProps;

  lockSetting.isLocked = userIsLocked;
  lockSetting.lockSettings = lockSettings;
  lockSetting.userLocks.userWebcam = userIsLocked && lockSettings.disableCam;
  lockSetting.userLocks.userMic = userIsLocked && lockSettings.disableMic;
  lockSetting.userLocks.userNotes = userIsLocked && lockSettings.disableNotes;
  lockSetting.userLocks.userPrivateChat = userIsLocked && lockSettings.disablePrivateChat;
  lockSetting.userLocks.userPublicChat = userIsLocked && lockSettings.disablePublicChat;
  lockSetting.userLocks.userLockedLayout = userIsLocked && lockSettings.lockedLayout;
  lockSetting.userLocks.hideViewersCursor = userIsLocked && lockSettings.hideViewersCursor;

  return lockSetting;
})(withLockContext(component));

export default lockContextContainer;
