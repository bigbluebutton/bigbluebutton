
const helpers = {};

helpers.url = 'http://10.0.3.179'; //serverUrl
helpers.port = ':3005'
helpers.callback = 'http://we2bh.requestcatcher.com'
helpers.callbackURL = '?callbackURL=' + helpers.callback
helpers.apiPath = '/bigbluebutton/api/hooks/'
helpers.createUrl = helpers.port + helpers.apiPath + 'create/' + helpers.callbackURL
helpers.destroyUrl = (id) => { return helpers.port + helpers.apiPath + 'destroy/' + '?hookID=' + id }
helpers.destroyPermanent = helpers.port + helpers.apiPath + 'destroy/' + '?hookID=1'
helpers.createRaw = '&getRaw=true'
helpers.listUrl = 'list/'
helpers.rawMessage = {
  envelope: {
    name: 'PresenterAssignedEvtMsg',
       routing: {
          msgType: 'BROADCAST_TO_MEETING',
          meetingId: 'a674bb9c6ff92bfa6d5a0a1e530fabb56023932e-1509387833678',
          userId: 'w_ysgy0erqgayc'
      }
  },
  core: {
    header: {
        name: 'PresenterAssignedEvtMsg',
        meetingId: 'a674bb9c6ff92bfa6d5a0a1e530fabb56023932e-1509387833678',
        userId: 'w_ysgy0erqgayc'
    },
    body: {
        presenterId: 'w_ysgy0erqgayc',
        presenterName: 'User 4125097',
        assignedBy: 'w_vlnwu1wkhena'
      }
  }
};

helpers.flushall = (rClient) => {
  let client = rClient;
  client.flushdb()
}

helpers.flushredis = (hook) => {
  hook.redisClient.flushdb();
}

module.exports = helpers;
