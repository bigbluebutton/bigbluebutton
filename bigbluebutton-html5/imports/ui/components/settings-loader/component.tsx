import { useQuery } from '@apollo/client';
import React, { useContext, useEffect } from 'react';
import { getBigBlueButtonSettings, getBigBlueButtonSettingsResponse } from './queries';
import { setMeetingSettings } from '../../core/local-states/useMeetingSettings';
import MeetingClientSettings from '../../Types/meetingClientSettings';
import ClientStartup from '/client/clientStartup';
import { LoadingContext } from '../common/loading-screen/loading-screen-HOC/component';

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
    loadingContextInfo.setLoading(true, 'Fetching settings');
  }, []);

  useEffect(() => {
    if (!loading && !error) {
      const settings = data?.meeting[0].clientSettings.clientSettingsJson;
      if (settings && Object.keys(settings).length > 0) {
        window.meetingClientSettings = JSON.parse(JSON.stringify(settings as unknown as MeetingClientSettings));
        setMeetingSettings(settings as unknown as MeetingClientSettings);
        setAllowToRender(true);
      }
    }
  }, [loading]);
  if (loading) return null;
  if (error) {
    throw new Error('Error on requesting meeting settings data: ', error);
  }
  return (
    (allowToRender)
      ? <ClientStartup />
      : null
  );
};

export default SettingsLoader;
