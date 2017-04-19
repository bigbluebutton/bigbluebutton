import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import WhiteboardToolbarService from './service';
import WhiteboardToolbar from './component';

class WhiteboardToolbarContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <WhiteboardToolbar {...this.props}/>
    );
  }
}

export default createContainer(() => ({
  undoAnnotation: WhiteboardToolbarService.undoAnnotation,
  // clearWhiteboard: PresentationOverlayService.clearWhiteboard,
}), WhiteboardToolbarContainer);
