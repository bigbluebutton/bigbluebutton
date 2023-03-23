require('dotenv').config();
const sha1 = require('sha1');
const axios = require('axios');
const { test, expect } = require('@playwright/test');
const xml2js = require('xml2js');

const parameters = require('./parameters');

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function apiCallUrl(name, callParams) {
  const query = new URLSearchParams(callParams).toString();
  const apiCall = `${name}${query}${parameters.secret}`;
  const checksum = sha1(apiCall);
  const url = `${parameters.server}/${name}?${query}&checksum=${checksum}`;
  return url;
}

function apiCall(name, callParams) {
  const url = apiCallUrl(name, callParams);
  return axios.get(url, { adapter: 'http' }).then(response => xml2js.parseStringPromise(response.data));
}

function createMeetingUrl(params, customParameter, customMeetingId) {
  const meetingID = (customMeetingId) ? customMeetingId : `random-${getRandomInt(1000000, 10000000).toString()}`;
  const mp = params.moderatorPW;
  const ap = params.attendeePW;
  const baseQuery = `name=${meetingID}&meetingID=${meetingID}&attendeePW=${ap}&moderatorPW=${mp}`
    + `&allowStartStopRecording=true&autoStartRecording=false&welcome=${params.welcome}`;
  const query = customParameter !== undefined ? `${baseQuery}&${customParameter}` : baseQuery;
  const apiCall = `create${query}${params.secret}`;
  const checksum = sha1(apiCall);
  const url = `${params.server}/create?${query}&checksum=${checksum}`;
  return url;
}

function createMeetingPromise(params, customParameter, customMeetingId) {
  const url = createMeetingUrl(params, customParameter, customMeetingId);
  return axios.get(url, { adapter: 'http' });
}

async function createMeeting(params, customParameter) {
  const promise = createMeetingPromise(params, customParameter);
  const response = await promise;
  expect(response.status).toEqual(200);
  const xmlResponse = await xml2js.parseStringPromise(response.data);
  return xmlResponse.response.meetingID[0];
}

function getJoinURL(meetingID, params, moderator, customParameter) {
  const pw = moderator ? params.moderatorPW : params.attendeePW;
  const baseQuery = `fullName=${params.fullName}&meetingID=${meetingID}&password=${pw}`;
  const query = customParameter !== undefined ? `${baseQuery}&${customParameter}` : baseQuery;
  const apiCall = `join${query}${params.secret}`;
  const checksum = sha1(apiCall);
  return `${params.server}/join?${query}&checksum=${checksum}`;
}

function linkIssue(issueNumber) {
  test.info().annotations.push({
    type: 'Issue/PR',
    description: `https://github.com/bigbluebutton/bigbluebutton/issues/${issueNumber}`,
  });
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
exports.linkIssue = linkIssue;
exports.sleep = sleep;
