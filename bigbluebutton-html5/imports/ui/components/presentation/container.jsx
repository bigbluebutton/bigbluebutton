import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PresentationAreaService from './service';
import PresentationArea from './component';

const PresentationAreaContainer = ({ presentationPodIds, ...props }) => (
  <PresentationArea {...props} />
);

export default withTracker((params) => {
  const { podId } = params;
  const currentSlide = PresentationAreaService.getCurrentSlide(podId);
  const userIsPresenter = PresentationAreaService.isPresenter(podId);
  const multiUser = currentSlide ?
    PresentationAreaService.getMultiUserStatus(currentSlide.id) :
    false;

  const data = {
    currentSlide,
    userIsPresenter,
    multiUser,
  };
  return data;
})(PresentationAreaContainer);
