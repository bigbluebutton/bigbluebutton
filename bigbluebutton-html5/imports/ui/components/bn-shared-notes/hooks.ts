import { HocuspocusProvider, HocuspocusProviderWebsocket } from '@hocuspocus/provider';
import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { GET_PAD_ID, GetPadIdQueryResponse } from '../notes/queries';
import logger from '/imports/startup/client/logger';

const hasSessionToken = (sessionToken?: string | null) => sessionToken !== undefined || sessionToken !== null;
const checkLockReason = (reason: string): boolean => reason === 'Lock rules changed.';

const useHocuspocusProvider = () => {
  const [hocuspocusProvider, setHocuspocusProvider] = useState<HocuspocusProvider>();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionClosed, setConnectionClosed] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const NOTES_CONFIG = window.meetingClientSettings.public.notes;
  const { data: padIdData, loading: padIdLoading } = useQuery<GetPadIdQueryResponse>(
    GET_PAD_ID,
    { variables: { externalId: NOTES_CONFIG.id } },
  );
  const padId = padIdData?.sharedNotes?.[0]?.padId;

  const urlParams = new URLSearchParams(window.location.search);
  const sessionToken = urlParams.get('sessionToken');

  const handleRetry = () => {
    setError(null);
    setConnectionClosed(false);
    setHocuspocusProvider(undefined);
    setRetryTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    if (!hocuspocusProvider
      && !padIdLoading
      && padId
      && hasSessionToken(sessionToken)
      && !isAuthenticating
    ) {
      const documentName = padId;
      const blockNoteToken = sessionToken;

      const wsProvider = new HocuspocusProviderWebsocket({
        url: 'wss://bbb30.bbb.imdt.dev/hocuspocus/collaboration',
        maxAttempts: 1,
        parameters: {
          sessionToken,
        },
      });
      setIsAuthenticating(true);
      const provider = new HocuspocusProvider({
        name: documentName,
        token: blockNoteToken,
        websocketProvider: wsProvider,
        onConnect: () => {
          setHocuspocusProvider(provider);
          setIsAuthenticating(false);
        },
        onAuthenticated: () => {
          setIsAuthenticating(false);
        },
        onAuthenticationFailed: (data) => {
          setError('Authentication failed');
          logger.error({
            logCode: 'hocuspocus_authentication_failed',
            extraInfo: {
              reason: data.reason,
              documentId: documentName,
            },
          }, `Authentication failed while trying to connect to hocuspocus server [${data.reason}]`);
        },
        onClose: (data) => {
          logger.debug({
            logCode: 'hocuspocus_closed_connection',
            extraInfo: {
              code: data.event.code,
              reason: data.event.reason,
              documentId: documentName,
            },
          }, `Hocuspocus server closed websocket connection, reason: ${data.event.reason}`);

          const {
            code,
            reason,
          } = data.event;

          if (code === 1008 && checkLockReason(reason)) {
            handleRetry();
          } else {
            setConnectionClosed(true);
            setIsAuthenticating(false);
          }
        },
      });
    }
  }, [retryTrigger, sessionToken, padIdLoading, padId]);

  return {
    hocuspocusProvider,
    isAuthenticating,
    error,
    connectionClosed,
    handleRetry,
  };
};

export default useHocuspocusProvider;
