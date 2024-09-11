import React from 'react';
import { injectIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import ActivityCheck from './component';
import { USER_SEND_ACTIVITY_SIGN } from './mutations';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const ActivityCheckContainer = () => {
  const [userActivitySign] = useMutation(USER_SEND_ACTIVITY_SIGN);
  const { data: currentUserData } = useCurrentUser((user) => ({
    inactivityWarningDisplay: user.inactivityWarningDisplay,
    inactivityWarningTimeoutSecs: user.inactivityWarningTimeoutSecs,
  }));
  const inactivityWarningDisplay = currentUserData?.inactivityWarningDisplay;
  const inactivityWarningTimeoutSecs = currentUserData?.inactivityWarningTimeoutSecs;

  if (!inactivityWarningDisplay) return null;

  return (
    <ActivityCheck
      userActivitySign={userActivitySign}
      inactivityCheck={inactivityWarningDisplay}
      responseDelay={inactivityWarningTimeoutSecs}
    />
  );
};

export default injectIntl(ActivityCheckContainer);
