require('dotenv').config();
const sha1 = require('sha1');
const path = require('path');
const axios = require('axios');

const httpPath = path.join(path.dirname(require.resolve('axios')), 'lib/adapters/http');
const http = require(httpPath);

const params = require('../params');
const e = require('./elements');

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

async function createMeeting(params) {
  const meetingID = `random-${getRandomInt(1000000, 10000000).toString()}`;
  const mp = params.moderatorPW;
  const ap = params.attendeePW;
  const query = `name=${meetingID}&meetingID=${meetingID}&attendeePW=${ap}&moderatorPW=${mp}&joinViaHtml5=true`
    + `&record=false&allowStartStopRecording=true&autoStartRecording=false&welcome=${params.welcome}`;
  const apicall = `create${query}${params.secret}`;
  const checksum = sha1(apicall);
  const url = `${params.server}/create?${query}&checksum=${checksum}`;
  const response = await axios.get(url, { adapter: http });
  return meetingID;
}

function getJoinURL(meetingID, params, moderator) {
  const pw = moderator ? params.moderatorPW : params.attendeePW;
  const query = `fullName=${params.fullName}&joinViaHtml5=true&meetingID=${meetingID}&password=${pw}`;
  const apicall = `join${query}${params.secret}`;
  const checksum = sha1(apicall);
  const url = `${params.server}/join?${query}&checksum=${checksum}`;
  return url;
}

function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

exports.getRandomInt = getRandomInt;
exports.createMeeting = createMeeting;
exports.getJoinURL = getJoinURL;
exports.sleep = sleep;
