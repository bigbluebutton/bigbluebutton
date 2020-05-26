import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import WhiteboardMultiUser from '/imports/api/whiteboard-multi-user/';
import addAnnotationQuery from '/imports/api/annotations/addAnnotation';
import { makeCall } from '/imports/ui/services/api';

const Annotations = new Mongo.Collection(null);
const UnsentAnnotations = new Mongo.Collection(null);
const ANNOTATION_CONFIG = Meteor.settings.public.whiteboard.annotations;
const DRAW_UPDATE = ANNOTATION_CONFIG.status.update;
const DRAW_END = ANNOTATION_CONFIG.status.end;

const ANNOTATION_TYPE_PENCIL = 'pencil';


let annotationsStreamListener = null;

const clearPreview = (annotation) => {
  UnsentAnnotations.remove({ id: annotation });
};

function clearFakeAnnotations() {
  UnsentAnnotations.remove({});
}

function handleAddedAnnotation({
  meetingId, whiteboardId, userId, annotation,
}) {
  const isOwn = Auth.meetingID === meetingId && Auth.userID === userId;
  const query = addAnnotationQuery(meetingId, whiteboardId, userId, annotation);

  Annotations.upsert(query.selector, query.modifier);

  if (isOwn) {
    UnsentAnnotations.remove({ id: `${annotation.id}` });
  }
}

function handleRemovedAnnotation({
  meetingId, whiteboardId, userId, shapeId,
}) {
  const query = { meetingId, whiteboardId };

  if (userId) {
    query.userId = userId;
  }

  if (shapeId) {
    query.id = shapeId;
  }

  Annotations.remove(query);
}

export function initAnnotationsStreamListener() {
  /**
   * We create a promise to add the handlers after a ddp subscription stop.
   * The problem was caused because we add handlers to stream before the onStop event happens,
   * which set the handlers to undefined.
   */
  annotationsStreamListener = new Meteor.Streamer(`annotations-${Auth.meetingID}`, { retransmit: false });

  const startStreamHandlersPromise = new Promise((resolve) => {
    const checkStreamHandlersInterval = setInterval(() => {
      const streamHandlersSize = Object.values(Meteor.StreamerCentral.instances[`annotations-${Auth.meetingID}`].handlers)
        .filter(el => el !== undefined)
        .length;

      if (!streamHandlersSize) {
        resolve(clearInterval(checkStreamHandlersInterval));
      }
    }, 250);
  });

  startStreamHandlersPromise.then(() => {
    annotationsStreamListener.on('removed', handleRemovedAnnotation);

    annotationsStreamListener.on('added', ({ annotations }) => {
      annotations.forEach(annotation => handleAddedAnnotation(annotation));
    });
  });
}

function increaseBrightness(realHex, percent) {
  let hex = parseInt(realHex, 10).toString(16).padStart(6, 0);
  // strip the leading # if it's there
  hex = hex.replace(/^\s*#|\s*$/g, '');

  // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
  if (hex.length === 3) {
    hex = hex.replace(/(.)/g, '$1$1');
  }

  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  /* eslint-disable no-bitwise, no-mixed-operators */
  return parseInt(((0 | (1 << 8) + r + ((256 - r) * percent) / 100).toString(16)).substr(1)
     + ((0 | (1 << 8) + g + ((256 - g) * percent) / 100).toString(16)).substr(1)
     + ((0 | (1 << 8) + b + ((256 - b) * percent) / 100).toString(16)).substr(1), 16);
  /* eslint-enable no-bitwise, no-mixed-operators */
}

const annotationsQueue = [];
// How many packets we need to have to use annotationsBufferTimeMax
const annotationsMaxDelayQueueSize = 60;
// Minimum bufferTime
const annotationsBufferTimeMin = 30;
// Maximum bufferTime
const annotationsBufferTimeMax = 200;
let annotationsSenderIsRunning = false;

const proccessAnnotationsQueue = async () => {
  annotationsSenderIsRunning = true;
  const queueSize = annotationsQueue.length;

  if (!queueSize) {
    annotationsSenderIsRunning = false;
    return;
  }

  const annotations = annotationsQueue.splice(0, queueSize);

  // console.log('annotationQueue.length', annotationsQueue, annotationsQueue.length);
  await makeCall('sendBulkAnnotations', annotations);

  // ask tiago
  const delayPerc = Math.min(annotationsMaxDelayQueueSize, queueSize) / annotationsMaxDelayQueueSize;
  const delayDelta = annotationsBufferTimeMax - annotationsBufferTimeMin;
  const delayTime = annotationsBufferTimeMin + (delayDelta * delayPerc);
  // console.log("delayPerc:", delayPerc)
  setTimeout(proccessAnnotationsQueue, delayTime);
};

const sendAnnotation = (annotation) => {
  // Prevent sending annotations while disconnected
  // TODO: Change this to add the annotation, but delay the send until we're
  // reconnected. With this it will miss things
  if (!Meteor.status().connected) return;

  if (annotation.status === DRAW_END) {
    annotationsQueue.push(annotation);
    if (!annotationsSenderIsRunning) setTimeout(proccessAnnotationsQueue, annotationsBufferTimeMin);
  } else {
    const { position, ...relevantAnotation } = annotation;
    const queryFake = addAnnotationQuery(
      Auth.meetingID, annotation.wbId, Auth.userID,
      {
        ...relevantAnotation,
        id: `${annotation.id}`,
        position: Number.MAX_SAFE_INTEGER,
        annotationInfo: {
          ...annotation.annotationInfo,
          color: increaseBrightness(annotation.annotationInfo.color, 40),
        },
      },
    );

    // This is a really hacky solution, but because of the previous code reuse we need to edit
    // the pencil draw update modifier so that it sets the whole array instead of pushing to
    // the end
    const { status, annotationType } = relevantAnotation;
    if (status === DRAW_UPDATE && annotationType === ANNOTATION_TYPE_PENCIL) {
      delete queryFake.modifier.$push;
      queryFake.modifier.$set['annotationInfo.points'] = annotation.annotationInfo.points;
    }

    UnsentAnnotations.upsert(queryFake.selector, queryFake.modifier);
  }
};

WhiteboardMultiUser.find({ meetingId: Auth.meetingID }).observeChanges({
  changed: clearFakeAnnotations,
});

Users.find({ userId: Auth.userID }, { fields: { presenter: 1 } }).observeChanges({
  changed(id, { presenter }) {
    if (presenter === false) clearFakeAnnotations();
  },
});

export {
  Annotations,
  UnsentAnnotations,
  sendAnnotation,
  clearPreview,
};
