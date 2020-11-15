import { check } from 'meteor/check';
import AnnotationsStreamer from '/imports/api/annotations/server/streamer';
import Annotations from '/imports/api/annotations';

const ANNOTATION_PROCCESS_INTERVAL = 60;

let annotationsQueue = {};
let annotationsRecieverIsRunning = false;

const proccess = () => {
  if (!Object.keys(annotationsQueue).length) {
    annotationsRecieverIsRunning = false;
    return;
  }
  annotationsRecieverIsRunning = true;
  Object.keys(annotationsQueue).forEach((meetingId) => {
    AnnotationsStreamer(meetingId).emit('added', { meetingId, annotations: annotationsQueue[meetingId] });
  });
  annotationsQueue = {};

  Meteor.setTimeout(proccess, ANNOTATION_PROCCESS_INTERVAL);
};

export default function handleWhiteboardReloaded({ body }, meetingId) {
  check(body, {
    userId: String,
    whiteboardId: String,
  });

  const { whiteboardId, userId } = body;

  const cur_annotations = Annotations.find(
    {
      meetingId: meetingId,
      wbId: whiteboardId,
    },
  ).fetch();

  AnnotationsStreamer(meetingId).emit('removed', { meetingId, whiteboardId });

  if(!annotationsQueue.hasOwnProperty(meetingId)) {
    annotationsQueue[meetingId] = [];
  }
  
  for (const annotation of cur_annotations) {
    annotationsQueue[meetingId].push({ meetingId, whiteboardId, userId, annotation });
  }
  if (!annotationsRecieverIsRunning) proccess();

  return;
}
