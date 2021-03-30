import axios from 'axios';
import sha1 from 'crypto-js/sha1';
import Logger from '/imports/startup/server/logger';
import createNote from '/imports/api/note/server/methods/createNote';
import createCaptions from '/imports/api/captions/server/methods/createCaptions';

const ETHERPAD = Meteor.settings.private.etherpad;
const BASE_URL = `http://${ETHERPAD.host}:${ETHERPAD.port}/api/${ETHERPAD.version}`;

const createPadURL = padId => `${BASE_URL}/createPad?apikey=${ETHERPAD.apikey}&padID=${padId}`;

const getReadOnlyIdURL = padId => `${BASE_URL}/getReadOnlyID?apikey=${ETHERPAD.apikey}&padID=${padId}`;

const appendTextURL = (padId, text) => `${BASE_URL}/appendText?apikey=${ETHERPAD.apikey}&padID=${padId}&text=${encodeURIComponent(text)}`;

const checkTokenURL = () => `${BASE_URL}/checkToken?apikey=${ETHERPAD.apikey}`;

const hashSHA1 = (str) => sha1(str).toString();

const checkServer = () => {
  return new Promise((resolve, reject) => {
    axios({
      method: 'get',
      url: checkTokenURL(),
      responseType: 'json',
    }).then((response) => {
      const { status } = response;
      if (status !== 200) return reject();
      const { message } = response.data;
      if (message !== 'ok') return reject();
      resolve();
    }).catch(() => reject());
  });
};

const initPads = (meetingId) => {
  checkServer().then(() => {
    createNote(meetingId);
    createCaptions(meetingId);
  }).catch(() => Logger.error(`Pads' server unreachable`));
};

export {
  hashSHA1,
  createPadURL,
  getReadOnlyIdURL,
  appendTextURL,
  initPads,
}
