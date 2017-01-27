import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Application from './component';

// import Service from './service';

class ApplicationContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Application {...this.props}>
        {this.props.children}
      </Application>
    );
  }
}

export default createContainer(() => {
  return {
    a: 'a',
  };
}, ApplicationContainer);
