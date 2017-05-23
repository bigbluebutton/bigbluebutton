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

export default createContainer(() => {
  const PRESENTATION_CONFIG = Meteor.settings.public.presentation;
  const currentPresentations = Service.getPresentations();

  return {
    presentations: currentPresentations,
    fileSizeMin: PRESENTATION_CONFIG.uploadSizeMin,
    fileSizeMax: PRESENTATION_CONFIG.uploadSizeMax,
    fileValidMimeTypes: PRESENTATION_CONFIG.uploadValidMimeTypes,
    handleSave: presentations => Service.persistPresentationChanges(
      currentPresentations,
      presentations,
      PRESENTATION_CONFIG.uploadEndpoint
    ),
  };
}, PresentationUploaderContainer);
