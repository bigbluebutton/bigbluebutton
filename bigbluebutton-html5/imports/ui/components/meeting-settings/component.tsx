import { useQuery } from '@apollo/client';
import React, { useEffect } from 'react';
import { getBigblueButtonSettings, getBigblueButtonSettingsResponse } from './queries';
import LoadingScreen from '/imports/ui/components/common/loading-screen/component';
import { setMeetingSettings } from '../../core/local-states/useMeetingSettings';
import MeetingClientSettings from '../../Types/meetingClientSettings';

interface MeetingSettingsLoaderProps {
  children: React.ReactNode;
}

const MeetingSettingsLoader: React.FC<MeetingSettingsLoaderProps> = ({
  children,
}) => {
  const { loading, error, data } = useQuery<getBigblueButtonSettingsResponse>(getBigblueButtonSettings);
  const [allowTorender, setAllowTorender] = React.useState(false);
  useEffect(() => {
    if (!loading && !error) {
      const settings = data?.meeting[0].clientSettings.clientSettingsJson;
      if (settings && Object.keys(settings).length > 0) {
        setMeetingSettings(settings as unknown as MeetingClientSettings);
        setAllowTorender(true);
      }
    }
  }, [loading]);

  if (loading) return null;
  if (error) {
    return (
      <div>
        <p>Error :(</p>
        <p>{JSON.stringify(error)}</p>
      </div>
    );
  }

  return (
    (!allowTorender || loading) ? (
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
      : children
  );
};

export default MeetingSettingsLoader;
