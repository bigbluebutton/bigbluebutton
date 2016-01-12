let config, file, ref, transports, winston;

config = {};

config.appName = 'BigBlueButton HTML5 Client';

config.bbbServerVersion = '1.0-beta';

config.copyrightYear = '2015';

config.html5ClientBuild = 'NNNN';

config.defaultWelcomeMessage = 'Welcome to %%CONFNAME%%!\r\rFor help on using BigBlueButton see these (short) <a href="event:http://www.bigbluebutton.org/content/videos"><u>tutorial videos</u></a>.\r\rTo join the audio bridge click the gear icon (upper-right hand corner).  Use a headset to avoid causing background noise for others.\r\r\r';

config.defaultWelcomeMessageFooter = `This server is running a build of <a href='http://docs.bigbluebutton.org/1.0/10overview.html' target='_blank'><u>BigBlueButton ${config.bbbServerVersion}</u></a>.`;

config.maxUsernameLength = 30;

config.maxChatLength = 140;

config.lockOnJoin = true;

config.app = {};

config.app.mobileFont = 16;

config.app.desktopFont = 14;

config.app.autoJoinAudio = false;

config.app.listenOnly = false;

config.app.skipCheck = false;

config.app.WebRTCHangupRetryInterval = 2000;

config.redis = {};

config.redis.host = "127.0.0.1";

config.redis.post = "6379";

config.redis.timeout = 5000;

config.redis.channels = {};

config.redis.channels.fromBBBApps = "bigbluebutton:from-bbb-apps:*";

config.redis.channels.toBBBApps = {};

config.redis.channels.toBBBApps.pattern = "bigbluebutton:to-bbb-apps:*";

config.redis.channels.toBBBApps.chat = "bigbluebutton:to-bbb-apps:chat";

config.redis.channels.toBBBApps.meeting = "bigbluebutton:to-bbb-apps:meeting";

config.redis.channels.toBBBApps.presentation = "bigbluebutton:to-bbb-apps:presentation";

config.redis.channels.toBBBApps.users = "bigbluebutton:to-bbb-apps:users";

config.redis.channels.toBBBApps.voice = "bigbluebutton:to-bbb-apps:voice";

config.redis.channels.toBBBApps.whiteboard = "bigbluebutton:to-bbb-apps:whiteboard";

config.redis.channels.toBBBApps.polling = "bigbluebutton:to-bbb-apps:polling";

config.log = {};

if(Meteor.isServer) {
  config.log.path = (typeof process !== "undefined" && process !== null ? (ref = process.env) != null ? ref.NODE_ENV : void 0 : void 0) === "production" ? "/var/log/bigbluebutton/bbbnode.log" : `${process.env.PWD}/../log/development.log`;
  winston = Winston;
  file = config.log.path;
  transports = [
    new winston.transports.Console(), new winston.transports.File({
      filename: file
    })
  ];
  Meteor.log = new winston.Logger({
    transports: transports
  });
}

Meteor.config = config;
