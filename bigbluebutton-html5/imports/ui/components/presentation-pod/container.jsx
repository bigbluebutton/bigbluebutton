import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import ErrorBoundary from '/imports/ui/components/common/error-boundary/component';
import FallbackView from '/imports/ui/components/common/fallback-errors/fallback-view/component';
import PresentationPodService from './service';
import PresentationPods from './component';

// PresentationPods component will be the place to go once we have the presentation pods designs
// it should give each PresentationContainer some space
// which it will fill with the uploaded presentation
const PresentationPodsContainer = ({ presentationPodIds, ...props }) => {
  if (presentationPodIds && presentationPodIds.length > 0) {
    return (
      <ErrorBoundary Fallback={FallbackView}>
        <PresentationPods presentationPodIds={presentationPodIds} {...props} />
      </ErrorBoundary>
    );
  }

  return null;
};

export default withTracker(() => ({
  presentationPodIds: PresentationPodService.getPresentationPodIds(),
}))(PresentationPodsContainer);

PresentationPodsContainer.propTypes = {
  presentationPodIds: PropTypes.arrayOf(PropTypes.shape({
    podId: PropTypes.string.isRequired,
  })).isRequired,
};
