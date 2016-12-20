import { eventEmitter } from '/imports/startup/server';
import { inReplyToHTML5Client } from '/imports/api/common/server/helpers';
import { addCaptionsToCollection } from './addCaptionsToCollection';
import { updateCaptionsCollection } from './updateCaptionsCollection';
import Meetings from '/imports/api/meetings';
import Captions from '/imports/api/captions';
import Logger from '/imports/startup/server/logger';

eventEmitter.on('send_caption_history_reply_message', function (arg) {
  Logger.debug('message', JSON.stringify(arg));
  if (inReplyToHTML5Client(arg)) {
    const meetingId = arg.payload.meeting_id;
    if (Captions.findOne({
        meetingId: meetingId,
      }) == null) {
      const captionHistory = arg.payload.caption_history;
      for (let locale in captionHistory) {
        addCaptionsToCollection(meetingId, locale, captionHistory[locale]);
      }
    }
  }

  return arg.callback();
});

eventEmitter.on('update_caption_owner_message', function (arg) {
  Logger.debug(JSON.stringify(arg));
  const meetingId = arg.payload.meeting_id;
  let payload = arg.payload;

  if (Captions.findOne({
      meetingId: meetingId,
      locale: payload.locale,
    }) != null) {
    Captions.update(
      {
        meetingId: meetingId,
        locale: payload.locale,
      },
      {
        $set: {
          'captionHistory.ownerId': payload.owner_id,
        },
      },
      {
        multi: true,
      }
    );
  } else {
    const entry = {
      meetingId: meetingId,
      locale: payload.locale,
      captionHistory: {
        locale: payload.locale,
        ownerId: payload.owner_id,
        captions: '',
        index: 0,
        length: 0,
        next: null,
      },
    };
    Captions.insert(entry);
  }

  return arg.callback();
});

eventEmitter.on('edit_caption_history_message', function (arg) {
  Logger.debug('edit_caption_history_message ' + JSON.stringify(arg));
  let payload = arg.payload;
  let meetingId = payload.meeting_id;
  let locale = payload.locale;

  if (meetingId != null) {
    updateCaptionsCollection(meetingId, locale, payload);
  }

  return arg.callback();
});
