import axios from 'axios';
import { Meteor } from 'meteor/meteor';
import createCaptions from '/imports/api/captions/server/modifiers/createCaptions';
import Logger from '/imports/startup/server/logger';

const CAPTIONS_CONFIG = Meteor.settings.public.captions;
const BASENAME = Meteor.settings.public.app.basename;
const HOST = Meteor.settings.private.app.host;
const LOCALES = Meteor.settings.private.app.localesUrl;
const LOCALES_URL = `http://${HOST}:${process.env.PORT}${BASENAME}${LOCALES}`;

const init = (meetingId) => {
  axios({
    method: 'get',
    url: LOCALES_URL,
    responseType: 'json',
  }).then((response) => {
    const { status } = response;
    if (status !== 200) return;

    const locales = response.data;
    locales.forEach((locale) => createCaptions(meetingId, locale.locale, locale.name));
  }).catch((error) => Logger.error(`Could not create captions for ${meetingId}: ${error}`));
};

const initCaptions = (meetingId) => {
  if (CAPTIONS_CONFIG.enabled) init(meetingId);
};

export {
  initCaptions,
};
