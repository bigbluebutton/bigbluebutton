import { useQuery } from '@apollo/client';
import React, { useCallback, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { getCustomParameter } from './queries';

interface CustomUsersSettingsProps {
  children: React.ReactNode;
}

const CustomUsersSettings: React.FC<CustomUsersSettingsProps> = ({
  children,
}) => {
  const {
    data: customParameterData,
    loading: customParameterLoading,
    error: customParameterError,
  } = useQuery(getCustomParameter);
  const [allowToRender, setAllowToRender] = React.useState(false);
  const sendToServer = useCallback((data, count = 0) => {
    Meteor.callAsync('addUserSettings', data).then(() => {
      setAllowToRender(true);
    })
      .catch(() => {
        if (count < 3) {
          setTimeout(() => {
            sendToServer(data, count + 1);
          }, 500);
        } else {
          throw new Error('Error on sending user settings to server');
        }
      });
  }, []);
  useEffect(() => {
    if (customParameterData && !customParameterLoading) {
      const filteredData = customParameterData.user_customParameter.map(uc => {
        const { parameter, value } = uc;
        return { [parameter]: value };
      });
      sendToServer(filteredData);
    }
  }, [
    customParameterData,
    customParameterLoading,
  ]);

  useEffect(() => {
    if (customParameterError) {
      throw new Error(`Error on requesting custom parameter data: ${customParameterError}`);
    }
  }, [customParameterError]);

  return allowToRender ? <>{children}</> : null;
};

export default CustomUsersSettings;
