import React, {
  useState, useEffect, useRef, useCallback,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import logger from '/imports/startup/client/logger';
import {
  ErrorContainer, Message, Spinner, ReloadButton,
} from './styles';

const intlMessages = defineMessages({
  attemptingToRecover: {
    id: 'app.errorBoundary.attemptingToRecover',
    defaultMessage: 'Something went wrong. Attempting to recover...',
  },
  unableToRecover: {
    id: 'app.errorBoundary.unableToRecover',
    defaultMessage: 'Unable to recover after multiple attempts.',
  },
  reloadPage: {
    id: 'app.errorBoundary.reloadPage',
    defaultMessage: 'Reload Page',
  },
});

const MAX_RETRIES = 3;

const ErrorBoundaryWithReload = ({ children }) => {
  const intl = useIntl();
  const [hasError, setHasError] = useState(false);
  const [errorKey, setErrorKey] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const resetTimeout = useRef(null);

  const handleReset = useCallback(() => {
    setHasError(false);
    setErrorKey((prev) => prev + 1);
    setErrorCount(0);
    if (resetTimeout.current) clearTimeout(resetTimeout.current);
  }, []);

  const triggerError = useCallback(() => {
    setErrorCount((prevCount) => {
      if (prevCount + 1 > MAX_RETRIES) {
        logger.error('Maximum retry attempts reached. Manual refresh required.');
        return prevCount + 1;
      }

      setHasError(true);
      resetTimeout.current = setTimeout(handleReset, 3000);
      return prevCount + 1;
    });
  }, [handleReset]);

  useEffect(() => {
    const handleGlobalError = (event) => {
      const errorTarget = event?.target;
      if (errorTarget && errorTarget.tagName) return;

      logger.error({
        logCode: 'ErrorBoundaryWithReload.GlobalError',
        extraInfo: {
          errorMessage: event.error?.message || event.message,
          errorStack: event.error?.stack,
        },
      }, 'Global error caught by ErrorBoundaryWithReload');

      // Ignore errors caused by ResizeObserver in chrome <100
      if (event.reason?.message?.toString().indexOf('ResizeObserver loop limit exceeded') !== -1) {
        return;
      }

      triggerError();
    };

    const handleUnhandledRejection = (event) => {
      logger.error({
        logCode: 'ErrorBoundaryWithReload.UnhandledRejection',
        extraInfo: {
          errorMessage: event.reason?.message || 'Unhandled promise rejection',
          errorStack: event.reason?.stack,
        },
      }, 'Unhandled promise rejection caught by ErrorBoundaryWithReload');

      // Ignore errors caused by a Chrome Extension
      if (event.reason?.stack?.toString().indexOf('chrome-extension://') !== -1) {
        return;
      }

      // Ignore errors caused by missing permissions on graphql
      if (event.reason?.message?.toString().indexOf('Permission Denied') !== -1) {
        return;
      }
      // Ignore errors caused by missing permissions on browser
      if (event.reason?.name === 'NotAllowedError') {
        return;
      }

      triggerError();
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    setIsReady(true);

    return () => {
      if (resetTimeout.current) clearTimeout(resetTimeout.current);
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [triggerError]);

  if (!isReady) return null;

  if (hasError && errorCount <= MAX_RETRIES) {
    return (
      <ErrorContainer>
        <Message>{intl.formatMessage(intlMessages.attemptingToRecover)}</Message>
        <Spinner />
      </ErrorContainer>
    );
  }

  if (hasError && errorCount > MAX_RETRIES) {
    return (
      <ErrorContainer>
        <Message>{intl.formatMessage(intlMessages.unableToRecover)}</Message>
        <ReloadButton onClick={() => window.location.reload()}>
          {intl.formatMessage(intlMessages.reloadPage)}
        </ReloadButton>
      </ErrorContainer>
    );
  }

  return <React.Fragment key={errorKey}>{children}</React.Fragment>;
};

export default ErrorBoundaryWithReload;
