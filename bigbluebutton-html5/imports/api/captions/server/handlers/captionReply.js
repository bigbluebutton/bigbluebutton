import _ from 'underscore';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import { inReplyToHTML5Client } from '/imports/api/common/server/helpers';
import addCaption from '../modifiers/addCaption';

export default function handleCaptionReply({ payload }) {
  if (!inReplyToHTML5Client({ payload })) {
    return;
  }

  const SERVER_CONFIG = Meteor.settings.app;
  const CAPTION_CHUNK_LENGTH = SERVER_CONFIG.captionsChunkLength || 1000;

  const meetingId = payload.meeting_id;
  const locale = payload.locale;
  const captionHistory = payload.caption_history;

  check(meetingId, String);
  check(captionHistory, Object);

  let captionsAdded = [];
  _.each(captionHistory, (caption, locale) => {
    let ownerId = caption[0];
    let captions = caption[1].slice(0);
    let chunks = [];

    while (captions.length > 0) {
      if (captions.length > CAPTION_CHUNK_LENGTH) {
        chunks.push(captions.slice(0, CAPTION_CHUNK_LENGTH));
        captions = captions.slice(CAPTION_CHUNK_LENGTH);
      } else {
        chunks.push(captions);
        captions = captions.slice(captions.length);
      }
    }

    if (captions.length === 0) {
      chunks.push('');
    }

    chunks.forEach((captions, index) => {
      let captionHistoryObject = {
        locale,
        ownerId,
        captions,
        index,
        next: (index === chunks.length - 1) ? index + 1 : undefined,
      };

      captionsAdded.push(addCaption(meetingId, locale, captionHistoryObject));
    });
  });

  return captionsAdded;
};
