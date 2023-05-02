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

export default function handleWhiteboardSend({ envelope, header, body }, meetingId) {
  const { userId } = header;
  const { whiteboardId } = body;
  const { annotations } = body;
  const instanceIdFromMessage = parseInt(envelope.routing.html5InstanceId, 10) || 1;
  const myInstanceId = parseInt(body.myInstanceId, 10) || 1;

  check(userId, String);
  check(whiteboardId, String);
  check(annotations, Array);

  if (!annotationsQueue.hasOwnProperty(meetingId)) {
    annotationsQueue[meetingId] = [];
  }

  annotations.forEach((annotation) => {
    annotationsQueue[meetingId].push({
      meetingId, whiteboardId, userId: annotation.userId, annotation,
    });
    if (instanceIdFromMessage === myInstanceId) {
      addAnnotation(meetingId, whiteboardId, annotation.userId, annotation);
    }
  });

  if (queueMetrics) {
    Metrics.setAnnotationQueueLength(meetingId, annotationsQueue[meetingId].length);
  }
  if (!annotationsRecieverIsRunning) process();
}
