require('dotenv').config();
const sha1 = require('sha1');
const axios = require('axios');

const params = require('./params');
const e = require('./elements');

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

async function createMeeting(params)
{
  var meetingID = "random-" + getRandomInt(1000000, 10000000).toString();
  var mp = params.moderatorPW;
  var ap = params.attendeePW;
  var query = `name=${meetingID}&meetingID=${meetingID}&attendeePW=${ap}&moderatorPW=${mp}&joinViaHtml5=true` +
    `&record=false&allowStartStopRecording=true&autoStartRecording=false&welcome=${params.welcome}`;
  var apicall = "create" + query + params.secret;
  var checksum = sha1(apicall);
  var url = params.server + "/create?" + query + "&checksum=" + checksum;
  var response = await axios.get(url);
  return meetingID;
}

function getJoinURL(meetingID, params, moderator)
{
  var pw = moderator ? params.moderatorPW : params.attendeePW;
  var query = `fullName=${params.fullName}&joinViaHtml5=true&meetingID=${meetingID}&password=${pw}`;
  var apicall = "join" + query + params.secret;
  var checksum = sha1(apicall);
  var url = params.server + "/join?" + query + "&checksum=" + checksum;
  return url;
}

function sleep(time)
{
  return new Promise((resolve) =>
  {
    setTimeout(resolve, time);
  });
}

exports.getRandomInt = getRandomInt;
exports.createMeeting = createMeeting;
exports.getJoinURL = getJoinURL;
exports.sleep = sleep;