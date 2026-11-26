import React, { useEffect, useRef, useState } from 'react';
import { setUserSettings } from '/imports/ui/core/local-states/useUserSettings';
import { setUseCurrentLocale } from '/imports/ui/core/local-states/useCurrentLocale';
import BBBWeb from '/imports/api/bbb-web-api';
import Session from '/imports/ui/services/storage/in-memory';
import Auth from '/imports/ui/services/auth';
import { ErrorScreen } from '/imports/ui/components/error-screen/component';
import {
  ERROR_CODE_GENERIC,
  ERROR_CODE_SESSION_ENDED,
  MISSING_TOKEN_DESCRIPTION,
  RETRY_DESCRIPTION,
  SESSION_ENDED_DESCRIPTION,
  isSessionExpired,
  rejectOnHttpError,
} from '/imports/ui/components/error-screen/loader-error';
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
  const [errorCode, setErrorCode] = useState(ERROR_CODE_GENERIC);

  useEffect(() => {
    setLoading(true);

    const controller = new AbortController();
    timeoutRef.current = setTimeout(() => {
      controller.abort();
      setError('Timeout fetching user custom settings');
      Session.setItem('errorMessageDescription', RETRY_DESCRIPTION);
      setLoading(false);
    }, CONNECTION_TIMEOUT);

    const sessionToken = Auth.sessionToken as string | null;

    if (!sessionToken) {
      clearTimeout(timeoutRef.current);
      setLoading(false);
      setError('Missing session token');
      Session.setItem('errorMessageDescription', MISSING_TOKEN_DESCRIPTION);
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
          .then(rejectOnHttpError)
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
            const mergedSettings = filteredData.reduce((acc, item) => Object.assign(acc, item), {});
            setUserSettings(mergedSettings);
            if (typeof mergedSettings.bbb_override_default_locale === 'string') {
              setUseCurrentLocale(mergedSettings.bbb_override_default_locale);
            }
            setFetched(true);
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          })
          .catch((fetchError) => {
            // The token can go stale between this fetch and the settings one that preceded it.
            if (isSessionExpired(fetchError)) {
              setErrorCode(ERROR_CODE_SESSION_ENDED);
              setError('Session no longer valid');
              Session.setItem('errorMessageDescription', SESSION_ENDED_DESCRIPTION);
              return;
            }
            setError('Error fetching user custom settings');
            Session.setItem('errorMessageDescription', RETRY_DESCRIPTION);
          })
          .finally(() => {
            // Every terminal path clears the timeout: left armed, it would fire a minute later and
            // rewrite the message the user is already reading.
            clearTimeout(timeoutRef.current);
            setLoading(false);
          });
      }).catch((error) => {
        clearTimeout(timeoutRef.current);
        setLoading(false);
        setError('Error fetching GraphQL URL: '.concat(error?.message || ''));
        Session.setItem('errorMessageDescription', RETRY_DESCRIPTION);
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

export default CustomUsersSettings;
