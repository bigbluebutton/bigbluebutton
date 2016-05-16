import { eventEmitter } from '/imports/startup/server';
import { addShapeToCollection } from '/imports/api/shapes/server/modifiers/addShapeToCollection';
import { removeAllShapesFromSlide } from '/imports/api/shapes/server/modifiers/removeAllShapesFromSlide';
import { removeShapeFromSlide } from '/imports/api/shapes/server/modifiers/removeShapeFromSlide';

eventEmitter.on('get_whiteboard_shapes_reply', function (arg) {
  if (arg.payload.requester_id === 'nodeJSapp') {
    const meetingId = arg.payload.meeting_id;
    const shapes = arg.payload.shapes;
    const shapesLength = shapes.length;
    for (let m = 0; m < shapesLength; m++) {
      let shape = shapes[m];
      let whiteboardId = shape.wb_id;
      addShapeToCollection(meetingId, whiteboardId, shape);
    }

    return arg.callback();
  }
});

eventEmitter.on('send_whiteboard_shape_message', function (arg) {
  const payload = arg.payload;
  const meetingId = payload.meeting_id;

  //Meteor stringifies an array of JSONs (...shape.result) in this message
  //parsing the String and reassigning the value
  if (payload.shape.shape_type === 'poll_result' &&
    typeof payload.shape.shape.result === 'string') {
    payload.shape.shape.result = JSON.parse(payload.shape.shape.result);
  }

  const shape = payload.shape;
  if (!!shape && !!shape.wb_id) {
    const whiteboardId = shape.wb_id;
    addShapeToCollection(meetingId, whiteboardId, shape);
  }

  return arg.callback();
});

eventEmitter.on('whiteboard_cleared_message', function (arg) {
  const meetingId = arg.payload.meeting_id;
  const whiteboardId = arg.payload.whiteboard_id;
  removeAllShapesFromSlide(meetingId, whiteboardId);
  return arg.callback();
});

eventEmitter.on('undo_whiteboard_request', function (arg) {
  const meetingId = arg.payload.meeting_id;
  const whiteboardId = arg.payload.whiteboard_id;
  const shapeId = arg.payload.shape_id;
  removeShapeFromSlide(meetingId, whiteboardId, shapeId);
  return arg.callback();
});
