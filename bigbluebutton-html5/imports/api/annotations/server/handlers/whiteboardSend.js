import { check } from 'meteor/check';
import AnnotationsStreamer from '/imports/api/annotations/server/streamer';
import addAnnotation from '../modifiers/addAnnotation';
import Metrics from '/imports/startup/server/metrics';

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

export default function handleWhiteboardSend({ header, body }, meetingId) {
  const userId = header.userId;
  const whiteboardId = body.whiteboardId;
  const annotations = body.annotations;

  check(userId, String);
  check(whiteboardId, String);
  check(annotations, Array);

  if (!annotationsQueue.hasOwnProperty(meetingId)) {
    annotationsQueue[meetingId] = [];
  }
  
  annotations.map(annotation => {
    annotationsQueue[meetingId].push({ meetingId, whiteboardId, userId, annotation });
    addAnnotation(meetingId, whiteboardId, userId, annotation);
  })
  if (queueMetrics) {
    Metrics.setAnnotationQueueLength(meetingId, annotationsQueue[meetingId].length);
  }
  if (!annotationsRecieverIsRunning) process();
}
