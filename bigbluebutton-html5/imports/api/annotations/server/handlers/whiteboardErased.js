import { check } from 'meteor/check';
import AnnotationsStreamer from '/imports/api/annotations/server/streamer';
import addAnnotation from '../modifiers/addAnnotation';
import Metrics from '/imports/startup/server/metrics';
import removeAnnotation from '../modifiers/removeAnnotation';

const { queueMetrics } = Meteor.settings.private.redis.metrics;

const {
  annotationsQueueProcessInterval: ANNOTATION_PROCESS_INTERVAL,
} = Meteor.settings.public.whiteboard;

let annotationsQueue = {};
let annotationsRecieverIsRunning = false;

const process = () => {
  if (!Object.keys(annotationsQueue).length) {
    annotationsRecieverIsRunning = false;
    return;
  }
  annotationsRecieverIsRunning = true;
  Object.keys(annotationsQueue).forEach((meetingId) => {
    AnnotationsStreamer(meetingId).emit('added', { meetingId, annotations: annotationsQueue[meetingId] });
    if (queueMetrics) {
      Metrics.setAnnotationQueueLength(meetingId, 0);
    }
  });
  annotationsQueue = {};

  Meteor.setTimeout(process, ANNOTATION_PROCESS_INTERVAL);
};

export default function handleWhiteboardErasedSend({ body }, meetingId) {
  const {whiteboardId, userId, eraserId, annotationsToAdd, idsToRemove} = body
  check(whiteboardId, String);
  check(userId, String);
  check(eraserId, String);
  check(annotationsToAdd, [Object]);
  check(idsToRemove, [String]);

  if (!Object.prototype.hasOwnProperty.call(annotationsQueue, meetingId)) {
    annotationsQueue[meetingId] = [];
  }
  annotationsToAdd.forEach((annotation) => {
    var annotationUserId = annotation.userId;
    check(annotationUserId, String);
    annotationsQueue[meetingId].push({ meetingId, whiteboardId, annotationUserId, annotation });
  });

  idsToRemove.forEach((shapeId) => {
    check(shapeId, String);
    AnnotationsStreamer(meetingId).emit('removed', { meetingId, whiteboardId, shapeId });
    removeAnnotation(meetingId, whiteboardId, shapeId);
  });

  if (queueMetrics) {
    Metrics.setAnnotationQueueLength(meetingId, annotationsQueue[meetingId].length);
  }
  if (!annotationsRecieverIsRunning) process();

  annotationsToAdd.forEach((annotation) => {
    addAnnotation(meetingId, whiteboardId, annotation.userId, annotation);
  });
  AnnotationsStreamer(meetingId).emit('removed', { meetingId, whiteboardId, userId, shapeId: eraserId});
  return 
}