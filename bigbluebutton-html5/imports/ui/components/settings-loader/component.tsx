import React, { useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { setMeetingSettings } from '/imports/ui/core/local-states/useMeetingSettings';
import MeetingClientSettings from '/imports/ui/Types/meetingClientSettings';
import { ErrorScreen } from '/imports/ui/components/error-screen/component';
import {
  ERROR_CODE_GENERIC,
  ERROR_CODE_SESSION_ENDED,
  MISSING_TOKEN_DESCRIPTION,
  RETRY_DESCRIPTION,
  SESSION_ENDED_DESCRIPTION,
  isSessionExpired,
  rejectOnHttpError,
  sessionEndedError,
} from '/imports/ui/components/error-screen/loader-error';
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
  const [errorCode, setErrorCode] = React.useState<string>(ERROR_CODE_GENERIC);
  const [loading, setLoading] = React.useState<boolean>(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setLoading(true);

    const controller = new AbortController();
    timeoutRef.current = setTimeout(() => {
      controller.abort();
      setError('Timeout fetching client settings');
      Session.setItem('errorMessageDescription', RETRY_DESCRIPTION);
      setLoading(false);
    }, connectionTimeout);

    const clientSessionUUID = uuid();
    sessionStorage.setItem('clientSessionUUID', clientSessionUUID);

    const sessionToken = Auth.sessionToken as string | null;

    if (!sessionToken) {
      clearTimeout(timeoutRef.current);
      setLoading(false);
      setError('Missing session token');
      Session.setItem('errorMessageDescription', MISSING_TOKEN_DESCRIPTION);
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
          .then(rejectOnHttpError)
          .then((resp) => resp.json())
          .then((data: Response) => {
            clearTimeout(timeoutRef.current);
            const meeting = data?.meeting?.[0];

            if (!meeting) throw sessionEndedError('No meeting for this session token');

            const {
              clientSettings,
              ...staticData
            } = meeting;
            const settings = clientSettings.clientSettingsJson;
            window.meetingClientSettings = JSON.parse(JSON.stringify(settings));
            MeetingStaticDataStore.setMeetingData(staticData);
            setMeetingSettings(settings);
            setLoading(false);
            setSettingsFetched(true);
          })
          .catch((fetchError) => {
            // Every terminal path clears the timeout: left armed, it would fire a minute later and
            // rewrite the message the user is already reading.
            clearTimeout(timeoutRef.current);
            setLoading(false);
            // An expired link is not an unexpected error - and no other failure is an expired link.
            if (isSessionExpired(fetchError)) {
              setErrorCode(ERROR_CODE_SESSION_ENDED);
              setError('Session no longer valid');
              Session.setItem('errorMessageDescription', SESSION_ENDED_DESCRIPTION);
              return;
            }
            setError('Error fetching client settings');
            Session.setItem('errorMessageDescription', RETRY_DESCRIPTION);
          });
      }).catch((error) => {
        clearTimeout(timeoutRef.current);
        setLoading(false);
        setError('Error fetching GraphQL URL: '.concat(error.message || ''));
        Session.setItem('errorMessageDescription', RETRY_DESCRIPTION);
      });
  }, []);

  return (
    <>
      {settingsFetched ? children : null}
      {error ? (
        <ErrorScreen
          code={errorCode}
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
