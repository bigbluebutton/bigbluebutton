import React from 'react';
import { injectIntl } from 'react-intl';
import RaiseHandButton from './component';
import Auth from '/imports/ui/services/auth';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const RaiseHandButtonContainer = ({ ...props }) => {
  const { data: currentUserData } = useCurrentUser((user) => ({
    raiseHand: user.raiseHand,
  }));

  const currentUser = {
    userId: Auth.userID,
    raiseHand: currentUserData?.raiseHand,
  };

  return (
    <RaiseHandButton {...{
      ...currentUser,
      ...props,
    }}
    />
  );
};

export default injectIntl(RaiseHandButtonContainer);
