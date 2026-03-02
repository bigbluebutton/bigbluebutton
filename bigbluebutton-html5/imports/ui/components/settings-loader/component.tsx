import React, { useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { setMeetingSettings } from '/imports/ui/core/local-states/useMeetingSettings';
import MeetingClientSettings from '/imports/ui/Types/meetingClientSettings';
import { ErrorScreen } from '/imports/ui/components/error-screen/component';
import LoadingScreen from '/imports/ui/components/common/loading-screen/component';
import BBBWeb from '/imports/api/bbb-web-api';
import MeetingStaticDataStore from '/imports/ui/core/singletons/meetingStaticData';

const connectionTimeout = 60000;

declare global {
  interface Window {
    meetingClientSettings: MeetingClientSettings;
  }
}

interface SettingsLoaderProps {
  children: React.ReactNode;
}

const SettingsLoader: React.FC<SettingsLoaderProps> = (props) => {
  const { children } = props;
  const [settingsFetched, setSettingsFetched] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setLoading(true);

    const controller = new AbortController();
    timeoutRef.current = setTimeout(() => {
      controller.abort();
      setError('Timeout fetching client settings');
      setLoading(false);
    }, connectionTimeout);

    const clientSessionUUID = uuid();
    sessionStorage.setItem('clientSessionUUID', clientSessionUUID);

    const urlParams = new URLSearchParams(window.location.search);
    const sessionToken = urlParams.get('sessionToken');

    if (!sessionToken) {
      setLoading(false);
      setError('Missing session token');
      return;
    }

    BBBWeb.request(
      (data) => `${data.graphqlApiUrl}/meetingStaticData`,
      {
        fetchOptions: {
          method: 'GET',
          credentials: 'include',
          headers: {
            'x-session-token': sessionToken ?? '',
          },
        },
        signal: controller.signal,
        timeout: connectionTimeout / 3,
        retries: 3,
        retryDelay: 1000,
      },
    )
      .then((response) => response.json())
      .then((data) => {
        clearTimeout(timeoutRef.current);

        const { clientSettings, ...staticData } = data?.meeting[0];
        const settings = clientSettings.clientSettingsJson;

        window.meetingClientSettings = structuredClone(settings);
        MeetingStaticDataStore.setMeetingData(staticData);
        setMeetingSettings(settings);
        setSettingsFetched(true);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        setError('Error fetching GraphQL URL: '.concat(error.message || ''));
      });
  }, []);

  return (
    <>
      {settingsFetched ? children : null}
      {error ? (
        <ErrorScreen
          endedReason={error}
        />
      ) : null}
      {loading ? (
        <LoadingScreen />
      ) : null}
    </>
  );
};

export default SettingsLoader;
