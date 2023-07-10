require('dotenv').config();
const sha1 = require('sha1');
const axios = require('axios');
const { test, expect } = require('@playwright/test');
const xml2js = require('xml2js');
const { runScript } = require('./util');
const { env } = require('node:process');

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

function createMeetingUrl(params, createParameter, customMeetingId) {
  const meetingID = (customMeetingId) ? customMeetingId : `random-${getRandomInt(1000000, 10000000).toString()}`;
  const mp = params.moderatorPW;
  const ap = params.attendeePW;
  const baseQuery = `name=${meetingID}&meetingID=${meetingID}&attendeePW=${ap}&moderatorPW=${mp}`
    + `&allowStartStopRecording=true&autoStartRecording=false&welcome=${params.welcome}`;
  const query = createParameter !== undefined ? `${baseQuery}&${createParameter}` : baseQuery;
  const apiCall = `create${query}${params.secret}`;
  const checksum = sha1(apiCall);
  const url = `${params.server}/create?${query}&checksum=${checksum}`;
  return url;
}

function createMeetingPromise(params, createParameter, customMeetingId) {
  const url = createMeetingUrl(params, createParameter, customMeetingId);
  return axios.get(url, { adapter: 'http' });
}

async function createMeeting(params, createParameter, page) {
  const promise = createMeetingPromise(params, createParameter);
  const response = await promise;
  expect(response.status).toEqual(200);
  const xmlResponse = await xml2js.parseStringPromise(response.data);

  if (env.CONSOLE !== undefined) {
    const CONSOLE_strings = env.CONSOLE.split(',').map(opt => opt.trim().toLowerCase());
    const CONSOLE_options = {
      colorize: CONSOLE_strings.includes('color') || CONSOLE_strings.includes('colour'),
      drop_references: CONSOLE_strings.includes('norefs'),
      drop_timestamps: CONSOLE_strings.includes('nots'),
      line_label: CONSOLE_strings.includes('label') ? this.username + " " : undefined,
      noClientLogger: CONSOLE_strings.includes('nocl') || CONSOLE_strings.includes('noclientlogger'),
    };
    page.on('console', async (msg) => console.log(await console_format(msg, CONSOLE_options)));
  }

  return xmlResponse.response.meetingID[0];
}

function getJoinURL(meetingID, params, moderator, joinParameter) {
  const pw = moderator ? params.moderatorPW : params.attendeePW;
  const baseQuery = `fullName=${params.fullName}&meetingID=${meetingID}&password=${pw}`;
  const query = joinParameter !== undefined ? `${baseQuery}&${joinParameter}` : baseQuery;
  const apiCall = `join${query}${params.secret}`;
  const checksum = sha1(apiCall);
  return `${params.server}/join?${query}&checksum=${checksum}`;
}

async function checkRootPermission() {
  const checkSudo = await runScript('timeout -k 1 1 sudo id', {
    handleOutput: (output) => output ? true : false
  })
  await expect(checkSudo, 'Sudo failed: need to run this test with root permission (can be fixed by running "sudo -v" and entering the password)').toBeTruthy();
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
exports.checkRootPermission = checkRootPermission;
exports.linkIssue = linkIssue;
exports.sleep = sleep;
