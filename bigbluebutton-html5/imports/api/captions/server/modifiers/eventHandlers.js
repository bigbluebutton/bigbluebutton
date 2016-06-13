import { eventEmitter } from '/imports/startup/server';
import { inReplyToHTML5Client } from '/imports/api/common/server/helpers';

import Meetings from '/imports/api/meetings';
import Captions from '/imports/api/captions';

eventEmitter.on('send_caption_history_reply_message', function (arg) {
  console.error(JSON.stringify(arg));
  if (inReplyToHTML5Client(arg)) {
    const meetingId = arg.payload.meeting_id;
    if (Meetings.findOne({
        meetingId: meetingId,
      }) == null) {
      const captionHistory = arg.payload.caption_history;

      for (let locale in captionHistory) {
        console.error(`locale:${locale}\n`);
        // console.error(`locale:${locale}\n` + captionHistory[locale]);
        for (let caption in captionHistory[locale]) {
          console.error(`caption = ${captionHistory[locale][caption]}`);
          Captions.upsert({
            meetingId: meetingId,
            locale: locale,
          }, {
            meetingId: meetingId, //TODO check if we need these
            locale: locale,
            captions: captionHistory[locale],
          });
        }
      }
    }
  }

  return arg.callback();
});

eventEmitter.on('edit_caption_history_message', function (arg) {
  console.error(JSON.stringify(arg));
  let payload = arg.payload;

  Captions.upsert({
    meetingId: payload.meeting_id,
    locale: payload.locale,
  }, {
    meetingId: payload.meeting_id, //TODO check upsert docs
    locale: payload.locale,
    startIndex: payload.start_index,
    endIndex: payload.end_index,
    text: payload.text,
    enteredBy: payload.userid,
  });

  return arg.callback();
});
