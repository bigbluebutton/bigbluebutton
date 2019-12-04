import React, { Component } from 'react';

const injectWbResizeEvent = WrappedComponent =>
  class Resize extends Component {
    componentDidMount() {
      window.dispatchEvent(new Event('resize'));
    }

    componentWillUnmount() {
      window.dispatchEvent(new Event('resize'));
    }

    render() {
      return (
        <WrappedComponent {...this.props} />
      );
    }
  };

export default injectWbResizeEvent;
