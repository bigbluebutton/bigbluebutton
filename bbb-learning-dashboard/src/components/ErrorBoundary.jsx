import React from 'react';
import { FormattedMessage } from 'react-intl';
import ErrorMessage from './ErrorMessage';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // eslint-disable-next-line no-console
    console.error('Learning Dashboard render failed', error, errorInfo);
  }

  render() {
    const { hasError } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <ErrorMessage
          message={(
            <FormattedMessage
              id="app.learningDashboard.errors.genericError"
              defaultMessage="Something went wrong. Please reload the page."
            />
          )}
        />
      );
    }

    return children;
  }
}

ErrorBoundary.defaultProps = {
  children: null,
};

export default ErrorBoundary;
