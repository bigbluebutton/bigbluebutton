import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';

import Service from './service';
import PresentationUploader from './component';

const PresentationUploaderContainer = props => (
  <PresentationUploader {...props} />
);

export default withTracker(() => {
  const PRESENTATION_CONFIG = Meteor.settings.public.presentation;
  const currentPresentations = Service.getPresentations();

  return {
    presentations: currentPresentations,
    defaultFileName: PRESENTATION_CONFIG.defaultPresentationFile,
    fileSizeMin: PRESENTATION_CONFIG.uploadSizeMin,
    fileSizeMax: PRESENTATION_CONFIG.uploadSizeMax,
    fileValidMimeTypes: PRESENTATION_CONFIG.uploadValidMimeTypes,
    handleSave: presentations => Service.persistPresentationChanges(
      currentPresentations,
      presentations,
      PRESENTATION_CONFIG.uploadEndpoint,
    ),
  };
})(PresentationUploaderContainer);
