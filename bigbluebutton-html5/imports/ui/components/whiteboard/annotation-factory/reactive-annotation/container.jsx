import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import MediaService, { getSwapLayout, shouldEnableSwapLayout } from '/imports/ui/components/media/service';
import ReactiveAnnotationService from './service';
import ReactiveAnnotation from './component';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import getFromUserSettings from '/imports/ui/services/users-settings';

const ROLE_VIEWER = Meteor.settings.public.user.role_viewer;

const ReactiveAnnotationContainer = (props) => {
  const { annotation, drawObject } = props;
  if (annotation && drawObject) {
    return (
      <ReactiveAnnotation
        annotation={props.annotation}
        slideWidth={props.slideWidth}
        slideHeight={props.slideHeight}
        drawObject={props.drawObject}
        whiteboardId={props.whiteboardId}
      />
    );
  }

  return null;
};

export default withTracker((params) => {
  const { shapeId } = params;
  const annotation = ReactiveAnnotationService.getAnnotationById(shapeId);
  const isViewer = Users.findOne({ meetingId: Auth.meetingID, userId: Auth.userID }, {
    fields: {
      role: 1,
    },
  }).role === ROLE_VIEWER;

  const restoreOnUpdate = getFromUserSettings(
    'bbb_force_restore_presentation_on_new_events',
    Meteor.settings.public.presentation.restoreOnUpdate,
  );

  if (restoreOnUpdate && isViewer) {
    const layoutSwapped = getSwapLayout() && shouldEnableSwapLayout();
    if (layoutSwapped) MediaService.toggleSwapLayout();
  }

  return {
    annotation,
  };
})(ReactiveAnnotationContainer);

ReactiveAnnotationContainer.propTypes = {
  whiteboardId: PropTypes.string.isRequired,
  annotation: PropTypes.objectOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.object,
  ])),
  drawObject: PropTypes.func.isRequired,
  slideWidth: PropTypes.number.isRequired,
  slideHeight: PropTypes.number.isRequired,
};

ReactiveAnnotationContainer.defaultProps = {
  annotation: undefined,
};
