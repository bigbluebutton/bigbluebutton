import React, { Component } from 'react';
import PropTypes from 'prop-types';
import logger, { generateLoggerStreams } from '/imports/startup/client/logger';
import apolloContextHolder from '/imports/ui/core/graphql/apolloContextHolder/apolloContextHolder';
import Session from '/imports/ui/services/storage/in-memory';
import { ApolloLink } from '@apollo/client';

const propTypes = {
  children: PropTypes.element.isRequired,
  Fallback: PropTypes.func,
  errorMessage: PropTypes.string,
  logMetadata: PropTypes.shape({
    logCode: PropTypes.string,
    logMessage: PropTypes.string,
  }),
  isCritical: PropTypes.bool,
  captureGlobalLogs: PropTypes.bool,
};

const defaultProps = {
  Fallback: null,
  errorMessage: 'Something went wrong',
  logMetadata: {
    logCode: 'Error_Boundary_wrapper',
    logMessage: 'generic error boundary logger',
  },
  isCritical: false,
  captureGlobalLogs: false,
};

class ErrorBoundary extends Component {
  static installClientErrorListeners() {
    //  Normalize different error objects (Error, plain object, string) into a consistent shape
    //  for structured logging
    const toErrorInfo = (e) => {
      if (e instanceof Error) {
        return { errorMessage: e.message, errorName: e.name, errorStack: e.stack };
      }
      if (e && typeof e === 'object') {
        return {
          errorMessage: e.message || String(e),
          errorName: e.name,
          errorStack: e.stack,
        };
      }
      return { errorMessage: String(e) };
    };

    // Handles `window.error` events.
    // Two main cases:
    //  - Resource load errors:
    //    <script>, <img>, <link> failed to load → ev.target points to element
    //  - Runtime JS errors: uncaught exceptions → ErrorEvent on window
    const onErrorCapture = (ev) => {
      // Resource error (img/script/css not loading)
      if (ev && ev.target && ev.target !== window) {
        const el = ev.target;
        const tag = el.tagName?.toLowerCase?.() || 'unknown';
        const src = el.getAttribute?.('src') || el.getAttribute?.('href') || '';
        logger.warn(
          {
            logCode: 'resource_load_error',
            extraInfo: { tag, src, currentUrl: window.location.href },
          },
          `Resource load error: <${tag}> src=${src}`,
        );
        return;
      }

      // JS runtime error (uncaught exception bubbling to window)
      if (ev instanceof ErrorEvent) {
        logger.error(
          {
            logCode: 'runtime_error',
            extraInfo: {
              filename: ev.filename,
              lineno: ev.lineno,
              colno: ev.colno,
              ...toErrorInfo(ev.error),
            },
          },
          `Runtime error: ${ev.message} (${ev.filename}:${ev.lineno}:${ev.colno})`,
        );
      }
    };

    // Handles unhandled promise rejections (e.g., fetch().then() chain throwing without catch).
    const onUnhandledRejection = (ev) => {
      const info = toErrorInfo(ev.reason);
      logger.error(
        {
          logCode: 'unhandled_rejection',
          extraInfo: {
            ...info,
            reasonType: typeof ev.reason,
            currentUrl: window.location.href,
          },
        },
        `Unhandled rejection: ${info.errorMessage || String(ev.reason)}`,
      );
    };

    window.addEventListener('error', onErrorCapture, true);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    return () => {
      window.removeEventListener('error', onErrorCapture, true);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }

  constructor(props) {
    super(props);
    this.state = { error: '', errorInfo: null };
    this.uninstallListeners = null;
  }

  componentDidMount() {
    const {
      captureGlobalLogs,
    } = this.props;
    const data = window.meetingClientSettings.public;
    const logConfig = data?.clientLog;
    const { enableRuntimeErrorLogging } = window.meetingClientSettings.public.clientLog.console;
    if (logConfig && logger?.getStreams().length === 0) {
      generateLoggerStreams(logConfig).forEach((stream) => logger.addStream(stream));
    }
    // captureGlobalLogs its meant for only the main error boundary on top level capture the errors
    // and not all the error boundaries around the client
    if (captureGlobalLogs && enableRuntimeErrorLogging) {
      this.uninstallListeners = ErrorBoundary.installClientErrorListeners();
    }
  }

  componentDidUpdate() {
    const { error, errorInfo } = this.state;
    const { logMetadata: { logCode, logMessage } } = this.props;
    if (error || errorInfo) {
      // eslint-disable-next-line no-console
      console.log('%cErrorBoundary caught an error: ', 'color: red', error);
      // eslint-disable-next-line no-console
      console.log('ErrorInfo: ', errorInfo);

      logger.error(
        {
          logCode,
          extraInfo: {
            errorMessage: error?.message,
            errorStack: error?.stack,
            errorInfo,
          },
        },
        logMessage,
      );
    }
  }

  componentDidCatch(error, errorInfo) {
    const { isCritical } = this.props;

    if (isCritical) {
      window.dispatchEvent(new Event('StopAudioTracks'));

      const mediaCfg = window.meetingClientSettings.public.media;
      const mediaElement = document.querySelector(mediaCfg?.mediaTag || '#remote-media');
      if (mediaElement) {
        mediaElement.pause();
        mediaElement.srcObject = null;
      }

      const apolloClient = apolloContextHolder.getClient();
      if (apolloClient) apolloClient.stop();

      const ws = apolloContextHolder.getLink();
      if (ws) {
        setTimeout(() => {
          apolloClient.setLink(ApolloLink.empty());
          ws.terminate();
        }, 5000);
      }
    }

    if ('cause' in error) {
      Session.setItem('errorMessageDescription', error.cause);
    }

    this.setState({ error, errorInfo });
  }

  componentWillUnmount() {
    if (this.uninstallListeners) {
      this.uninstallListeners();
      this.uninstallListeners = null;
    }
  }

  render() {
    const { error } = this.state;
    const { children, Fallback, errorMessage } = this.props;

    const fallbackElement = Fallback && error
      ? <Fallback error={error || {}} />
      : <div>{errorMessage}</div>;

    return error ? fallbackElement : children;
  }
}

ErrorBoundary.propTypes = propTypes;
ErrorBoundary.defaultProps = defaultProps;

export default ErrorBoundary;

export const withErrorBoundary = (WrappedComponent, FallbackComponent) => (props) => (
  <ErrorBoundary Fallback={FallbackComponent}>
    <WrappedComponent {...props} />
  </ErrorBoundary>
);
