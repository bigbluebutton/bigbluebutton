import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import SelectionModification from '/imports/ui/components/whiteboard/annotation-selection-modification/component';
import WhiteboardToolbarService from '/imports/ui/components/whiteboard/whiteboard-toolbar/service';
import PropTypes from 'prop-types';

const SelectionModificationContainer = (props) => (<SelectionModification {...props} />);

export default withTracker(() => {
  const drawSettings = WhiteboardToolbarService.getCurrentDrawSettings();
  return {
    tool: drawSettings ? drawSettings.whiteboardAnnotationTool : '',
  };
})(SelectionModificationContainer);

SelectionModificationContainer.propTypes = {
  zoom: PropTypes.number.isRequired,
};
