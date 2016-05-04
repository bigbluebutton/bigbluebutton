import '/imports/startup/server/index';
import { redisPubSub } from '/imports/startup/server/index';
import '/server/logger';

console.log("in server I check if I can publish", redisPubSub.constructor());
