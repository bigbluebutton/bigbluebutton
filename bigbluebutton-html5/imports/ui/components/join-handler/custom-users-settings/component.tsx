import { useQuery } from '@apollo/client';
import React, { useEffect } from 'react';
import { UserMetadataResponse, getUserMetadata } from './queries';
import { setUserSettings } from '/imports/ui/core/local-states/useUserSettings';

interface CustomUsersSettingsProps {
  children: React.ReactNode;
}

const CustomUsersSettings: React.FC<CustomUsersSettingsProps> = ({
  children,
}) => {
  const {
    data: userMetadataData,
    loading: userMetadataLoading,
    error: userMetadataError,
  } = useQuery<UserMetadataResponse>(getUserMetadata);
  const [allowToRender, setAllowToRender] = React.useState(false);
  useEffect(() => {
    if (userMetadataData && !userMetadataLoading) {
      const filteredData = userMetadataData.user_metadata.map((uc) => {
        const { parameter, value } = uc;
        let parsedValue: string | boolean | string[] = '';
        try {
          parsedValue = JSON.parse(uc.value);
        } catch {
          parsedValue = value;
        }
        return { [parameter]: parsedValue };
      });
      setUserSettings(filteredData.reduce((acc, item) => ({ ...acc, ...item }), {}));
      setAllowToRender(true);
    }
  }, [
    userMetadataData,
    userMetadataLoading,
  ]);

  useEffect(() => {
    if (userMetadataError) {
      throw new Error(`Error on requesting custom parameter data: ${userMetadataError}`);
    }
  }, [userMetadataError]);

  return allowToRender ? <>{children}</> : null;
};

export default CustomUsersSettings;
