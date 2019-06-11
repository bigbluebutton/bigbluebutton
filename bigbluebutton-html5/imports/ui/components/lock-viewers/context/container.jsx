import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import mapUser from '/imports/ui/services/user/mapUser';
import { LockStruct } from './context';
import { withLockContext } from './withContext';


const lockContextContainer = component => withTracker(() => {
  const lockSetting = new LockStruct();
  const Meeting = Meetings.findOne({ meetingId: Auth.meetingID });
  const User = Users.findOne({ userId: Auth.userID });
  const mappedUser = mapUser(User);
  const userIsLocked = mappedUser.isLocked;
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
})(withLockContext(component));

export default lockContextContainer;
