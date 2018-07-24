import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { getSwapLayout } from '/imports/ui/components/media/service';
import PresentationAreaService from './service';
import PresentationArea from './component';

const PresentationAreaContainer = ({ presentationPodIds, ...props }) => (
  <PresentationArea {...props} />
);

export default withTracker(({ podId }) => ({
  currentSlide: PresentationAreaService.getCurrentSlide(podId),
  userIsPresenter: PresentationAreaService.isPresenter(podId) && !getSwapLayout(),
  multiUser: PresentationAreaService.getMultiUserStatus(podId) && !getSwapLayout(),
}))(PresentationAreaContainer);
