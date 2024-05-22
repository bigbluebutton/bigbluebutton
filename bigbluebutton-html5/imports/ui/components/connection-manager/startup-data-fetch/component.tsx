import React, { useEffect } from 'react';
import { Session } from 'meteor/session';
import { ErrorScreen } from '../../error-screen/component';
import LoadingScreen from '../../common/loading-screen/component';

const connectionTimeout = 60000;

interface Response {
  meeting_clientSettings: Array<{
    askForFeedbackOnLogout: boolean,
    allowDefaultLogoutUrl: boolean,
    learningDashboardBase: string,
    fallbackLocale: string,
    fallbackOnEmptyString: boolean,
    mediaTag: string,
    clientLog: {
      server: {
        level: string,
        enabled: boolean
      },
      console: {
        level: string,
        enabled: true
      },
      external: {
        url: string,
        level: string,
        logTag: string,
        method: string,
        enabled: boolean,
        flushOnClose: boolean,
        throttleInterval: number,
      }
    }
  }>
}

interface StartupDataFetchProps {
  children: React.ReactNode;
}

const StartupDataFetch: React.FC<StartupDataFetchProps> = ({
  children,
}) => {
  const [settingsFetched, setSettingsFetched] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();
  const [loading, setLoading] = React.useState<boolean>(false);
  useEffect(() => {
    setLoading(true);
    timeoutRef.current = setTimeout(() => {
      setError('Timeout on fetching startup data');
      setLoading(false);
    }, connectionTimeout);
    const urlParams = new URLSearchParams(window.location.search);
    const sessionToken = urlParams.get('sessionToken');

    if (!sessionToken) {
      setError('Missing session token');
      setLoading(false);
      return;
    }
    const clientStartupSettings = `/api/rest/clientStartupSettings/?sessionToken=${sessionToken}`;
    const url = new URL(`${window.location.origin}${clientStartupSettings}`);
    fetch(url, { method: 'get' })
      .then((resp) => resp.json())
      .then((data: Response) => {
        const settings = data.meeting_clientSettings[0];
        sessionStorage.setItem('clientStartupSettings', JSON.stringify(settings || {}));
        setSettingsFetched(true);
        clearTimeout(timeoutRef.current);
        setLoading(false);
      }).catch(() => {
        Session.set('errorMessageDescription', 'meeting_ended');
        setError('Error fetching startup data');
        setLoading(false);
      });
  }, []);

  return (
    <>
      {settingsFetched ? children : null}
      {error
        ? (
          <ErrorScreen
            endedReason={error}
            code={403}
          />
        )
        : null}
      {loading
        ? (
          <LoadingScreen>
            <div style={{ display: 'none' }}>
              Loading...
            </div>
          </LoadingScreen>
        )
        : null}
    </>
  );
};

export default StartupDataFetch;
