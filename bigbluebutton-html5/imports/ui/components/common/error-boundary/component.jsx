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
  // isCritical: flags this error boundary as critical for the app's lifecycle,
  // which means that the app should not continue to run if this error boundary
  // is triggered. If true, terminates RTC audio connections and the Apollo client.
  isCritical: PropTypes.bool,
};

const defaultProps = {
  Fallback: null,
  errorMessage: 'Something went wrong',
  logMetadata: {
    logCode: 'Error_Boundary_wrapper',
    logMessage: 'generic error boundary logger',
  },
  isCritical: false,
};

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: '', errorInfo: null };
  }

  componentDidMount() {
    const data = window.meetingClientSettings.public;
    const logConfig = data?.clientLog;
    if (logConfig && logger?.getStreams().length === 0) {
      generateLoggerStreams(logConfig).forEach((stream) => {
        logger.addStream(stream);
      });
    }
  }

  componentDidUpdate() {
    const { error, errorInfo } = this.state;
    const { logMetadata: { logCode, logMessage } } = this.props;
    if (error || errorInfo) {
      console.log('%cErrorBoundary caught an error: ', 'color: red', error);
      console.log('ErrorInfo: ', errorInfo);
      logger.error({
        logCode,
        extraInfo: {
          errorMessage: error?.message,
          errorStack: error?.stack,
          errorInfo,
        },
      }, logMessage);
    }
  }

  componentDidCatch(error, errorInfo) {
    const { isCritical } = this.props;

    if (isCritical) {
      window.dispatchEvent(new Event('StopAudioTracks'));
      const data = window.meetingClientSettings.public.media;
      const mediaElement = document.querySelector(data?.mediaTag || '#remote-media');
      if (mediaElement) {
        mediaElement.pause();
        mediaElement.srcObject = null;
      }
      const apolloClient = apolloContextHolder.getClient();

      if (apolloClient) {
        apolloClient.stop();
      }

      const ws = apolloContextHolder.getLink();
      if (ws) {
        // delay to termintate the connection, for user receive the end eject message
        setTimeout(() => {
          apolloClient.setLink(ApolloLink.empty());
          ws.terminate();
        }, 5000);
      }
    }

    if ('cause' in error) {
      Session.setItem('errorMessageDescription', error.cause);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    const { error } = this.state;
    const { children, Fallback, errorMessage } = this.props;

    const fallbackElement = Fallback && error
      ? <Fallback error={error || {}} /> : <div>{errorMessage}</div>;
    return (error
      ? fallbackElement
      : children);
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
