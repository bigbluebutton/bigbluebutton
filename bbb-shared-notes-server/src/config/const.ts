import { AppSettings } from "./type";

const  DEFAULT_SETTINGS: AppSettings = {
  hocuspocusServer: {
    host: '127.0.0.1',
    port: 9001,
  },
  shared: {
    tmpDirectory: '/tmp/pres-ann-dropbox',
  },
  bbbWeb: {
    host: '127.0.0.1',
    port: '8090',
    presentationEndpoint: '/bigbluebutton/presentation',
    checkAuthorizationEndpoint: '/bigbluebutton/connection/checkGraphqlAuthorization',
  },
  log: {
    level: 'info',
  },
  redis: {
    host: '127.0.0.1',
    port: 6379,
    password: null,
    channels: {
      publish: ['to-akka-apps-redis-channel'],
      subscribe: [
        'from-akka-apps-redis-channel',
        'from-etherpad-redis-channel',
      ],
    },
  },
  bbbPostgres: {
    host: '127.0.0.1',
    port: 5432,
    database: 'bbb_graphql',
    user: 'bbb_core',
    password: 'bbb_core',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  sqlite: {
    database: process.env.NODE_ENV === 'production'
      ? '/var/lib/bbb-shared-notes-server/db.sqlite'
      : './db.sqlite',
  },
};

export default DEFAULT_SETTINGS;
