import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import PresentationService from '/imports/ui/components/presentation/service';
import MediaService from '/imports/ui/components/media/service';
import Service from '/imports/ui/components/actions-bar/service';
import { makeCall } from '/imports/ui/services/api';
import PresentationToolbar from './component';
import PresentationToolbarService from './service';

const POLLING_ENABLED = Meteor.settings.public.poll.enabled;

const PresentationToolbarContainer = (props) => {
  const {
    userIsPresenter,
    layoutSwapped,
  } = props;

  if (userIsPresenter && !layoutSwapped) {
    // Only show controls if user is presenter and layout isn't swapped

    return (
      <PresentationToolbar
        {...props}
      />
    );
  }
  return null;
};

export default withTracker((params) => {
  const {
    podId,
    presentationId,
  } = params;

  const startPoll = (type, id) => {
    Session.set('openPanel', 'poll');
    Session.set('forcePollOpen', true);

    makeCall('startPoll', type, id);
  };

  return {
    amIPresenter: Service.amIPresenter(),
    layoutSwapped: MediaService.getSwapLayout() && MediaService.shouldEnableSwapLayout(),
    userIsPresenter: PresentationService.isPresenter(podId),
    numberOfSlides: PresentationToolbarService.getNumberOfSlides(podId, presentationId),
    nextSlide: PresentationToolbarService.nextSlide,
    previousSlide: PresentationToolbarService.previousSlide,
    skipToSlide: PresentationToolbarService.skipToSlide,
    isMeteorConnected: Meteor.status().connected,
    isPollingEnabled: POLLING_ENABLED,
    currentSlidHasContent: PresentationService.currentSlidHasContent(),
    parseCurrentSlideContent: PresentationService.parseCurrentSlideContent,
    startPoll,
  };
})(PresentationToolbarContainer);

PresentationToolbarContainer.propTypes = {
  // Number of current slide being displayed
  currentSlideNum: PropTypes.number.isRequired,
  zoom: PropTypes.number.isRequired,
  zoomChanger: PropTypes.func.isRequired,

  // Is the user a presenter
  userIsPresenter: PropTypes.bool.isRequired,

  // Total number of slides in this presentation
  numberOfSlides: PropTypes.number.isRequired,

  // Actions required for the presenter toolbar
  nextSlide: PropTypes.func.isRequired,
  previousSlide: PropTypes.func.isRequired,
  skipToSlide: PropTypes.func.isRequired,
};
