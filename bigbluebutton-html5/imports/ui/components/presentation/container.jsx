import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { getSwapLayout } from '/imports/ui/components/media/service';
import PresentationAreaService from './service';
import PresentationArea from './component';

const PresentationAreaContainer = ({ presentationPodIds, ...props }) => (
  <PresentationArea {...props} />
);

export default withTracker(({ podId }) => {
  const currentSlide = PresentationAreaService.getCurrentSlide(podId);
  return {
    currentSlide,
    userIsPresenter: PresentationAreaService.isPresenter(podId) && !getSwapLayout(),
    multiUser: PresentationAreaService.getMultiUserStatus(currentSlide && currentSlide.id) && !getSwapLayout(),
  };
})(PresentationAreaContainer);
