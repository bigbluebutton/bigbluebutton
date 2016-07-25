import Captions from '/imports/api/captions';
import { logger } from '/imports/startup/server/logger';

// called on server start and meeting end
export function addCaptionsToCollection(meetingId, locale, captionHistory) {
  let captionsString = captionHistory[1].slice(0);
  let captions = [];

  while (captionsString.length > 0) {
    if (captionsString.length > 100) {
      captions.push(captionsString.slice(0, 100));
      captionsString = captionsString.slice(100);
    } else {
      captions.push(captionsString);
      captionsString = captionsString.slice(captionsString.length);
    }
  }

  let i;
  for (i = 0; i < captions.length; i++) {
    const entry = {
      meetingId: meetingId,
      locale: locale,
      captionHistory: {
        locale: locale,
        ownerId: captionHistory[0],
        captions: captions[i],
        index: i,
        length: captions[i].length,
      },
    };
    Captions.insert(entry);
  }

  logger.info(`added captions locale=[${locale}]:meetingId=[${meetingId}].`);
};
