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

export default function handleWhiteboardUndo({ body }, meetingId) {
  const {whiteboardId, userId, addedAnnotations, removedAnnotationIds} = body
  check(whiteboardId, String);
  check(userId, String);
  check(addedAnnotations, [Object]);
  check(removedAnnotationIds, [String]);

  if (!annotationsQueue.hasOwnProperty(meetingId)) {
    annotationsQueue[meetingId] = [];
  }
  addedAnnotations.forEach((annotation) => {
    var annotationUserId = annotation.userId;
    check(annotationUserId, String);
    annotationsQueue[meetingId].push({ meetingId, whiteboardId, annotationUserId, annotation });
  });

  removedAnnotationIds.forEach((shapeId) => {
    check(shapeId, String);
    removeAnnotation(meetingId, whiteboardId, shapeId);
  });

  if (queueMetrics) {
    Metrics.setAnnotationQueueLength(meetingId, annotationsQueue[meetingId].length);
  }
  if (!annotationsRecieverIsRunning) process();

  addedAnnotations.forEach((annotation) => {
    addAnnotation(meetingId, whiteboardId, annotation.userId, annotation);
  });
  return 
} 
