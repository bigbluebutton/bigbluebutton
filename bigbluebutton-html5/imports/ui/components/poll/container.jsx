import React from 'react';
import { makeCall } from '/imports/ui/services/api';
import { withTracker } from 'meteor/react-meteor-data';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import Presentations from '/imports/api/presentations';
import PresentationAreaService from '/imports/ui/components/presentation/service';
import Poll from './component';

const PollContainer = ({ ...props }) => <Poll {...props} />;

export default withTracker(({ }) => {
  const currentPresentation = Presentations.findOne({
    current: true,
  });

  const currentSlide = PresentationAreaService.getCurrentSlide(currentPresentation.podId);

  const currentUser = Users.findOne({ userId: Auth.userID });

  // 'YN' = Yes,No
  // 'TF' = True,False
  // 'A-2' = A,B
  // 'A-3' = A,B,C
  // 'A-4' = A,B,C,D
  // 'A-5' = A,B,C,D,E
  const pollTypes = ['YN', 'TF', 'A-2', 'A-3', 'A-4', 'A-5', 'custom'];

  const startPoll = type => makeCall('startPoll', type, currentSlide.id);

  const startCustomPoll = (type, answers) => makeCall('startPoll', type, currentSlide.id, answers);

  const stopPoll = () => makeCall('stopPoll', Auth.userId);

  const publishPoll = () => makeCall('publishPoll');

  return {
    currentSlide,
    currentUser,
    pollTypes,
    startPoll,
    startCustomPoll,
    stopPoll,
    publishPoll,
  };
})(PollContainer);
