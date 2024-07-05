import React from 'react';
import { injectIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import ActivityCheck from './component';
import { USER_SEND_ACTIVITY_SIGN } from './mutations';

const ActivityCheckContainer = (props) => {
  const [userActivitySign] = useMutation(USER_SEND_ACTIVITY_SIGN);

  return <ActivityCheck userActivitySign={userActivitySign} {...props} />;
};

export default injectIntl(ActivityCheckContainer);
