import { useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { USER_CHANGED_LOCAL_SETTINGS } from './mutations';

const useUserChangedLocalSettings = () => {
  const [userChangedLocalSettings] = useMutation(USER_CHANGED_LOCAL_SETTINGS);

  const setLocalSettings = (settings: Record<string, unknown>) => {
    return userChangedLocalSettings({
      variables: {
        settings,
      },
    });
  };

  return useCallback(setLocalSettings, [userChangedLocalSettings]);
};

export default useUserChangedLocalSettings;
