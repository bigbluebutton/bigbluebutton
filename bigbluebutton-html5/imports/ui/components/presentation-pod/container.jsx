import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import PresentationPodService from './service';
import PresentationPods from './component';

// PresentationPods component will be the place to go once we have the presentation pods designs
// it should give each PresentationAreaContainer some space
// which it will fill with the uploaded presentation
const PresentationPodsContainer = ({ presentationPodIds, ...props }) => {
  if (presentationPodIds && presentationPodIds.length > 0) {
    return (
      <PresentationPods presentationPodIds={presentationPodIds} {...props} />
    );
  }

  return null;
};

export default withTracker(() => {
  const presentationPodIds = PresentationPodService.getPresentationPodIds();
  const data = {
    presentationPodIds,
  };

  return data;
})(PresentationPodsContainer);

PresentationPodsContainer.propTypes = {
  presentationPodIds: PropTypes.arrayOf(PropTypes.shape({
    podId: PropTypes.string.isRequired,
  })).isRequired,
};
