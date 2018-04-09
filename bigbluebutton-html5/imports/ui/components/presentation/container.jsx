import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PresentationAreaService from './service';
import PresentationArea from './component';

const PresentationAreaContainer = props => (
  <PresentationArea {...props} />
);

export default withTracker(() => {
  const currentSlide = PresentationAreaService.getCurrentSlide();
  const userIsPresenter = PresentationAreaService.isPresenter();
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
