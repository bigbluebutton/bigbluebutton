import React, { useEffect, useRef, useState } from 'react';
import Users from '/imports/api/users';
import logger from '/imports/startup/client/logger';
import { AdapterProps } from '../graphqlToMiniMongoAdapterManager/component';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const UserGrapQlMiniMongoAdapter: React.FC<AdapterProps> = ({
  onReady,
  children,
}) => {
  const ready = useRef(false);
  const {
    data,
    errors: error,
  } = useCurrentUser((u) => u);
  const [userDataSetted, setUserDataSetted] = useState(false);

  useEffect(() => {
    if (error) {
      logger.error('Error in UserGrapQlMiniMongoAdapter', error);
    }
  }, [error]);

  useEffect(() => {
    if (data) {
      if (!ready.current) {
        ready.current = true;
        onReady('UserGrapQlMiniMongoAdapter');
      }
      const { userId } = data;
      Users.upsert({ userId }, data);
      if (!userDataSetted) {
        setUserDataSetted(true);
      }
    }
  }, [data]);
  return children;
};

export default UserGrapQlMiniMongoAdapter;
