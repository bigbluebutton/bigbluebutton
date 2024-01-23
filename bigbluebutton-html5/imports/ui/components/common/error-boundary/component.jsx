import React, { Component } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  children: PropTypes.element.isRequired,
};

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: false, errorInfo: null };
  }

  componentDidUpdate() {
    const { error, errorInfo } = this.state;

    if (error || errorInfo) {
      console.error({
        logCode: 'Error_Boundary_wrapper',
        extraInfo: { error, errorInfo },
      }, 'generic error boundary logger');
    }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    const { error } = this.state;
    const { children } = this.props;

    return (error ? (
      <div>
        Error:
        {this.error}
      </div>
    ) : children);
  }
}

ErrorBoundary.propTypes = propTypes;

export default ErrorBoundary;

export const withErrorBoundary = (WrappedComponent, FallbackComponent) => (props) => (
  <ErrorBoundary Fallback={FallbackComponent}>
    <WrappedComponent {...props} />
  </ErrorBoundary>
);
