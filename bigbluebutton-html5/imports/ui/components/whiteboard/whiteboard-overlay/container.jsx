import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import WhiteboardOverlayService from './service';
import WhiteboardOverlay from './component';

class WhiteboardOverlayContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    if(this.props.drawSettings) {
      return (
        <WhiteboardOverlay {...this.props}/>
      );
    } else {
      return null;
    }
  }
}

export default createContainer(() => ({
  sendAnnotation: WhiteboardOverlayService.sendAnnotation,
  drawSettings: WhiteboardOverlayService.getWhiteboardToolbarValues(),
  textShapeValue: WhiteboardOverlayService.getTextShapeValue(),
}), WhiteboardOverlayContainer);
