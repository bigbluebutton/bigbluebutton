import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import PresentationOverlayService from './service';
import PresentationOverlay from './component';

class PresentationOverlayContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <PresentationOverlay {...this.props}/>
    );
  }
}

export default createContainer(() => ({
  updateCursor: PresentationOverlayService.updateCursor,
  isUserPresenter: PresentationOverlayService.getUserData().isUserPresenter,
}), PresentationOverlayContainer);
