import React from 'react';
import { makeCall } from '/imports/ui/services/api';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import Presentations from '/imports/api/presentations';
import PresentationAreaService from '/imports/ui/components/presentation/service';
import Poll from './component';
import Service from './service';

const PollContainer = ({ ...props }) => <Poll {...props} />;

export default withTracker(({ }) => {
  Meteor.subscribe('current-poll', Auth.meetingID);

  const currentPresentation = Presentations.findOne({
    current: true,
  });

  const currentSlide = PresentationAreaService.getCurrentSlide(currentPresentation.podId);

  const startPoll = type => makeCall('startPoll', type, currentSlide.id);

  const startCustomPoll = (type, answers) => makeCall('startPoll', type, currentSlide.id, answers);

  return {
    currentSlide,
    currentUser: Service.currentUser(),
    pollTypes: Service.pollTypes,
    startPoll,
    startCustomPoll,
    stopPoll: Service.stopPoll,
    publishPoll: Service.publishPoll,
    currentPoll: Service.currentPoll(),
    getUser: Service.getUser,
  };
})(PollContainer);
