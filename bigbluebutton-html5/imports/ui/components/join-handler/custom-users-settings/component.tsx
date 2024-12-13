import React, { useEffect, useRef, useState } from 'react';
import { setUserSettings } from '/imports/ui/core/local-states/useUserSettings';
import BBBWeb from '/imports/api/bbb-web-api';
import Session from '/imports/ui/services/storage/in-memory';
import { ErrorScreen } from '/imports/ui/components/error-screen/component';
import LoadingScreen from '/imports/ui/components/common/loading-screen/component';

const CONNECTION_TIMEOUT = 60000;

interface CustomUsersSettingsProps {
  children: React.ReactNode;
}

interface Response {
  user_metadata: Array<{
    parameter: string;
    value: string;
  }>;
}

const CustomUsersSettings: React.FC<CustomUsersSettingsProps> = ({
  children,
}) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [fetched, setFetched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);

    const controller = new AbortController();
    timeoutRef.current = setTimeout(() => {
      controller.abort();
      setError('Timeout fetching user custom settings');
      setLoading(false);
    }, CONNECTION_TIMEOUT);

    const urlParams = new URLSearchParams(window.location.search);
    const sessionToken = urlParams.get('sessionToken');

    if (!sessionToken) {
      setLoading(false);
      setError('Missing session token');
      return undefined;
    }

    BBBWeb.index(controller.signal)
      .then(({ data }) => {
        const url = new URL(`${data.graphqlApiUrl}/userMetadata`);
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
            const filteredData = data.user_metadata.map((uc) => {
              const { parameter, value } = uc;
              let parsedValue: string | boolean | string[] = '';
              try {
                parsedValue = JSON.parse(uc.value);
              } catch {
                parsedValue = value;
              }
              return { [parameter]: parsedValue };
            });
            setUserSettings(filteredData.reduce((acc, item) => Object.assign(acc, item), {}));
            setFetched(true);
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          }).catch(() => {
            setError('Error fetching user custom settings');
            Session.setItem('errorMessageDescription', 'meeting_ended');
          })
          .finally(() => {
            setLoading(false);
          });
      }).catch((error) => {
        setLoading(false);
        setError('Error fetching GraphQL URL: '.concat(error?.message || ''));
      });

    return () => {
      clearTimeout(timeoutRef.current);
      controller.abort();
    };
  }, []);

  return (
    <>
      {fetched ? children : null}
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

export default CustomUsersSettings;
