import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import PresentationOverlayService from './service';
import PresentationOverlay from './component';

const PresentationOverlayContainer = ({children, ...rest}) => {
  return (
    <PresentationOverlay {...rest}>
      {children}
    </PresentationOverlay>
  );
};

export default createContainer(() => ({
  updateCursor: PresentationOverlayService.updateCursor,
}), PresentationOverlayContainer);
