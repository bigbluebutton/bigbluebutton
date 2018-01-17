import _ from 'lodash';
import Captions from '/imports/api/captions';
import { check } from 'meteor/check';
import addCaption from '../modifiers/addCaption';

export default function handleCaptionHistory({ body }, meetingId) {
  const SERVER_CONFIG = Meteor.settings.private.app;
  const CAPTION_CHUNK_LENGTH = SERVER_CONFIG.captionsChunkLength || 1000;

  const captionHistory = body.history;

  check(meetingId, String);
  check(captionHistory, Object);

  const captionsAdded = [];
  _.each(captionHistory, (caption, locale) => {
    const ownerId = caption[0];
    let captions = caption[1].slice(0);
    const chunks = [];

    if (captions.length === 0) {
      chunks.push('');
    } else {
      while (captions.length > 0) {
        if (captions.length > CAPTION_CHUNK_LENGTH) {
          chunks.push(captions.slice(0, CAPTION_CHUNK_LENGTH));
          captions = captions.slice(CAPTION_CHUNK_LENGTH);
        } else {
          chunks.push(captions);
          captions = captions.slice(captions.length);
        }
      }
    }

    const selectorToRemove = {
      meetingId,
      locale,
      'captionHistory.index': { $gt: (chunks.length - 1) },
    };

    Captions.remove(selectorToRemove);

    chunks.forEach((chunkCaptions, index) => {
      const captionHistoryObject = {
        locale,
        ownerId,
        chunkCaptions,
        index,
        next: (index < chunks.length - 1) ? index + 1 : undefined,
      };

      captionsAdded.push(addCaption(meetingId, locale, captionHistoryObject));
    });
  });

  return captionsAdded;
}
