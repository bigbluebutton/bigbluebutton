import { withTracker } from 'meteor/react-meteor-data';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import { LockStruct } from './context';
import { withUsersConsumer } from '/imports/ui/components/components-data/users-context/context';
import { withLockContext } from './withContext';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const lockContextContainer = component => withUsersConsumer(withTracker(({ users }) => {
  const lockSetting = new LockStruct();
  const Meeting = Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { lockSettingsProps: 1 } });
  const User = users[Auth.meetingID][Auth.userID];
  const userIsLocked = User.locked && User.role !== ROLE_MODERATOR;
  const lockSettings = Meeting.lockSettingsProps;

  lockSetting.isLocked = userIsLocked;
  lockSetting.lockSettings = lockSettings;
  lockSetting.userLocks.userWebcam = userIsLocked && lockSettings.disableCam;
  lockSetting.userLocks.userMic = userIsLocked && lockSettings.disableMic;
  lockSetting.userLocks.userNote = userIsLocked && lockSettings.disableNote;
  lockSetting.userLocks.userPrivateChat = userIsLocked && lockSettings.disablePrivateChat;
  lockSetting.userLocks.userPublicChat = userIsLocked && lockSettings.disablePublicChat;
  lockSetting.userLocks.userLockedLayout = userIsLocked && lockSettings.lockedLayout;

  return lockSetting;
})(withLockContext(component)));

export default lockContextContainer;
