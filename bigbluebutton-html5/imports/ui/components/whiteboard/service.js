import Users from '/imports/api/users';
import Captions from "/imports/api/captions";
import Meetings from "/imports/api/meetings";
import Auth from '/imports/ui/services/auth';
import WhiteboardMultiUser from '/imports/api/whiteboard-multi-user';
import addAnnotationQuery from '/imports/api/annotations/addAnnotation';
import { Slides } from '/imports/api/slides';
import { makeCall } from '/imports/ui/services/api';
import PresentationService from '/imports/ui/components/presentation/service';
import logger from '/imports/startup/client/logger';
import { isEqual } from 'lodash';

const Annotations = new Mongo.Collection(null);

const UnsentAnnotations = new Mongo.Collection(null);
const ANNOTATION_CONFIG = Meteor.settings.public.whiteboard.annotations;
const DRAW_START = ANNOTATION_CONFIG.status.start;
const DRAW_UPDATE = ANNOTATION_CONFIG.status.update;
const DRAW_END = ANNOTATION_CONFIG.status.end;
const ANNOTATION_TYPE_PENCIL = "pencil";

let annotationsStreamListener = null;

const clearPreview = (annotation) => {
  UnsentAnnotations.remove({ id: annotation });
};

function clearFakeAnnotations() {
  UnsentAnnotations.remove({});
  Annotations.remove({ id: /-fake/g });
}

function handleAddedLiveSyncPreviewAnnotation({
  meetingId, whiteboardId, userId, annotation,
}) {
  const isOwn = Auth.meetingID === meetingId && Auth.userID === userId;
  const query = addAnnotationQuery(meetingId, whiteboardId, userId, annotation);

  if (!isOwn) {
    Annotations.upsert(query.selector, query.modifier);
    return;
  }

  const fakeAnnotation = Annotations.findOne({ id: `${annotation.id}-fake` });
  let fakePoints;

  if (fakeAnnotation) {
    fakePoints = fakeAnnotation.annotationInfo.points;
    const { points: lastPoints } = annotation.annotationInfo;

    if (annotation.annotationType !== 'pencil') {
      Annotations.update(fakeAnnotation._id, {
        $set: {
          position: annotation.position,
          'annotationInfo.color': isEqual(fakePoints, lastPoints) || annotation.status === DRAW_END
            ? annotation.annotationInfo.color : fakeAnnotation.annotationInfo.color,
        },
        $inc: { version: 1 }, // TODO: Remove all this version stuff
      });
      return;
    }
  }

  Annotations.upsert(query.selector, query.modifier, (err) => {
    if (err) {
      logger.error({
        logCode: 'whiteboard_annotation_upsert_error',
        extraInfo: { error: err },
      }, 'Error on adding an annotation');
      return;
    }

    // Remove fake annotation for pencil on draw end
    if (annotation.status === DRAW_END) {
      Annotations.remove({ id: `${annotation.id}-fake` });
      return;
    }

    if (annotation.status === DRAW_START) {
      Annotations.update(fakeAnnotation._id, {
        $set: {
          position: annotation.position - 1,
        },
        $inc: { version: 1 }, // TODO: Remove all this version stuff
      });
    }
  });
}

function handleAddedAnnotation({
  meetingId,
  whiteboardId,
  userId,
  annotation,
}) {
  console.log ("********** handleAddedAnnotation!!!!!!!!! ***********")
  const isOwn = Auth.meetingID === meetingId && Auth.userID === userId;
  const query = addAnnotationQuery(meetingId, whiteboardId, userId, annotation);

  Annotations.upsert(query.selector, query.modifier);

  if (isOwn) {
    UnsentAnnotations.remove({ id: `${annotation.id}` });
  }
}

function handleRemovedAnnotation({ meetingId, whiteboardId, userId, shapeId }) {
  const query = { meetingId, whiteboardId };

  if (userId) {
    query.userId = userId;
  }

  if (shapeId) {
    query.id = shapeId;
  }
  const annotationIsFake = Annotations.remove(query) === 0;
  if (annotationIsFake) {
    query.id = { $in: [shapeId, `${shapeId}-fake`] };
    Annotations.remove(query);
  }
}

export function initAnnotationsStreamListener() {
  logger.info(
    { logCode: "init_annotations_stream_listener" },
    "initAnnotationsStreamListener called"
  );
  /**
   * We create a promise to add the handlers after a ddp subscription stop.
   * The problem was caused because we add handlers to stream before the onStop event happens,
   * which set the handlers to undefined.
   */
  annotationsStreamListener = new Meteor.Streamer(
    `annotations-${Auth.meetingID}`,
    { retransmit: false }
  );

  const startStreamHandlersPromise = new Promise((resolve) => {
    const checkStreamHandlersInterval = setInterval(() => {
      const streamHandlersSize = Object.values(
        Meteor.StreamerCentral.instances[`annotations-${Auth.meetingID}`]
          .handlers
      ).filter((el) => el !== undefined).length;

      if (!streamHandlersSize) {
        resolve(clearInterval(checkStreamHandlersInterval));
      }
    }, 250);
  });

  startStreamHandlersPromise.then(() => {
    logger.debug(
      { logCode: "annotations_stream_handler_attach" },
      "Attaching handlers for annotations stream"
    );

    annotationsStreamListener.on("removed", handleRemovedAnnotation);

// <<<<<<< HEAD
//     annotationsStreamListener.on('added', ({ annotations }) => {
//       annotations.forEach((annotation) => {
//         const tool = annotation.annotation.annotationType;
//         if (tool === ANNOTATION_TYPE_TEXT) {
//           handleAddedLiveSyncPreviewAnnotation(annotation);
//         } else {
//           handleAddedAnnotation(annotation);
//         }
//       });
// =======
    annotationsStreamListener.on("added", ({ annotations }) => {
      annotations.forEach((annotation) => handleAddedAnnotation(annotation));
// >>>>>>> embed Tldraw into BBB client
    });
  });
}

const annotationsQueue = [];
// How many packets we need to have to use annotationsBufferTimeMax
const annotationsMaxDelayQueueSize = 60;
// Minimum bufferTime
const annotationsBufferTimeMin = 30;
// Maximum bufferTime
const annotationsBufferTimeMax = 200;
// Time before running 'sendBulkAnnotations' again if user is offline
const annotationsRetryDelay = 1000;

let annotationsSenderIsRunning = false;

const proccessAnnotationsQueue = async () => {
  annotationsSenderIsRunning = true;
  const queueSize = annotationsQueue.length;

  if (!queueSize) {
    annotationsSenderIsRunning = false;
    return;
  }

  const annotations = annotationsQueue.splice(0, queueSize);

  const isAnnotationSent = await makeCall("sendBulkAnnotations", annotations);

  if (!isAnnotationSent) {
    // undo splice
    annotationsQueue.splice(0, 0, ...annotations);
    setTimeout(proccessAnnotationsQueue, annotationsRetryDelay);
  } else {
    // ask tiago
    const delayPerc =
      Math.min(annotationsMaxDelayQueueSize, queueSize) /
      annotationsMaxDelayQueueSize;
    const delayDelta = annotationsBufferTimeMax - annotationsBufferTimeMin;
    const delayTime = annotationsBufferTimeMin + delayDelta * delayPerc;
    setTimeout(proccessAnnotationsQueue, delayTime);
  }
};

const sendAnnotation = (annotation) => {
  // Prevent sending annotations while disconnected
  // TODO: Change this to add the annotation, but delay the send until we're
  // reconnected. With this it will miss things
  if (!Meteor.status().connected) return;

  annotationsQueue.push(annotation);
  if (!annotationsSenderIsRunning)
    setTimeout(proccessAnnotationsQueue, annotationsBufferTimeMin);
};

const sendLiveSyncPreviewAnnotation = (annotation) => {
  // Prevent sending annotations while disconnected
  if (!Meteor.status().connected) return;

  annotationsQueue.push(annotation);
  if (!annotationsSenderIsRunning) setTimeout(proccessAnnotationsQueue, annotationsBufferTimeMin);

  // skip optimistic for draw end since the smoothing is done in akka
  if (annotation.status === DRAW_END) return;

  const { position, ...relevantAnotation } = annotation;
  const queryFake = addAnnotationQuery(
    Auth.meetingID, annotation.wbId, Auth.userID,
    {
      ...relevantAnotation,
      id: `${annotation.id}-fake`,
      position: Number.MAX_SAFE_INTEGER,
      annotationInfo: {
        ...annotation.annotationInfo,
        color: increaseBrightness(annotation.annotationInfo.color, 40),
      },
    },
  );

  Annotations.upsert(queryFake.selector, queryFake.modifier);
};

WhiteboardMultiUser.find({ meetingId: Auth.meetingID }).observeChanges({
  changed: clearFakeAnnotations,
});

Users.find(
  { userId: Auth.userID },
  { fields: { presenter: 1 } }
).observeChanges({
  changed(id, { presenter }) {
    if (presenter === false) clearFakeAnnotations();
  },
});

const getMultiUser = (whiteboardId) => {
  const data = WhiteboardMultiUser.findOne(
    {
      meetingId: Auth.meetingID,
      whiteboardId,
    },
    { fields: { multiUser: 1 } }
  );

  if (!data || !data.multiUser || !Array.isArray(data.multiUser)) return [];

  return data.multiUser;
};

const getMultiUserSize = (whiteboardId) => {
  const multiUser = getMultiUser(whiteboardId);

  if (multiUser.length === 0) return 0;

  // Individual whiteboard access is controlled by an array of userIds.
  // When an user leaves the meeting or the presenter role moves from an
  // user to another we applying a filter at the whiteboard collection.
  // Ideally this should change to something more cohese but this would
  // require extra changes at multiple backend modules.
  const multiUserSize = Users.find(
    {
      meetingId: Auth.meetingID,
      userId: { $in: multiUser },
      presenter: false,
    },
    { fields: { userId: 1 } }
  ).fetch();

  return multiUserSize.length;
};

const getCurrentWhiteboardId = () => {
  const podId = "DEFAULT_PRESENTATION_POD";
  const currentPresentation = PresentationService.getCurrentPresentation(podId);

  if (!currentPresentation) return null;

  const currentSlide = Slides.findOne(
    {
      podId,
      presentationId: currentPresentation.id,
      current: true,
    },
    { fields: { id: 1 } }
  );

  return currentSlide && currentSlide.id;
};

const isMultiUserActive = (whiteboardId) => {
  const multiUser = getMultiUser(whiteboardId);

  return multiUser.length !== 0;
};

const hasMultiUserAccess = (whiteboardId, userId) => {
  const multiUser = getMultiUser(whiteboardId);

  return multiUser.includes(userId);
};

const changeWhiteboardAccess = (userId, access) => {
  const whiteboardId = getCurrentWhiteboardId();

  if (!whiteboardId) return;

  if (access) {
    addIndividualAccess(whiteboardId, userId);
  } else {
    removeIndividualAccess(whiteboardId, userId);
  }
};

const addGlobalAccess = (whiteboardId) => {
  makeCall("addGlobalAccess", whiteboardId);
};

const addIndividualAccess = (whiteboardId, userId) => {
  makeCall("addIndividualAccess", whiteboardId, userId);
};

const removeGlobalAccess = (whiteboardId) => {
  makeCall("removeGlobalAccess", whiteboardId);
};

const removeIndividualAccess = (whiteboardId, userId) => {
  makeCall("removeIndividualAccess", whiteboardId, userId);
};

const persistShape = (shape, whiteboardId) => {

  const annotation = {
    id: shape.id,
    annotationInfo: shape,
    wbId: whiteboardId,
    userId: Auth.userID,
  };

  //console.log(shape);

  sendAnnotation(annotation, whiteboardId);
};

const persistAsset = (asset) => makeCall("persistAsset", asset);

const removeShapes = (shapes, whiteboardId) => makeCall("deleteAnnotations", shapes, whiteboardId);

const changeCurrentSlide = (s) => {
  console.log('CHANGE CUR SLIDE SERVICE')
  makeCall("changeCurrentSlide", s);
}

const getShapes = (whiteboardId) => {
  annotations =  Annotations.find(
    {
      whiteboardId,
    },
    {
      fields: { annotationInfo: 1, },
    },
  ).fetch();

  let result = annotations.map(a => a.annotationInfo);
  console.log('getShapes : ', result);
  return result;
};

const getCurrentPres = () => {
  const podId = "DEFAULT_PRESENTATION_POD";
  return  PresentationService.getCurrentPresentation(podId);
}

const getCurSlide = () => {
  let m = Meetings.findOne({ meetingId: Auth.meetingID });
  console.log('---- meeting = ', m);
  return m;
}

const getAssets = () => {
  // temporary storage for assets
  let a = Captions.find().fetch().filter(s => s.src);
  let _assets = {}
  Object.entries(a).map(([k,v]) => {
    _assets[v.id] = v;
    return v.src && v;
  });

  return _assets;
}

const initDefaultPages = (count = 1) => {
  const pages = {};
  const pageStates = {};
  let i = 1;
  while (i < count + 1) {
    pages[`${i}`] = {
      id: `${i}`,
      name: `Slide ${i}`,
      shapes: {},
      bindings: {},
    };
    pageStates[`${i}`] = {
      id: `${i}`,
      selectedIds: [],
      camera: {
        point: [0, 0],
        zoom: 1,
      },
    };
    i++;
  }
  return { pages, pageStates };
};

export {
  initDefaultPages,
  Annotations,
  UnsentAnnotations,
  sendAnnotation,
  sendLiveSyncPreviewAnnotation,
  clearPreview,
  getMultiUser,
  getMultiUserSize,
  getCurrentWhiteboardId,
  isMultiUserActive,
  hasMultiUserAccess,
  changeWhiteboardAccess,
  addGlobalAccess,
  addIndividualAccess,
  removeGlobalAccess,
  removeIndividualAccess,
  persistShape,
  persistAsset,
  getShapes,
  getAssets,
  getCurrentPres,
  removeShapes,
  changeCurrentSlide,
  getCurSlide,
};
