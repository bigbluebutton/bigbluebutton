import { check } from 'meteor/check';
import { AnnotationsStreamer } from '/imports/api/annotations';
import addAnnotation from '../modifiers/addAnnotation';

const ANNOTATION_PROCCESS_INTERVAL = 60;

let annotationsQueue = {};
let annotationsRecieverIsRunning = false;

const proccess = () => {
  if (!Object.keys(annotationsQueue).length) {
    annotationsRecieverIsRunning = false;
    return;
  }
  annotationsRecieverIsRunning = true;
  Object.keys(annotationsQueue).forEach(meetingId => {
    AnnotationsStreamer.emit('added', { meetingId, annotations: annotationsQueue[meetingId] });
  });
  annotationsQueue = {};

  Meteor.setTimeout(proccess, ANNOTATION_PROCCESS_INTERVAL);
};

export default function handleWhiteboardSend({ header, body }, meetingId) {
  const userId = header.userId;
  const annotation = body.annotation;

  check(userId, String);
  check(annotation, Object);

  const whiteboardId = annotation.wbId;
  check(whiteboardId, String);

  if(!annotationsQueue.hasOwnProperty(meetingId)) {
    annotationsQueue[meetingId] = [];
  }

  annotationsQueue[meetingId].push({ meetingId, whiteboardId, userId, annotation });
  if (!annotationsRecieverIsRunning) proccess();

  return addAnnotation(meetingId, whiteboardId, userId, annotation);
}
