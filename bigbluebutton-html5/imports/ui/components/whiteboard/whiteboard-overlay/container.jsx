import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import WhiteboardOverlayService from './service';
import WhiteboardOverlay from './component';

class WhiteboardOverlayContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <WhiteboardOverlay {...this.props}/>
    );
  }
}

export default createContainer(() => ({
  sendAnnotation: WhiteboardOverlayService.sendAnnotation,
}), WhiteboardOverlayContainer);
