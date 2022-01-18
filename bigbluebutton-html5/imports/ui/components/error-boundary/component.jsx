import React, { Component } from 'react';
import PropTypes from 'prop-types';
import logger from '/imports/startup/client/logger';

const propTypes = {
  children: PropTypes.element.isRequired,
  Fallback: PropTypes.func.isRequired,
};

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: false, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    logger.error({
      logCode: 'Error_Boundary_wrapper',
      extraInfo: { error, errorInfo },
    }, 'generic error boundary logger');
  }

  render() {
    const { error } = this.state;
    const { children, Fallback } = this.props;

    return (error ? (<Fallback {...this.state} />) : children);
  }
}

ErrorBoundary.propTypes = propTypes;

export const withErrorBoundary = (WrappedComponent, FallbackComponent) => (props) => (
  <ErrorBoundary Fallback={FallbackComponent}>
    <WrappedComponent {...props} />
  </ErrorBoundary>
);

export default ErrorBoundary;
