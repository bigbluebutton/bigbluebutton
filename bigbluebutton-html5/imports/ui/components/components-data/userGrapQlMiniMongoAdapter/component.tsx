import { useSubscription } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import CURRENT_USER_SUBSCRIPTION from '/imports/ui/core/graphql/queries/currentUserSubscription';
import { User } from '/imports/ui/Types/user';
import Users from '/imports/api/users';
import logger from '/imports/startup/client/logger';

interface UserCurrentResponse {
  user_current: Array<User>;
}

const UserGrapQlMiniMongoAdapter: React.FC = () => {
  const {
    error,
    data,
  } = useSubscription<UserCurrentResponse>(CURRENT_USER_SUBSCRIPTION);
  const [userDataSetted, setUserDataSetted] = useState(false);

  useEffect(() => {
    if (error) {
      logger.error('Error in UserGrapQlMiniMongoAdapter', error);
    }
  }, [error]);

  useEffect(() => {
    if (data && data.user_current) {
      const { userId } = data.user_current[0];
      Users.upsert({ userId }, data.user_current[0]);
      if (!userDataSetted) {
        setUserDataSetted(true);
      }
    }
  }, [data]);
  return null;
};

export default UserGrapQlMiniMongoAdapter;
