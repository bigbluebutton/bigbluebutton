import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import StaticAnnotation from './component';
import StaticAnnotationService from './service';
import ReactiveAnnotationService from '../reactive-annotation/service';

//import { Annotations } from '/imports/ui/components/whiteboard/service';
//import { UnsentAnnotations } from '/imports/ui/components/whiteboard/service';

const StaticAnnotationContainer = (props) => {
  return (
    <StaticAnnotation
      {...props}
    />
  );
};

export default withTracker((params) => {
  const {
    shapeId,
  } = params;

//console.log("STATIC_CONT", shapeId, params.whiteboardId);
//console.log(Annotations.find({whiteboardId: params.whiteboardId}).fetch());
  const annotation = StaticAnnotationService.getAnnotationById(shapeId);
  //var annotation = StaticAnnotationService.getAnnotationById(shapeId);
  if (!annotation){
//console.log(UnsentAnnotations.find({whiteboardId: params.whiteboardId}).fetch());
//console.log(UnsentAnnotations.findOne({_id: shapeId}));
console.log("FACTORY no annotation found! ShapeId:", shapeId);
    //annotation = ReactiveAnnotationService.getAnnotationById(shapeId);
  }

  return {
    // This is necessary to real-time update the movement. Otherwise the prop.version is undefined in the component.jsx
    version: annotation.version,
  };
})(StaticAnnotationContainer);

StaticAnnotationContainer.propTypes = {
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
