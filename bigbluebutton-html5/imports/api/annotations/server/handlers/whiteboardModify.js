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

export default function handleWhiteboardModify({ body }, meetingId) {
  const {
    whiteBoardId, userId, annotations, idsToRemove,
  } = body;
  check(whiteBoardId, String);
  check(userId, String);
  check(annotations, [Object]);
  check(idsToRemove, [String]);

  if (!annotationsQueue.hasOwnProperty(meetingId)) {
    annotationsQueue[meetingId] = [];
  }
  annotations.forEach((annotation) => {
    const annotationUserId = annotation.userId;
    check(annotationUserId, String);
    annotationsQueue[meetingId].push({
      meetingId, whiteBoardId, annotationUserId, annotation,
    });
  });

  idsToRemove.forEach((shapeId) => {
    check(shapeId, String);
    removeAnnotation(meetingId, whiteBoardId, shapeId);
  });

  if (queueMetrics) {
    Metrics.setAnnotationQueueLength(meetingId, annotationsQueue[meetingId].length);
  }
  if (!annotationsRecieverIsRunning) process();

  annotations.forEach((annotation) => {
    addAnnotation(meetingId, whiteBoardId, annotation.userId, annotation);
  });
}
