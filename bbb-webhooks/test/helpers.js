
const helpers = {};

helpers.url = 'http://10.0.3.179';
helpers.port = ':3005'
helpers.callback = 'http://we2bh.requestcatcher.com'
helpers.callbackURL = '?callbackURL=' + helpers.callback
helpers.apiPath = '/bigbluebutton/api/hooks/'
helpers.createUrl = helpers.port + helpers.apiPath + 'create/' + helpers.callbackURL
helpers.destroyUrl = helpers.port + helpers.apiPath + 'destroy/' + helpers.callbackURL + '&hookID=3'
helpers.destroyPermanent = helpers.port + helpers.apiPath + 'destroy/' + helpers.callbackURL + '&hookID=1'
helpers.createRaw = '&getRaw=true'
helpers.listUrl = 'list/'
helpers.createMeeting = () => { return '/bigbluebutton/api/create?meetingID=' + Math.floor((Math.random() * 100) + 1) + '&attendeePW=ap&moderatorPW=mp' }
helpers.endMeeting = () => { return '/bigbluebutton/api/end?meetingID='+ Math.floor((Math.random() * 100) + 1) +'&password=mp' }
helpers.mappedMessage = {"data": {"type": "event","id": "user-left","attributes": {"meeting": {"external-meeting-id": "random-578101","internal-meeting-id": "0a168dbfbe554287381bf0cfe27e015e33207702-1502212442238"},"user": {"internal-user-id": "lwzhlo27k2zf_1","external-user-id": "lwzhlo27k2zf"},"event": {"ts": 1502810164922}}}}
helpers.encodedMessage = 'event=' + encodeURIComponent(JSON.stringify(helpers.mappedMessage));
helpers.rawMessage = {"payload":{"duration":0,"external_meeting_id":"53","create_time":1504639678247,"meeting_id":"c5b76da3e608d34edb07244cd9b875ee86906328-1504639678247","is_breakout":false,"name":"","moderator_pass":"mp","recorded":false,"voice_conf":"08561","viewer_pass":"ap","create_date":"Tue Sep 05 19:27:58 UTC 2017"},"header":{"name":"meeting_created_message","version":"0.0.1","current_time":1504639678250}}
helpers.encodedRaw = 'event=' + encodeURIComponent(JSON.stringify(helpers.rawMessage));


module.exports = helpers;
