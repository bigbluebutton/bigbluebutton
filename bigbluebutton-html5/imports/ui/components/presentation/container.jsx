import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PresentationAreaService from './service';
import PresentationArea from './component';

const PresentationAreaContainer = props => (
  <PresentationArea {...props} />
);

export default withTracker(() => ({
  currentSlide: PresentationAreaService.getCurrentSlide(),
  userIsPresenter: PresentationAreaService.isPresenter(),
  multiUser: PresentationAreaService.getMultiUserStatus(),
}))(PresentationAreaContainer);
