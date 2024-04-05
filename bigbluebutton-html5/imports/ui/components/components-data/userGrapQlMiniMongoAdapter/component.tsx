import React, { useEffect, useState } from 'react';
import Users from '/imports/api/users';
import logger from '/imports/startup/client/logger';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const UserGrapQlMiniMongoAdapter: React.FC = () => {
  const { data: currentUser, errors } = useCurrentUser((u) => u);
  const [userDataSetted, setUserDataSetted] = useState(false);

  useEffect(() => {
    if (errors) {
      logger.error('Error in UserGrapQlMiniMongoAdapter', errors);
    }
  }, [errors]);

  useEffect(() => {
    if (currentUser) {
      const { userId } = currentUser;
      Users.upsert({ userId }, currentUser);
      if (!userDataSetted) {
        setUserDataSetted(true);
      }
    }
  }, [currentUser]);
  return null;
};

export default UserGrapQlMiniMongoAdapter;
