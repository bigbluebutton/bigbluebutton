import axios from 'axios';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Captions from '/imports/api/captions';
import { appendTextURL } from '/imports/api/common/server/etherpad';
import { extractCredentials } from '/imports/api/common/server/helpers';

const CAPTIONS_CONFIG = Meteor.settings.public.captions;

function sendToPad (padId, text) {
  axios({
    method: 'get',
    url: appendTextURL(padId, text),
    responseType: 'json',
  }).then((response) => {
    const { status } = response;
    if (status !== 200) {
      Logger.error(`Could not append captions for padId=${padId}`);
    }
  }).catch((error) => Logger.error(`Could not append captions for padId=${padId}: ${error}`));
}

function translateText (padId, index, textOri, src, dst) {
  const url = CAPTIONS_CONFIG.googleTranslateUrl + '/exec?' +
              'text=' + encodeURIComponent(textOri) + '&source=' + src + '&target=' + dst;

  if (index === 0) {
      sendToPad(padId, textOri);
  } else {
    axios({
      method: 'get',
      url,
      responseType: 'json',
    }).then((response) => {
      const { code, text } = response.data;
      if (code === 200) {
        //sendToPad(padId, text.replace(/\n+$/,''));
        sendToPad(padId, text);
      } else {
        Logger.error(`Could not get translation for ${textOri}`);
      }
    }).catch((error) => Logger.error(`Could not get translation for ${textOri}: ${error}`));

  }
}

export default function appendText(text, locales) {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(text, String);
    check(locales, Array);

    locales.forEach(function(locale, index) {
      const captions = Captions.findOne({
        meetingId,
        locale,
        ownerId: requesterUserId,
      });

      if (!captions) {
        Logger.error(`Could not find captions' pad for meetingId=${meetingId} locale=${locale}`);
        return;
      }

      const { padId } = captions;
      translateText(padId, index, text, locales[0], locale);
    });
  } catch (err) {
    Logger.error(`Exception while invoking method appendText ${err.stack}`);
  }
}
