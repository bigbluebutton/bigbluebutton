import React, { useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { mergeDeepRight } from 'ramda';
import { setMeetingSettings } from '/imports/ui/core/local-states/useMeetingSettings';
import MeetingClientSettings from '/imports/ui/Types/meetingClientSettings';
import meetingClientSettingsInitialValues from '/imports/ui/core/initial-values/meetingClientSettings';
import { ErrorScreen } from '/imports/ui/components/error-screen/component';
import LoadingScreen from '/imports/ui/components/common/loading-screen/component';
import Session from '/imports/ui/services/storage/in-memory';
import Auth from '/imports/ui/services/auth';
import BBBWeb from '/imports/api/bbb-web-api';
import MeetingStaticDataStore from '/imports/ui/core/singletons/meetingStaticData';
import { MeetingStaticData } from '/imports/ui/Types/meetingStaticData';

const connectionTimeout = 60000;

type Meeting = MeetingStaticData & {
  clientSettings: {
    clientSettingsJson: MeetingClientSettings;
  };
};
interface Response {
  meeting: Array<Meeting>;
}

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

    const sessionToken = Auth.sessionToken as string | null;

    if (!sessionToken) {
      setLoading(false);
      setError('Missing session token');
      return;
    }

    BBBWeb.index(controller.signal)
      .then(({ data }) => {
        const url = new URL(`${data.graphqlApiUrl}/meetingStaticData`);
        fetch(url, {
          method: 'get',
          credentials: 'include',
          headers: {
            'x-session-token': sessionToken ?? '',
          },
          signal: controller.signal,
        })
          .then((resp) => resp.json())
          .then((data: Response) => {
            clearTimeout(timeoutRef.current);
            const {
              clientSettings,
              ...staticData
            } = data?.meeting[0];
            const settings = clientSettings.clientSettingsJson;
            // Deep-merge over the client defaults so a deployment running an
            // outdated settings.yml (missing keys added later) falls back to
            // the default value for those keys instead of crashing on
            // undefined, while the server's values still take precedence.
            const mergedSettings = mergeDeepRight(
              meetingClientSettingsInitialValues,
              settings,
            ) as MeetingClientSettings;
            window.meetingClientSettings = JSON.parse(JSON.stringify(mergedSettings));
            MeetingStaticDataStore.setMeetingData(staticData);
            setMeetingSettings(mergedSettings);
            setLoading(false);
            setSettingsFetched(true);
          }).catch(() => {
            setLoading(false);
            setError('Error fetching client settings');
            Session.setItem('errorMessageDescription', 'meeting_ended');
          });
      }).catch((error) => {
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
