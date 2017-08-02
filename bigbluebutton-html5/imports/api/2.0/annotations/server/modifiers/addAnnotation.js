import { Match, check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Annotations from '/imports/api/2.0/annotations';

const ANNOTATION_TYPE_TEXT = 'text';
const ANNOTATION_TYPE_PENCIL = 'pencil';

export default function addAnnotation(meetingId, whiteboardId, userId, annotation) {
  check(meetingId, String);
  check(whiteboardId, String);
  check(annotation, {
    id: String,
    status: String,
    annotationType: String,
    annotationInfo: {
      x: Match.Maybe(Number), // Text Annotation Only.
      y: Match.Maybe(Number), // Text Annotation Only.
      text: Match.Maybe(String), // Text Annotation Only.
      fontColor: Match.Maybe(Number), // Text Annotation Only.
      calcedFontSize: Match.Maybe(Number), // Text Annotation Only.
      textBoxWidth: Match.Maybe(Number), // Text Annotation Only.
      textBoxHeight: Match.Maybe(Number), // Text Annotation Only.
      fontSize: Match.Maybe(Number), // Text Annotation Only.
      dataPoints: Match.Maybe(String), // Text Annotation Only.
      color: Match.Maybe(Number), // Draw Annotation Only.
      thickness: Match.Maybe(Number), // Draw Annotation Only.
      transparency: Match.Maybe(Boolean), // Draw Annotation Only.
      points: Match.Maybe([Number]), // Draw and Poll Annotation Only.
      numResponders: Match.Maybe(Number), // Poll Only Annotation.
      result: Match.Maybe([{
        id: Number,
        key: String,
        numVotes: Number,
      }]), // Poll Only Annotation.
      numRespondents: Match.Maybe(Number), // Poll Only Annotation.
      id: String,
      whiteboardId: String,
      status: String,
      type: String,
      commands: Match.Maybe([Number]),
    },
    wbId: String,
    userId: String,
    position: Number,
  });

  const { id, status, annotationType, annotationInfo, wbId, position } = annotation;

  const selector = {
    meetingId,
    id: annotation.id,
    userId,
  };

  const modifier = {
    $set: {
      whiteboardId,
      meetingId,
      id,
      status,
      annotationType,
      annotationInfo,
      wbId,
      position,
    },
  };

  const shapeType = annotation.annotationType;

  switch (shapeType) {
    case ANNOTATION_TYPE_TEXT:
      modifier.$set.annotationInfo.text = annotation.annotationInfo.text.replace(/[\r]/g, '\n');
      break;
    case ANNOTATION_TYPE_PENCIL:
      // On the draw_end he send us all the points, we don't need to push, we can simple
      // set the new points.
      if (annotation.status !== 'DRAW_END') {
        // We don't want it to be update twice.
        delete modifier.$set.annotationInfo;
        modifier.$push = { 'annotationInfo.points': { $each: annotation.annotationInfo.points } };
      }
      break;
    default:
      break;
  }

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding annotation2x to collection: ${err}`);
    }

    const { insertedId } = numChanged;
    if (insertedId) {
      return Logger.info(`Added annotation2x id=${annotation.id} whiteboard=${whiteboardId}`);
    }

    return Logger.info(`Upserted annotation2x id=${annotation.id} whiteboard=${whiteboardId}`);
  };

  return Annotations.upsert(selector, modifier, cb);
}
