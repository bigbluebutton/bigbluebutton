import Captions from '/imports/api/captions';
import { logger } from '/imports/startup/server/logger';

export function updateCaptionsCollection(meetingId, locale, payload) {

  let captionsObjects = Captions.find({
    meetingId: meetingId,
    locale: locale,
  }, {
    sort: {
      locale: 1,
      'captionHistory.index': 1,
    },
  }).fetch();

  let objectsToUpdate = [];
  if (captionsObjects != null) {
    let startIndex;
    let endIndex;
    let length = 0;
    let current = captionsObjects[0];

    //looking for a start index and end index (in case if they are in the same block)
    while (current != null) {
      length += current.captionHistory.captions.length;
      if (length >= payload.start_index && startIndex == undefined) {
        //checking if it's a new character somewhere in the middle of captions
        if (length - 1 >= payload.start_index) {
          startIndex = payload.start_index - (length - current.captionHistory.captions.length);
          if (length - 1 >= payload.end_index) {
            endIndex = payload.end_index - (length - current.captionHistory.captions.length);
            let _captions = current.captionHistory.captions;
            current.captionHistory.captions = _captions.slice(0, startIndex) + payload.text + _captions.slice(endIndex);
            objectsToUpdate.push(current);
            break;
          } else {
            current.captionHistory.captions = current.captionHistory.captions.slice(0, startIndex) + payload.text;
            objectsToUpdate.push(current);
            break;
          }

          //separate case for appending new characters
        } else if (current.captionHistory.next == null && length == payload.start_index && length == payload.start_index) {
          startIndex = 1;
          endIndex = 1;
          current.captionHistory.captions += payload.text;
          objectsToUpdate.push(current);
        }
      }

      current = captionsObjects[current.captionHistory.next];
    }

    //looking for end index here if it wasn't in the same object as start index
    if (startIndex != undefined && endIndex == undefined) {
      current = captionsObjects[current.captionHistory.next];
      while (current != null) {
        length += current.captionHistory.captions.length;
        if (length - 1 >= payload.end_index) {

          endIndex = payload.end_index - (length - current.captionHistory.captions.length);
          current.captionHistory.captions = current.captionHistory.captions.slice(endIndex);
          objectsToUpdate.push(current);

          break;
        } else {
          current.captionHistory.captions = '';
          objectsToUpdate.push(current);
        }

        current = captionsObjects[current.captionHistory.next];
      }
    }

    let maxIndex = captionsObjects.length - 1;

    for (i = 0; i < objectsToUpdate.length; i++) {
      if (objectsToUpdate[i].captionHistory.captions.length > 100) {
        //string is too large. Check if there is a next object and if it can
        //accomodate the part of the string that exceeds the limits
        if (objectsToUpdate[i].captionHistory.next != null &&
          captionsObjects[objectsToUpdate[i].captionHistory.next].captionHistory.captions.length < 100) {

          let extraString = objectsToUpdate[i].captionHistory.captions.slice(100);
          objectsToUpdate[i].captionHistory.captions = objectsToUpdate[i].captionHistory.captions.slice(0, 100);
          if (objectsToUpdate[i + 1] != null &&
            objectsToUpdate[i].captionHistory.next == objectsToUpdate[i + 1].captionHistory.index) {
            objectsToUpdate[i + 1].captionHistory.captions = extraString + objectsToUpdate[i + 1].captionHistory.captions;
          } else {
            let nextObj = captionsObjects[objectsToUpdate[i].captionHistory.next];
            nextObj.captionHistory.captions = extraString + nextObj.captionHistory.captions;
            objectsToUpdate.push(nextObj);
          }

        //next object was full already, so we create one ant insert it in between them
        } else {
          let tempObject = objectsToUpdate.splice(i, 1);
          let extraString = tempObject[0].captionHistory.captions.slice(100);
          tempObject[0].captionHistory.captions = tempObject[0].captionHistory.captions.slice(0, 100);

          maxIndex += 1;
          let tempIndex = tempObject[0].captionHistory.next;
          tempObject[0].captionHistory.next = maxIndex;

          while (extraString.length != 0) {
            let entry = {
              meetingId: meetingId,
              locale: locale,
              captionHistory: {
                locale: locale,
                ownerId: tempObject[0].captionHistory.ownerId,
                captions: extraString.slice(0, 100),
                index: maxIndex,
                next: null,
              },
            };
            maxIndex += 1;
            extraString = extraString.slice(100);
            if (extraString.length > 0) {
              entry.captionHistory.next = maxIndex;
            } else {
              entry.captionHistory.next = tempIndex;
            }

            objectsToUpdate.push(entry);
          }

          objectsToUpdate.push(tempObject[0]);
        }
      }
    }
  }

  for (i = 0; i < objectsToUpdate.length; i++) {
    Captions.upsert(
      {
        _id: objectsToUpdate[i]._id,
        meetingId: objectsToUpdate[i].meetingId,
        locale: objectsToUpdate[i].locale,
      },
      {
        $set: {
          meetingId: meetingId,
          locale: locale,
          'captionHistory.locale': locale,
          'captionHistory.ownerId': objectsToUpdate[i].captionHistory.ownerId,
          'captionHistory.captions': objectsToUpdate[i].captionHistory.captions,
          'captionHistory.next': objectsToUpdate[i].captionHistory.next,
          'captionHistory.index': objectsToUpdate[i].captionHistory.index,
        },
      }
    );
  }
};
