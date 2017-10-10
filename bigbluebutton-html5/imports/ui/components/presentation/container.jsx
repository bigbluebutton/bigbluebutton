import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import PresentationAreaService from './service';
import PresentationArea from './component';

const PresentationAreaContainer = props => (
  <PresentationArea {...props} />
);

export default createContainer(() => ({
  currentSlide: PresentationAreaService.getCurrentSlide(),
  userIsPresenter: PresentationAreaService.isPresenter(),
  multiUser: PresentationAreaService.getMultiUserStatus(),
}), PresentationAreaContainer);
