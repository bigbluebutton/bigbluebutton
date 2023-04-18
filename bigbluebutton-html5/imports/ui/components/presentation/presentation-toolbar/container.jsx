import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import PresentationService from '/imports/ui/components/presentation/service';
import PollService from '/imports/ui/components/poll/service';
import { makeCall } from '/imports/ui/services/api';
import PresentationToolbar from './component';
import PresentationToolbarService from './service';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import Auth from '/imports/ui/services/auth';
import FullscreenService from '/imports/ui/components/common/fullscreen-button/service';
import { isPollingEnabled } from '/imports/ui/services/features';
import { CurrentPoll } from '/imports/api/polls';

const PresentationToolbarContainer = (props) => {
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const currentUser = users[Auth.meetingID][Auth.userID];
  const userIsPresenter = currentUser.presenter;

  const { layoutSwapped } = props;

  const handleToggleFullScreen = (ref) => FullscreenService.toggleFullScreen(ref);

  const endCurrentPoll = () => {
    if (CurrentPoll.findOne({ meetingId: Auth.meetingID })) makeCall('stopPoll');
  };

  if (userIsPresenter && !layoutSwapped) {
    // Only show controls if user is presenter and layout isn't swapped

    return (
      <PresentationToolbar
        {...props}
        amIPresenter={userIsPresenter}
        endCurrentPoll={endCurrentPoll}
        {...{
          handleToggleFullScreen,
        }}
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

  const startPoll = (type, id, answers = [], question = '', multiResp = false) => {
    Session.set('openPanel', 'poll');
    Session.set('forcePollOpen', true);
    window.dispatchEvent(new Event('panelChanged'));

    makeCall('startPoll', PollService.pollTypes, type, id, false, question, multiResp, answers);
  };

  return {
    numberOfSlides: PresentationToolbarService.getNumberOfSlides(podId, presentationId),
    nextSlide: PresentationToolbarService.nextSlide,
    previousSlide: PresentationToolbarService.previousSlide,
    skipToSlide: PresentationToolbarService.skipToSlide,
    isMeteorConnected: Meteor.status().connected,
    isPollingEnabled: isPollingEnabled(),
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

  // Total number of slides in this presentation
  numberOfSlides: PropTypes.number.isRequired,

  // Actions required for the presenter toolbar
  nextSlide: PropTypes.func.isRequired,
  previousSlide: PropTypes.func.isRequired,
  skipToSlide: PropTypes.func.isRequired,
  layoutSwapped: PropTypes.bool,
};

PresentationToolbarContainer.defaultProps = {
  layoutSwapped: false,
};
