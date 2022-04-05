// import RedisPubSub from '/imports/startup/server/redis';
// import { Meteor } from 'meteor/meteor';
// import { check } from 'meteor/check';
// import { extractCredentials } from '/imports/api/common/server/helpers';
// import Logger from '/imports/startup/server/logger';
// import Shapes from '/imports/api/shapes';

// import { addShape } from '../modifiers/addShape';
// // import flat from 'flat';


// export default function persistShape(shape) {
//   const REDIS_CONFIG = Meteor.settings.private.redis;
//   const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
//   const EVENT_NAME = 'PersistShapePubMsg';
//   console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
//   console.log('$$$$$$$$$$$$  PersistShapePubMsg  $$$$$$$$$$$$$$')
//   console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
//   console.log(JSON.stringify(shape))
//   console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
//   try {
//     const { meetingId, requesterUserId } = extractCredentials(this.userId);
//     shape.meetingId = meetingId;
//     const payload = {
//         meetingId,
//         shape,
//     };
//     addShape(shape);

//     return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
//   } catch (err) {
//     Logger.error(`Exception while invoking method clearWhiteboard ${err.stack}`);
//   }
// }

import RedisPubSub from '/imports/startup/server/redis';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';
import Shapes from '/imports/api/shapes';

import addShape from '../modifiers/addShape';
// import flat from 'flat';


export default function persistShape(shape) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'PersistShapePubMsg';
  console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
  console.log('$$$$$$$$$$$$  PersistShapePubMsg  $$$$$$$$$$$$$$')
  console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
  console.log(JSON.stringify(shape))
  console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);
    shape.meetingId = meetingId;
    const payload = {
        meetingId,
        shape,
    };
    addShape(meetingId, shape);

    return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method clearWhiteboard ${err.stack}`);
  }
}