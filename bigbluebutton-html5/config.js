// TODO: should be split on server and client side
// // Global configurations file

let config;

config = {};

// Default global variables

config.appName = 'BigBlueButton HTML5 Client';

config.bbbServerVersion = '1.0-beta';

config.copyrightYear = '2015';

config.html5ClientBuild = 'NNNN';

config.defaultWelcomeMessage = 'Welcome to %%CONFNAME%%!\r\rFor help on using BigBlueButton see these (short) <a href="event:http://www.bigbluebutton.org/content/videos"><u>tutorial videos</u></a>.\r\rTo join the audio bridge click the gear icon (upper-right hand corner).  Use a headset to avoid causing background noise for others.\r\r\r';

config.defaultWelcomeMessageFooter = `This server is running a build of <a href='http://docs.bigbluebutton.org/1.0/10overview.html' target='_blank'><u>BigBlueButton ${config.bbbServerVersion}</u></a>.`;

config.maxUsernameLength = 30;

config.maxChatLength = 140;

config.lockOnJoin = true;

//// Application configurations

config.app = {};

//default font sizes for mobile / desktop

config.app.mobileFont = 16;

config.app.desktopFont = 14;

// Will offer the user to join the audio when entering the meeting

config.app.autoJoinAudio = false;

config.app.listenOnly = false;

config.app.skipCheck = false;

// The amount of time the client will wait before making another call to successfully hangup the WebRTC conference call

config.app.WebRTCHangupRetryInterval = 2000;


// Configs for redis
export const redisConfig = {
  host: '127.0.0.1',
  post: '6379',
  timeout: 5000,
  channels: {
    fromBBBApps: 'bigbluebutton:from-bbb-apps:*',
    toBBBApps: {
      pattern: 'bigbluebutton:to-bbb-apps:*',
      chat: 'bigbluebutton:to-bbb-apps:chat',
      meeting: 'bigbluebutton:to-bbb-apps:meeting',
      presentation: 'bigbluebutton:to-bbb-apps:presentation',
      users: 'bigbluebutton:to-bbb-apps:users',
      voice: 'bigbluebutton:to-bbb-apps:voice',
      whiteboard: 'bigbluebutton:to-bbb-apps:whiteboard',
      polling: 'bigbluebutton:to-bbb-apps:polling',
    },
  },
};

Meteor.config = config;
