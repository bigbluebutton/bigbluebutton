import { useQuery } from '@apollo/client';
import React, { useEffect } from 'react';
import { getBigblueButtonSettings, getBigblueButtonSettingsResponse } from './queries';
import LoadingScreen from '/imports/ui/components/common/loading-screen/component';
import { setMeetingSettings } from '../../core/local-states/useMeetingSettings';
import MeetingClientSettings from '../../Types/meetingClientSettings';
import ClientStartup from '/client/clientStartup';

declare global {
  interface Window {
    meetingClientSettings: MeetingClientSettings;
  }
}

const SettingsLoader: React.FC = () => {
  const { loading, error, data } = useQuery<getBigblueButtonSettingsResponse>(getBigblueButtonSettings);
  const [allowToRender, setAllowToRender] = React.useState(false);

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
    (!allowToRender || loading) ? (
      <LoadingScreen>
        {/* I made this because the component is in JS and requires a child, but it's optional */}
        <div style={{
          display: 'none',
        }}
        >
          <h1>Loading...</h1>
        </div>
      </LoadingScreen>
    )
      : <ClientStartup />
  );
};

export default SettingsLoader;
