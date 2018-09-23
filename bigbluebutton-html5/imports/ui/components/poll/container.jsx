import React from 'react';
import { makeCall } from '/imports/ui/services/api';
import Presentations from '/imports/api/presentations';
import PresentationAreaService from '/imports/ui/components/presentation/service';
import Poll from './component';

export default PollContainer = () => {
  const currentPresentation = Presentations.findOne({
    current: true,
  });

  const currentSlide = PresentationAreaService.getCurrentSlide(currentPresentation.podId);

  const pollTypes = {
    YN: 'YN', // Yes,No
    TF: 'TF', // True,False
    A2: 'A-2', // A,B
    A3: 'A-3', // A,B,C
    A4: 'A-4', // A,B,C,D
    A5: 'A-5', // A,B,C,D,E
  };

  const startPoll = type => makeCall('initiatePoll', type, currentSlide.id);

  return (
    <Poll
      {...{
            pollTypes,
            startPoll,
        }}
    />
  );
};
