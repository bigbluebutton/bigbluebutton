import { useQuery } from '@apollo/client';
import React, { useEffect } from 'react';
import { getCustomParameter } from './queries';
import { makeCall } from '/imports/ui/services/api';

const CustomUsersSettings: React.FC = () => {
  const {
    data: customParameterData,
    loading: customParameterLoading,
    error: customParameterError,
  } = useQuery(getCustomParameter);

  useEffect(() => {
    if (customParameterData && !customParameterLoading) {
      makeCall('addUserSettings', customParameterData.user_customParameter);
    }
  }, [
    customParameterData,
    customParameterLoading,
  ]);

  useEffect(() => {
    if (customParameterError) {
      console.error(customParameterError);
    }
  }, [customParameterError]);

  return customParameterError ? <div>{JSON.stringify(customParameterError)}</div> : null;
};

export default CustomUsersSettings;
