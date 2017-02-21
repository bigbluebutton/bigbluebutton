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
    fontSizes: {
      1: { size: '12px', name: 'Extra Small' },
      2: { size: '14px', name: 'Small' },
      3: { size: '16px', name: 'Medium' },
      4: { size: '18px', name: 'Large' },
      5: { size: '20px', name: 'Extra Large' },
    },
  };
}, ApplicationContainer);
