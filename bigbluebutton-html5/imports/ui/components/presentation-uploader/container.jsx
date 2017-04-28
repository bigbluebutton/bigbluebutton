import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import Service from './service';
import PresentationUploader from './component';

class PresentationUploaderContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <PresentationUploader {...this.props}>
        {this.props.children}
      </PresentationUploader>
    );
  }
}

export default createContainer(() => ({
  presentations: Service.getPresentations(),
}), PresentationUploaderContainer);
