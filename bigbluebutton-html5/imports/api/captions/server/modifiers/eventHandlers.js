import { eventEmitter } from '/imports/startup/server';
import { inReplyToHTML5Client } from '/imports/api/common/server/helpers';
import { addCaptionsToCollection } from './addCaptionsToCollection';
import Meetings from '/imports/api/meetings';
import Captions from '/imports/api/captions';

eventEmitter.on('send_caption_history_reply_message', function (arg) {
  console.error('message', JSON.stringify(arg));
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
  console.error(JSON.stringify(arg));
  let payload = arg.payload;
  Captions.update({
    meetingId: payload.meeting_id,
    locale: payload.locale,
  }, {
    $set: {
      'captionHistory.ownerId': payload.owner_id,
    },
  });

  return arg.callback();
});

eventEmitter.on('edit_caption_history_message', function (arg) {
  console.error(JSON.stringify(arg));
  let payload = arg.payload;
  let captionsObj = Captions.findOne({
    meetingId: payload.meeting_id,
    locale: payload.locale,
  });

  if (captionsObj != null) {
    let text = captionsObj.captionHistory.captions;
    let start = payload.start_index;
    let end = payload.end_index;

    text = text.slice(0, start) + payload.text + text.slice(end, text.length);
    Captions.update({
      meetingId: payload.meeting_id,
      locale: payload.locale,
    }, {
      $set: {
        'captionHistory.captions': text,
      },
    });
  }

  return arg.callback();
});
