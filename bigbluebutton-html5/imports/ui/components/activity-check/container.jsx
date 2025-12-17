import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import ActivityCheck from './component';
import { USER_SEND_ACTIVITY_SIGN } from './mutations';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { useModalRegistration } from '../../core/singletons/modalController';

const ActivityCheckContainer = ({ intl }) => {
  const [userActivitySign] = useMutation(USER_SEND_ACTIVITY_SIGN);
  const { data: currentUserData } = useCurrentUser((user) => ({
    inactivityWarningDisplay: user.inactivityWarningDisplay,
    inactivityWarningTimeoutSecs: user.inactivityWarningTimeoutSecs,
  }));

  const {
    open: openActivityCheckModal,
    close: closeActivityCheckModal,
    isOpen: isActivityCheckModalOpen,
  } = useModalRegistration({
    id: 'ActivityCheckModal',
    priority: 'high',
  });

  const inactivityWarningDisplay = currentUserData?.inactivityWarningDisplay;
  const inactivityWarningTimeoutSecs = currentUserData?.inactivityWarningTimeoutSecs;

  useEffect(() => {
    if (inactivityWarningDisplay) {
      openActivityCheckModal();
    } else {
      closeActivityCheckModal();
    }
  }, [inactivityWarningDisplay]);

  if (!isActivityCheckModalOpen) return null;

  return (
    <ActivityCheck
      userActivitySign={userActivitySign}
      inactivityCheck={isActivityCheckModalOpen}
      responseDelay={inactivityWarningTimeoutSecs}
      intl={intl}
    />
  );
};
ActivityCheckContainer.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

export default injectIntl(ActivityCheckContainer);
