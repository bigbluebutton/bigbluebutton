import { useQuery } from '@apollo/client';
import React, { useEffect } from 'react';
import { UserCustomParameterResponse, getCustomParameter } from './queries';
import { setUserSettings } from '/imports/ui/core/local-states/useUserSettings';
import { containsBooleanValue } from './sevice';

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
  } = useQuery<UserCustomParameterResponse>(getCustomParameter);
  const [allowToRender, setAllowToRender] = React.useState(false);
  useEffect(() => {
    if (customParameterData && !customParameterLoading) {
      const filteredData = customParameterData.user_customParameter.map((uc) => {
        const { parameter, value } = uc;
        return { [parameter]: containsBooleanValue(value) ? JSON.parse(value.toLowerCase()) : value };
      });
      setUserSettings(filteredData.reduce((acc, item) => ({ ...acc, ...item }), {}));
      setAllowToRender(true);
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
