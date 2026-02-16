import { HocuspocusProvider, HocuspocusProviderWebsocket } from '@hocuspocus/provider';
import { useQuery } from '@apollo/client';
import { useIntl } from 'react-intl';
import * as BlockNoteLocales from '@blocknote/core/locales';
import { useEffect, useState, useRef } from 'react';
import { GET_PAD_ID, GetPadIdQueryResponse } from '../notes/queries';
import logger from '/imports/startup/client/logger';

const hasSessionToken = (sessionToken?: string | null) => sessionToken !== undefined || sessionToken !== null;
const checkLockReason = (reason: string): boolean => reason === 'Lock rules changed.';

const useHocuspocusProvider = () => {
  const [hocuspocusProvider, setHocuspocusProvider] = useState<HocuspocusProvider>();
  const hocuspocusProviderRef = useRef<HocuspocusProvider>();
  const wsProviderRef = useRef<HocuspocusProviderWebsocket>();
  const isAuthenticating = useRef<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionClosed, setConnectionClosed] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [isSynced, setIsSynced] = useState(false);

  const NOTES_CONFIG = window.meetingClientSettings.public.notes;
  const { data: padIdData, loading: padIdLoading } = useQuery<GetPadIdQueryResponse>(
    GET_PAD_ID,
    { variables: { externalId: NOTES_CONFIG.id } },
  );
  const padId = padIdData?.sharedNotes?.[0]?.padId;

  const urlParams = new URLSearchParams(window.location.search);
  const sessionToken = urlParams.get('sessionToken');

  const handleRetry = () => {
    if (hocuspocusProviderRef.current) {
      hocuspocusProviderRef.current.destroy();
    }
    if (wsProviderRef.current) {
      wsProviderRef.current.destroy();
    }
    setError(null);
    setConnectionClosed(false);
    hocuspocusProviderRef.current = undefined;
    wsProviderRef.current = undefined;
    setHocuspocusProvider(undefined);
    setIsSynced(false);
    setRetryTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    if (!hocuspocusProvider
      && !padIdLoading
      && padId
      && hasSessionToken(sessionToken)
      && !isAuthenticating.current
    ) {
      const documentName = padId;
      const blockNoteToken = sessionToken;

      logger.debug({
        logCode: 'hocuspocus_creating_provider',
        extraInfo: { documentId: documentName },
      }, 'Creating new HocuspocusProvider instance');

      const wsProvider = new HocuspocusProviderWebsocket({
        url: `wss://${window.location.hostname}/hocuspocus/collaboration`,
        maxAttempts: 1,
        parameters: {
          sessionToken,
        },
      });
      isAuthenticating.current = true;
      const provider = new HocuspocusProvider({
        name: documentName,
        token: blockNoteToken,
        websocketProvider: wsProvider,
        onConnect: () => {
          logger.debug({
            logCode: 'hocuspocus_connected',
            extraInfo: { documentId: documentName },
          }, 'Hocuspocus connection established');
          isAuthenticating.current = false;
        },
        onAuthenticated: () => {
          logger.debug({
            logCode: 'hocuspocus_authenticated',
            extraInfo: { documentId: documentName },
          }, 'Hocuspocus authentication successful');
          isAuthenticating.current = false;
        },
        onSynced: ({ state }) => {
          logger.debug({
            logCode: 'hocuspocus_synced',
            extraInfo: {
              documentId: documentName,
              synced: state,
            },
          }, 'Hocuspocus document synced');
          const doc = provider.document;
          logger.debug({
            logCode: 'hocuspocus_fragment_content',
            extraInfo: {
              documentId: documentName,
              document: doc,
            },
          }, 'Fragment content after sync');
          setIsSynced(true);
          hocuspocusProviderRef.current = provider;
          wsProviderRef.current = wsProvider;
          setHocuspocusProvider(provider);
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

          // Handle security violations - do not reconnect
          if (code !== 1008 && code !== 1006) {
            let securityViolationReason = reason;
            if ((!reason || reason === '')) {
              switch (code) {
                case 1005:
                  securityViolationReason = 'Too many requests';
                  break;
                case 1009:
                  securityViolationReason = 'Payload too long';
                  break;
                default:
                  securityViolationReason = 'Unknown error - Contact administrators';
                  break;
              }
            }
            setError(`Security violation: ${securityViolationReason}`);
            isAuthenticating.current = false;
            // Destroy the provider to prevent reconnection attempts
            if (hocuspocusProviderRef.current) {
              hocuspocusProviderRef.current.destroy();
            }
            if (wsProviderRef.current) {
              wsProviderRef.current.destroy();
            }
            hocuspocusProviderRef.current = undefined;
            wsProviderRef.current = undefined;
          } else if (code === 1008 && checkLockReason(reason)) {
            handleRetry();
          } else {
            setConnectionClosed(true);
            isAuthenticating.current = false;
          }
        },
      });
    }
  }, [retryTrigger, sessionToken, padIdLoading, padId]);

  useEffect(() => () => {
    // Run on unmount
    if (hocuspocusProviderRef.current) {
      hocuspocusProviderRef.current.destroy();
    }
    if (wsProviderRef.current) {
      wsProviderRef.current.destroy();
    }
  }, []);

  return {
    hocuspocusProvider,
    isAuthenticating: isAuthenticating.current,
    isSynced,
    error,
    connectionClosed,
    handleRetry,
  };
};

// e.g.: zh-TW -> zhTW (That's how block-note maps their available languages)
const convertIntlLocaleIntoBNLocale = (intlLocale: string) => {
  const locale = new Intl.Locale(intlLocale);
  return `${locale.language}${locale.region || ''}`;
};

function useBlockNoteLocaleLanguage(): string {
  const {
    locale: currentLocale,
    defaultLocale,
  } = useIntl();

  const [blockNoteLocale, setBlockNoteLocale] = useState<string>(currentLocale);

  useEffect(() => {
    const currentLocaleInBnFormat = convertIntlLocaleIntoBNLocale(currentLocale);
    const intlCurrentLanguage = new Intl.Locale(currentLocale).language;
    const intlDefaultLanguage = new Intl.Locale(defaultLocale).language;
    const availableLanguages = Object.keys(BlockNoteLocales);

    if (availableLanguages.includes(currentLocaleInBnFormat)) {
      if (currentLocaleInBnFormat !== blockNoteLocale) setBlockNoteLocale(currentLocaleInBnFormat);
    } else if (availableLanguages.includes(intlCurrentLanguage)) {
      if (intlCurrentLanguage !== blockNoteLocale) setBlockNoteLocale(intlCurrentLanguage);
    } else if (availableLanguages.includes(defaultLocale)) {
      if (defaultLocale !== blockNoteLocale) setBlockNoteLocale(defaultLocale);
    } else if (availableLanguages.includes(intlDefaultLanguage)) {
      if (intlDefaultLanguage !== blockNoteLocale) setBlockNoteLocale(intlDefaultLanguage);
    } else {
      setBlockNoteLocale('en');
    }
  }, [
    currentLocale,
    defaultLocale,
  ]);

  return blockNoteLocale;
}

export { useHocuspocusProvider, useBlockNoteLocaleLanguage };
