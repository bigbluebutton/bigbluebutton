import axios from 'axios';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import {
  generatePadId,
} from '/imports/api/captions/server/helpers';
import {
  appendTextURL,
} from '/imports/api/note/server/helpers';

export default function appendText(body, text, locale) {
  const { meetingId } = body;

  check(meetingId, String);
  check(text, String);
  check(locale, String);

  const padId = generatePadId(meetingId, locale);

  axios({
    method: 'get',
    url: appendTextURL(padId, text),
    responseType: 'json',
  }).then((response) => {
    const { status } = response;
    if (status === 200) {
      Logger.verbose(`Appended text for padId:${padId}`);
    }
  }).catch(error => Logger.error(`Could not append captions for padId=${padId}: ${error}`));
}
