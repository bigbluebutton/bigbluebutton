import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Annotations from '/imports/api/annotations';
import RedisPubSub from '/imports/startup/server/redis';

const ANNOTATION_TYPE_TEXT = 'text';
const ANNOTATION_TYPE_PENCIL = 'pencil';

// line, triangle, ellipse, rectangle
function handleCommonAnnotation(meetingId, whiteboardId, userId, annotation) {
  const {
    id, status, annotationType, annotationInfo, wbId, position,
  } = annotation;

  const selector = {
    meetingId,
    id,
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
    $inc: { version: 1 },
  };

  return {
    updateOne: {
      'filter': selector,
      'update': modifier,
      'upsert': true
    }
  };
}

function handleTextUpdate(meetingId, whiteboardId, userId, annotation) {
  const {
    id, status, annotationType, annotationInfo, wbId, position,
  } = annotation;

  const selector = {
    meetingId,
    id,
    userId,
  };

  annotationInfo.text = annotationInfo.text.replace(/[\r]/g, '\n');

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
    $inc: { version: 1 },
  };

  return { selector, modifier };
}

function handlePencilUpdate(meetingId, whiteboardId, userId, annotation) {
  // fetching annotation statuses from the config
  const ANOTATION_STATUSES = Meteor.settings.public.whiteboard.annotations.status;
  const DRAW_START = ANOTATION_STATUSES.start;
  const DRAW_UPDATE = ANOTATION_STATUSES.update;
  const DRAW_END = ANOTATION_STATUSES.end;

  const SERVER_CONFIG = Meteor.settings.private.app;
  const PENCIL_CHUNK_SIZE = SERVER_CONFIG.pencilChunkLength || 100;

  const {
    id, status, annotationType, annotationInfo, wbId, position,
  } = annotation;

  const baseSelector = {
    meetingId,
    id,
    userId,
    whiteboardId,
  };
  let baseModifier;
  let chunkSelector;
  let chunkModifier;

  // fetching the Annotation object
  let Annotation;
  const bulkAnnotation = RedisPubSub.findAnnotationInsideBulk(baseSelector);
  Annotation = bulkAnnotation ? bulkAnnotation : Annotations.findOne(baseSelector);

  // a helper func, to split the initial annotation.points into subdocuments
  // returns an array of { selector, modifier } objects for subdocuments.
  const createPencilObjects = () => {
    const chunks = [];
    // if the length of the points < PENCIL_CHUNK_SIZE then we simply return an array with one chunk
    if (annotationInfo.points.length < PENCIL_CHUNK_SIZE) {
      const chunkId = `${id}--${1}`;
      chunks.push({
        selector: {
          meetingId,
          userId,
          id: chunkId,
        },
        modifier: {
          $set: {
            whiteboardId,
            meetingId,
            id: chunkId,
            status,
            annotationType,
            annotationInfo,
            wbId,
            position,
          },
          $inc: { version: 1 },
        },
      });
      return chunks;
    }

    // *default flow*
    // length of the points >= PENCIL_CHUNK_SIZE, so we split them into subdocuments

    // counter is used for generating ids.
    let i = 0;
    let counter = 1;
    for (; i <= annotationInfo.points.length; i += PENCIL_CHUNK_SIZE, counter += 1) {
      const chunkId = `${id}--${counter}`;

      // we always need to attach the last coordinate from the previous subdocument
      // to the front of the current subdocument, to connect the pencil path
      const _annotationInfo = annotationInfo;
      _annotationInfo.points = annotationInfo.points.slice(i === 0 ? 0 : i - 2, PENCIL_CHUNK_SIZE);

      chunks.push({
        selector: {
          meetingId,
          userId,
          id: chunkId,
        },
        modifier: {
          $set: {
            whiteboardId,
            meetingId,
            id: chunkId,
            status,
            annotationType,
            annotationInfo: _annotationInfo,
            wbId,
            position,
          },
          $inc: { version: 1 },
        },
      });
    }

    return chunks;
  };

  let operations = [];

  switch (status) {
    case DRAW_START: {

      // on start we split the points
      const chunks = createPencilObjects();

      // create the 'pencil_base'
      baseModifier = {
        id,
        userId,
        meetingId,
        whiteboardId,
        position,
        annotationType: 'pencil_base',
        numberOfChunks: chunks.length,
        lastChunkLength: chunks[chunks.length - 1].length ? chunks[chunks.length - 1].length : null,
        lastCoordinate: [
          annotationInfo.points[annotationInfo.points.length - 2],
          annotationInfo.points[annotationInfo.points.length - 1],
        ],
      };

      // upserting all the chunks
      for (let i = 0; i < chunks.length; i += 1) {
        operations.push({
          updateOne: {
            'filter': chunks[i].selector,
            'update': chunks[i].modifier,
            'upsert': true
          }
        });
      }
      operations.push({
        updateOne: {
          'filter': baseSelector,
          'update': baseModifier,
          'upsert': true
        }
      });

      return operations;
    }
    case DRAW_UPDATE: {

      // checking if "pencil_base" exists
      if (Annotation) {

        const { numberOfChunks, lastChunkLength } = Annotation;

        // if lastChunkLength < PENCIL_CHUNK_SIZE then we can simply push points to the last object
        if (lastChunkLength < PENCIL_CHUNK_SIZE) {
          // creating a modifier for 'pencil_base'
          baseModifier = {
            $set: {
              lastChunkLength: lastChunkLength + annotation.annotationInfo.points.length,
              lastCoordinate: [
                annotationInfo.points[annotationInfo.points.length - 2],
                annotationInfo.points[annotationInfo.points.length - 1],
              ],
            },
          };

          const chunkId = `${id}--${numberOfChunks}`;
          chunkSelector = {
            meetingId,
            userId,
            id: chunkId,
          };

          // fetching the last pencil sub-document
          const bulkChunk = RedisPubSub.findChunkInsideBulk(chunkSelector);
          let chunk = (bulkChunk && bulkChunk.$set) ? bulkChunk.$set : Annotations.findOne(chunkSelector);
          // adding the coordinates to the end of the last sub-document
          annotationInfo.points = chunk.annotationInfo.points.concat(annotationInfo.points);

          chunkModifier = {
            $set: {
              annotationInfo,
            },
            $inc: { version: 1 },
          };

        // if lastChunkLength > PENCIL_CHUNK_SIZE then we need to create another chunk
        } else if (lastChunkLength >= PENCIL_CHUNK_SIZE) {
          baseModifier = {
            $set: {
              numberOfChunks: numberOfChunks + 1,
              lastChunkLength: annotationInfo.points.length,
              lastCoordinate: [
                annotationInfo.points[annotationInfo.points.length - 2],
                annotationInfo.points[annotationInfo.points.length - 1],
              ],
            },
          };

          const chunkId = `${id}--${numberOfChunks + 1}`;
          chunkSelector = {
            meetingId,
            userId,
            id: chunkId,
          };

          // pushing the last coordinate to the front of the current chunk's points
          annotationInfo.points.unshift(Annotation.lastCoordinate[0], Annotation.lastCoordinate[1]);

          chunkModifier = {
            $set: {
              whiteboardId,
              meetingId,
              userId,
              id: chunkId,
              status,
              annotationType,
              annotationInfo,
              wbId,
              position: Annotation.position,
            },
            $inc: { version: 1 },
          };
        } else {
        }

        operations.push({
          updateOne: {
            'filter': chunkSelector,
            'update': chunkModifier,
            'upsert': true
          }
        });
        operations.push({
          updateOne: {
            'filter': baseSelector,
            'update': baseModifier,
            'upsert': true
          }
        });
        return operations;
      }

      // **default flow**
      // if we are here then it means that Annotation object is not in the db
      // So creating everything similar to DRAW_START case
      const _chunks = createPencilObjects();

      // creating 'pencil_base' based on the info we received from createPencilObjects()
      baseModifier = {
        id,
        userId,
        meetingId,
        whiteboardId,
        position,
        annotationType: 'pencil_base',
        numberOfChunks: _chunks.length,
        lastChunkLength: _chunks[_chunks.length - 1].length,
        lastCoordinate: [
          annotationInfo.points[annotationInfo.points.length - 2],
          annotationInfo.points[annotationInfo.points.length - 1],
        ],
      };

      // upserting all the chunks
      for (let i = 0; i < _chunks.length; i += 1) {
        operations.push({
          updateOne: {
            'filter': _chunks[i].selector,
            'update': _chunks[i].modifier,
            'upsert': true
          }
        });
      }

      operations.push({
        updateOne: {
          'filter': baseSelector,
          'update': baseModifier,
          'upsert': true
        }
      });

      return operations;
    }
    case DRAW_END: {

      // If a user just finished drawing with the pencil
      // Removing all the sub-documents and replacing the 'pencil_base'
      if (Annotation && Annotation.annotationType === 'pencil_base') {
        // delete everything and replace base
        const chunkIds = [];
        for (let i = 0; i <= 10; i += 1) {
          chunkIds.push(`${Annotation.id}--${i}`);
        }
        chunkSelector = {
          meetingId,
          userId,
          id: { $in: chunkIds },
        };

        operations.push({
          deleteMany: {
            'filter': chunkSelector
          }
        });
      }

      // Updating the main pencil object with the final info
      baseModifier = {
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
        $inc: { version: 1 },
        $unset: {
          numberOfChunks: '',
          lastChunkLength: '',
          lastCoordinate: '',
        },
      };
      operations.push({
        updateOne: {
          'filter': baseSelector,
          'update': baseModifier,
          'upsert': true
        }
      });
      return operations;
    }
    default: {
      return {};
    }
  }
}

export default function addAnnotation(meetingId, whiteboardId, userId, annotation) {
  check(meetingId, String);
  check(whiteboardId, String);
  check(annotation, Object);

  let query;

  switch (annotation.annotationType) {
    case ANNOTATION_TYPE_TEXT:
      query = handleTextUpdate(meetingId, whiteboardId, userId, annotation);
      break;
    case ANNOTATION_TYPE_PENCIL:
      query = handlePencilUpdate(meetingId, whiteboardId, userId, annotation);
      break;
    default:
      query = handleCommonAnnotation(meetingId, whiteboardId, userId, annotation);
      break;
  }

  if(query instanceof Array) {
    RedisPubSub.addOperationsToBulk(query);
  } else {
    RedisPubSub.addToAnnotationsBulk(query);
  }

}

