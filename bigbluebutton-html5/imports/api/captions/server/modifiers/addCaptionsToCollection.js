import Captions from '/imports/api/captions';
import { logger } from '/imports/startup/server/logger';

export function addCaptionsToCollection(meetingId, locale, captionHistory) {
  let captionsString = captionHistory[1].slice(0);
  let captions = [];

  if (captionsString.length > 0) {
    while (captionsString.length > 0) {
      if (captionsString.length > 1000) {
        captions.push(captionsString.slice(0, 1000));
        captionsString = captionsString.slice(1000);
      } else {
        captions.push(captionsString);
        captionsString = captionsString.slice(captionsString.length);
      }
    }
  } else {
    captions.push('');
  }

  let i;
  let next;
  for (i = 0; i < captions.length; i++) {
    if (i < captions.length - 1) {
      next = i + 1;
    } else {
      next = undefined;
    }

    const entry = {
      meetingId: meetingId,
      locale: locale,
      captionHistory: {
        locale: locale,
        ownerId: captionHistory[0],
        captions: captions[i],
        index: i,
        next: next,
      },
    };
    Captions.insert(entry);
  }

  logger.info(`added captions locale=[${locale}]:meetingId=[${meetingId}].`);
};
