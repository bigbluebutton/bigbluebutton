require('dotenv').config();
const sha = require('sha.js');
const axios = require('axios');
const { test, expect } = require('@playwright/test');
const xml2js = require('xml2js');
const { runScript } = require('./util');
const { env } = require('node:process');

const { format } = require('node:util');
// This is version 4 of chalk, not version 5, which uses ESM
const chalk = require('chalk');
const parameters = require('./parameters');

function getChecksum(text, secret) {
  let algorithm = (process.env.CHECKSUM || '').toLowerCase();
  if (!['sha1', 'sha256', 'sha512'].includes(algorithm)) {
    switch (secret.length) {
      case 128:
        algorithm = 'sha512';
        break;
      case 64:
        algorithm = 'sha256';
        break;
      case 40:
      default:
        algorithm = 'sha1'
    }
  }
  return sha(algorithm).update(text).digest('hex');
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function getApiCallUrl(name, callParams) {
  const query = new URLSearchParams(callParams).toString();
  const apiCall = `${name}${query}${parameters.secret}`;
  const checksum = getChecksum(apiCall, parameters.secret);
  const url = `${parameters.server}/api/${name}?${query}&checksum=${checksum}`;
  return url;
}

function apiCall(name, callParams) {
  const url = getApiCallUrl(name, callParams);
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
  const checksum = getChecksum(apiCall, parameters.secret);
  const url = `${params.server}/api/create?${query}&checksum=${checksum}`;
  return url;
}

function createMeetingPromise(params, createParameter, customMeetingId) {
  const url = createMeetingUrl(params, createParameter, customMeetingId);
  return axios.get(url, { adapter: 'http' });
}

async function createMeeting(params, createParameter, customMeetingId) {
  const promise = createMeetingPromise(params, createParameter, customMeetingId);
  const response = await promise;
  expect(response.status).toEqual(200);
  const xmlResponse = await xml2js.parseStringPromise(response.data);
  return xmlResponse.response.meetingID[0];
}

function getJoinURL(meetingID, params, moderator, joinParameter, skipSessionDetailsModal) {
  const pw = moderator ? params.moderatorPW : params.attendeePW;
  const shouldSkipSessionDetailsModal = skipSessionDetailsModal ? '&userdata-bbb_show_session_details_on_join=false' : '';  // default value in settings.yml is true
  const baseQuery = `fullName=${params.fullName}&meetingID=${meetingID}&password=${pw}${shouldSkipSessionDetailsModal}`;
  const query = joinParameter !== undefined ? `${baseQuery}&${joinParameter}` : baseQuery;
  const apiCall = `join${query}${parameters.secret}`;
  const checksum = getChecksum(apiCall, parameters.secret);
  return `${params.server}/api/join?${query}&checksum=${checksum}`;
}

async function checkRootPermission() {
  const checkSudo = await runScript('timeout -k 1 1 sudo id', {
    handleOutput: (output) => output ? true : false
  })
  await expect(checkSudo, 'Sudo failed: need to run this test with root permission (can be fixed by running "sudo -v" and entering the password)').toBeTruthy();
}

async function console_format(msg, CONSOLE_options) {
  const args = await Promise.all(msg.args().map(itm => itm.jsonValue()));
  // For Chrome, args[0] is a format string that we will process using
  // node.js's util.format, but that function discards css style
  // information from "%c" format specifiers.  So first loop over the
  // format string, replacing every "%c" with "%s" and replacing the
  // corresponding css style with an ANSI color sequence.
  //
  // See https://console.spec.whatwg.org/ sections 2.2.1 and 2.3.4

  let split_arg0 = args[0].split("%");
  for (let i = 1, j = 1; i < split_arg0.length; i++, j++) {
    if (split_arg0[i].startsWith('c')) {
      split_arg0[i] = 's' + split_arg0[i].substr(1);
      const styles = args[j].split(';');
      args[j] = '';
      for (const style of styles) {
        const stdStyle = style.trim().toLowerCase();
        if (stdStyle.startsWith('color:') && CONSOLE_options.colorize) {
          const color = stdStyle.substr(6).trim();
          args[j] = chalk.keyword(color)._styler.open;
        } else if (stdStyle.startsWith('font-size:') && CONSOLE_options.drop_references) {
          // For Chrome, we "drop references" by discarding everything after a font size change
          split_arg0.length = i;
          args.length = j;
        }
      }
    } else if (split_arg0[i] == "") {
      // format is "%%", so don't do special processing for
      // split_arg0[i+1], and only increment i, not j
      i++;  // NOSONAR
    }
  }
  args[0] = split_arg0.join('%');

  // see playwright consoleMessage class documentation
  let result = format(...args);

  if (CONSOLE_options.drop_references) {
    // For Firefox, we "drop references" by discarding a URL at the end of the line
    result = result.replace(/https:\/\/\S*$/, '');
  }

  if (CONSOLE_options.noClientLogger) {
    result = result.replace(/clientLogger: /, '');
  }

  if (CONSOLE_options.drop_timestamps) {
    // timestamp formatting is a bit complicated, with four "%s" fields and corresponding arguments,
    // so just filter them out (if requested) after all the other formatting is done
    result = result.replace(/\[\d\d:\d\d:\d\d:\d\d\d\d\] /, '');
  }

  if (CONSOLE_options.line_label) {
    if (CONSOLE_options.colorize) {
      result = chalk.keyword('green')(CONSOLE_options.line_label) + result;
    } else {
      result = CONSOLE_options.line_label + result;
    }
  }

  return result;
}

async function setBrowserLogs(page) {
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

async function initializePages(testInstance, browser, initOptions) {
  const { isMultiUser, createParameter, joinParameter } = initOptions || {};
  const context = await browser.newContext();
  const page = await context.newPage();
  await testInstance.initModPage(page, true, { createParameter, joinParameter });
  if (isMultiUser) await testInstance.initUserPage(true, context, { createParameter, joinParameter });
}

exports.getApiCallUrl = getApiCallUrl;
exports.apiCall = apiCall;
exports.createMeetingUrl = createMeetingUrl;
exports.createMeetingPromise = createMeetingPromise;
exports.createMeeting = createMeeting;
exports.getJoinURL = getJoinURL;
exports.checkRootPermission = checkRootPermission;
exports.linkIssue = linkIssue;
exports.sleep = sleep;
exports.setBrowserLogs = setBrowserLogs;
exports.initializePages = initializePages;
