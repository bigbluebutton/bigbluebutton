require('dotenv').config();
const sha1 = require('sha1');
const path = require('path');
const axios = require('axios');
const xml2js = require('xml2js');

const { expect } = require("@playwright/test");

const parameters = require('./parameters');

const httpPath = path.join(path.dirname(require.resolve('axios')), 'lib/adapters/http');
const http = require(httpPath);

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function apiCallUrl(name, callParams) {
  const query = new URLSearchParams(callParams).toString();
  const apicall = `${name}${query}${parameters.secret}`;
  const checksum = sha1(apicall);
  const url = `${parameters.server}/${name}?${query}&checksum=${checksum}`;
  return url;
}

function apiCall(name, callParams) {
  const url = apiCallUrl(name, callParams);
  return axios.get(url, { adapter: http }).then(response => xml2js.parseStringPromise(response.data));
}

function createMeetingUrl(params, customParameter) {
  const meetingID = `random-${getRandomInt(1000000, 10000000).toString()}`;
  const mp = params.moderatorPW;
  const ap = params.attendeePW;
  const query = customParameter !== undefined ? `name=${meetingID}&meetingID=${meetingID}&attendeePW=${ap}&moderatorPW=${mp}`
    + `&allowStartStopRecording=true&${customParameter}&autoStartRecording=false&welcome=${params.welcome}`
    : `name=${meetingID}&meetingID=${meetingID}&attendeePW=${ap}&moderatorPW=${mp}`
    + `&allowStartStopRecording=true&autoStartRecording=false&welcome=${params.welcome}`;
  const apicall = `create${query}${params.secret}`;
  const checksum = sha1(apicall);
  const url = `${params.server}/create?${query}&checksum=${checksum}`;
  return url;
}

function createMeetingPromise(params, customParameter) {
  const url = createMeetingUrl(params, customParameter);
  return axios.get(url, { adapter: http });
}

async function createMeeting(params, customParameter) {
  const promise = createMeetingPromise(params, customParameter);
  const response = await promise;
  expect(response.status).toEqual(200);
  const xmlresponse = await xml2js.parseStringPromise(response.data);
  return xmlresponse.response.meetingID[0];
}

function getJoinURL(meetingID, params, moderator, customParameter) {
  const pw = moderator ? params.moderatorPW : params.attendeePW;
  const query = customParameter !== undefined ? `fullName=${params.fullName}&meetingID=${meetingID}&password=${pw}&${customParameter}`
    : `fullName=${params.fullName}&meetingID=${meetingID}&password=${pw}`;
  const apicall = `join${query}${params.secret}`;
  const checksum = sha1(apicall);
  return `${params.server}/join?${query}&checksum=${checksum}`;
}

function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

exports.getRandomInt = getRandomInt;
exports.apiCallUrl = apiCallUrl;
exports.apiCall = apiCall;
exports.createMeetingUrl = createMeetingUrl;
exports.createMeetingPromise = createMeetingPromise;
exports.createMeeting = createMeeting;
exports.getJoinURL = getJoinURL;
exports.sleep = sleep;
