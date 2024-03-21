import React, { useContext, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { getBigBlueButtonSettings, getBigBlueButtonSettingsResponse } from './queries';
import { setMeetingSettings } from '../../core/local-states/useMeetingSettings';
import MeetingClientSettings from '../../Types/meetingClientSettings';
import ClientStartup from '/client/clientStartup';
import { LoadingContext } from '../common/loading-screen/loading-screen-HOC/component';
import CustomUsersSettings from '../join-handler/custom-users-settings/component';
import logger from '/imports/startup/client/logger';

declare global {
  interface Window {
    meetingClientSettings: MeetingClientSettings;
  }
}

const SettingsLoader: React.FC = () => {
  const { loading, error, data } = useQuery<getBigBlueButtonSettingsResponse>(getBigBlueButtonSettings);
  const [allowToRender, setAllowToRender] = React.useState(false);
  const loadingContextInfo = useContext(LoadingContext);
  useEffect(() => {
    logger.info('Fetching settings');
    loadingContextInfo.setLoading(true, '3/4');
  }, []);

  useEffect(() => {
    if (!loading && !error) {
      const settings = data?.meeting[0].clientSettings.clientSettingsJson;
      if (settings && Object.keys(settings).length > 0) {
        window.meetingClientSettings = JSON.parse(JSON.stringify(settings as unknown as MeetingClientSettings));
        const Meteor = { settings: {} };
        Meteor.settings = window.meetingClientSettings;
        setMeetingSettings(settings as unknown as MeetingClientSettings);
        setAllowToRender(true);
      }
    }
  }, [loading]);
  if (loading) return null;
  if (error) {
    loadingContextInfo.setLoading(false, '');
    throw new Error('Error on requesting meeting settings data: ', error);
  }
  return (
    (allowToRender)
      ? (
        <CustomUsersSettings>
          <ClientStartup />
        </CustomUsersSettings>
      )
      : null
  );
};

export default SettingsLoader;
