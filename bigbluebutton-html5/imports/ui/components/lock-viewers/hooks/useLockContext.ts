import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { LockStruct } from '../context/context';

const useLockContext = () => {
  const lockSetting = LockStruct();

  const { data: meeting } = useMeeting((m) => ({
    lockSettings: m.lockSettings,
  }));
  const { data: user } = useCurrentUser((u) => ({
    role: u.role,
    locked: u.locked,
  }));

  const ROLE_MODERATOR = window.meetingClientSettings.public.user.role_moderator;
  const userIsLocked = Boolean(user ? user.locked && user.role !== ROLE_MODERATOR : true);
  const { lockSettings } = meeting || {};

  lockSetting.isLocked = userIsLocked;
  lockSetting.lockSettings = lockSettings || lockSetting.lockSettings;
  lockSetting.userLocks.userWebcam = Boolean(userIsLocked && lockSettings?.disableCam);
  lockSetting.userLocks.userMic = Boolean(userIsLocked && lockSettings?.disableMic);
  lockSetting.userLocks.userNotes = Boolean(userIsLocked && lockSettings?.disableNotes);
  lockSetting.userLocks.userPrivateChat = Boolean(userIsLocked && lockSettings?.disablePrivateChat);
  lockSetting.userLocks.userPublicChat = Boolean(userIsLocked && lockSettings?.disablePublicChat);
  lockSetting.userLocks.hideViewersCursor = Boolean(userIsLocked && lockSettings?.hideViewersCursor);
  lockSetting.userLocks.hideViewersAnnotation = Boolean(userIsLocked && lockSettings?.hideViewersAnnotation);

  return lockSetting;
};

export default useLockContext;
