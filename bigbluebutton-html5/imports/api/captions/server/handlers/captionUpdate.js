import Captions from '/imports/api/captions';
import { check } from 'meteor/check';
import addCaption from '../modifiers/addCaption';

export default function handleCaptionUpdate({ body }, meetingId) {
  const SERVER_CONFIG = Meteor.settings.private.app;
  const CAPTION_CHUNK_LENGTH = SERVER_CONFIG.captionsChunkLength || 1000;

  const { locale } = body;

  check(meetingId, String);
  check(locale, String);

  const captionsObjects = Captions.find({
    meetingId,
    locale,
  }, {
    sort: {
      locale: 1,
      'captionHistory.index': 1,
    },
  }).fetch();

  const objectsToUpdate = [];
  if (captionsObjects != null) {
    let startIndex;
    let endIndex;
    let length = 0;
    let current = captionsObjects[0];

    // looking for a start index and end index
    // (end index only for the case when they are in the same block)
    while (current != null) {
      length += current.captionHistory.captions.length;

      // if length is bigger than start index - we found our start index
      if (length >= body.startIndex && startIndex == undefined) {
        // check if it's a new character somewhere in the middle of captions text
        if (length - 1 >= body.startIndex) {
          startIndex = body.startIndex - (length - current.captionHistory.captions.length);

          // check to see if the endIndex is in the same object as startIndex
          if (length - 1 >= body.endIndex) {
            endIndex = body.endIndex - (length - current.captionHistory.captions.length);
            const _captions = current.captionHistory.captions;
            current.captionHistory.captions = _captions.slice(0, startIndex) +
              body.text +
              _captions.slice(endIndex);
            objectsToUpdate.push(current);
            break;

            // end index is not in the same object as startIndex, we will find it later
          } else {
            current.captionHistory.captions = current.captionHistory.captions.slice(0, startIndex) +
              body.text;
            objectsToUpdate.push(current);
            break;
          }

          // separate case for appending new characters to the very end of the string
        } else if (current.captionHistory.next == null &&
          length == body.startIndex &&
          length == body.startIndex) {
          startIndex = 1;
          endIndex = 1;
          current.captionHistory.captions += body.text;
          objectsToUpdate.push(current);
        }
      }

      current = captionsObjects[current.captionHistory.next];
    }

    // looking for end index here if it wasn't in the same object as start index
    if (startIndex != undefined && endIndex == undefined) {
      current = captionsObjects[current.captionHistory.next];
      while (current != null) {
        length += current.captionHistory.captions.length;

        // check to see if the endIndex is in the current object
        if (length - 1 >= body.endIndex) {
          endIndex = body.endIndex - (length - current.captionHistory.captions.length);
          current.captionHistory.captions = current.captionHistory.captions.slice(endIndex);
          objectsToUpdate.push(current);

          break;

          // if endIndex wasn't in the current object, that means this whole object was deleted
          // initializing string to ''
        } else {
          current.captionHistory.captions = '';
          objectsToUpdate.push(current);
        }

        current = captionsObjects[current.captionHistory.next];
      }
    }

    // looking for the strings which exceed the limit and split them into multiple objects
    let maxIndex = captionsObjects.length - 1;
    for (let i = 0; i < objectsToUpdate.length; i++) {
      if (objectsToUpdate[i].captionHistory.captions.length > CAPTION_CHUNK_LENGTH) {
        // string is too large. Check if the next object exists and if it can
        // accomodate the part of the string that exceeds the limits
        const _nextIndex = objectsToUpdate[i].captionHistory.next;
        if (_nextIndex != null &&
          captionsObjects[_nextIndex].captionHistory.captions.length < CAPTION_CHUNK_LENGTH) {
          const extraString = objectsToUpdate[i].captionHistory.captions.slice(CAPTION_CHUNK_LENGTH);

          // could assign it directly, but our linter complained
          let _captions = objectsToUpdate[i].captionHistory.captions;
          _captions = _captions.slice(0, CAPTION_CHUNK_LENGTH);
          objectsToUpdate[i].captionHistory.captions = _captions;

          // check to see if the next object was added to objectsToUpdate array
          if (objectsToUpdate[i + 1] != null &&
            objectsToUpdate[i].captionHistory.next == objectsToUpdate[i + 1].captionHistory.index) {
            objectsToUpdate[i + 1].captionHistory.captions = extraString +
              objectsToUpdate[i + 1].captionHistory.captions;

            // next object wasn't added to objectsToUpdate array, adding it from captionsObjects array.
          } else {
            const nextObj = captionsObjects[objectsToUpdate[i].captionHistory.next];
            nextObj.captionHistory.captions = extraString + nextObj.captionHistory.captions;
            objectsToUpdate.push(nextObj);
          }

          // next object was full already, so we create another and insert it in between them
        } else {
          // need to take a current object out of the objectsToUpdate and add it back after
          // every other object, so that Captions collection could be updated in a proper order
          const tempObj = objectsToUpdate.splice(i, 1);
          let extraString = tempObj[0].captionHistory.captions.slice(CAPTION_CHUNK_LENGTH);

          tempObj[0].captionHistory.captions =
            tempObj[0].captionHistory.captions.slice(0, CAPTION_CHUNK_LENGTH);

          maxIndex += 1;
          const tempIndex = tempObj[0].captionHistory.next;
          tempObj[0].captionHistory.next = maxIndex;

          while (extraString.length != 0) {
            const entry = {
              meetingId,
              locale,
              captionHistory: {
                locale,
                ownerId: tempObj[0].captionHistory.ownerId,
                captions: extraString.slice(0, CAPTION_CHUNK_LENGTH),
                index: maxIndex,
                next: null,
              },
            };
            maxIndex += 1;
            extraString = extraString.slice(CAPTION_CHUNK_LENGTH);
            if (extraString.length > 0) {
              entry.captionHistory.next = maxIndex;
            } else {
              entry.captionHistory.next = tempIndex;
            }

            objectsToUpdate.push(entry);
          }

          objectsToUpdate.push(tempObj[0]);
        }
      }
    }
  }

  const captionsAdded = [];
  objectsToUpdate.forEach((entry) => {
    const { _id, meetingId, locale, captionHistory } = entry;
    captionsAdded.push(addCaption(meetingId, locale, captionHistory, _id));
  });

  return captionsAdded;
}
