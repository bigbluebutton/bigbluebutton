import React from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import PresentationAreaService from './service';
import PresentationArea from './component';

const PresentationAreaContainer = ({ children, ...rest }) => (
  <PresentationArea {...rest}>
    {children}
  </PresentationArea>
  );

export default createContainer(() => ({
  currentSlide: PresentationAreaService.getCurrentSlide(),
  userIsPresenter: PresentationAreaService.isPresenter(),
  multiUser: PresentationAreaService.getMultiUserStatus(),
}), PresentationAreaContainer);


PresentationAreaContainer.propTypes = {
  children: PropTypes.element,
};
