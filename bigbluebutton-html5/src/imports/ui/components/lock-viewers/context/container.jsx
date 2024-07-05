import React, { useMemo } from 'react';
import { LockStruct } from './context';
import { withLockContext } from './withContext';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';

const lockContextContainer = (component) => (props) => {
  const lockSetting = new LockStruct();

  const { data: meeting } = useMeeting((m) => ({
    lockSettings: m.lockSettings,
  }));
  const { data: user } = useCurrentUser((u) => ({
    role: u.role,
    locked: u.locked,
  }));

  const ROLE_MODERATOR = window.meetingClientSettings.public.user.role_moderator;
  const userIsLocked = user ? user.locked && user.role !== ROLE_MODERATOR : true;
  const { lockSettings } = meeting || {};

  lockSetting.isLocked = userIsLocked;
  lockSetting.lockSettings = lockSettings;
  lockSetting.userLocks.userWebcam = (userIsLocked && lockSettings?.disableCam) || false;
  lockSetting.userLocks.userMic = (userIsLocked && lockSettings?.disableMic) || false;
  lockSetting.userLocks.userNotes = (userIsLocked && lockSettings?.disableNotes) || false;
  lockSetting.userLocks.userPrivateChat = (userIsLocked
    && lockSettings?.disablePrivateChat) || false;
  lockSetting.userLocks.userPublicChat = (userIsLocked && lockSettings?.disablePublicChat) || false;
  lockSetting.userLocks.hideViewersCursor = (userIsLocked
    && lockSettings?.hideViewersCursor) || false;
  lockSetting.userLocks.hideViewersAnnotation = (userIsLocked
    && lockSettings?.hideViewersAnnotation) || false;

  const ComponentWithContext = useMemo(() => withLockContext(component), []);
  // eslint-disable-next-line react/prop-types
  const { children } = props;
  return (
    <ComponentWithContext
      {...props}
      {...lockSetting}
    >
      {children}
    </ComponentWithContext>
  );
};

export default lockContextContainer;
