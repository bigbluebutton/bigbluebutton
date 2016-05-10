import { Users } from '../usersCollection';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import { logger } from '/imports/startup/server/logger';

// Publish only the online users that are in the particular meetingId
// On the client side we pass the meetingId parameter
/*Meteor.publish('users', function (meetingId, userid, authToken) {
 let user, userObject, username;
 logger.info(`attempt publishing users for ${meetingId}, ${userid}, ${authToken}`);
 userObject = Users.findOne({
 userId: userid,
 meetingId: meetingId,
 });
 if (userObject != null) {
 logger.info('found it from the first time ' + userid);
 if (isAllowedTo('subscribeUsers', meetingId, userid, authToken)) {
 logger.info(`${userid} was allowed to subscribe to 'users'`);
 user = userObject.user;
 if (user != null) {
 username = user.name;

 // offline -> online
 if (user.connection_status !== 'online') {
 Meteor.call('validateAuthToken', meetingId, userid, authToken);
 }
 } else {
 username = 'UNKNOWN';
 }

 Users.update({
 meetingId: meetingId,
 userId: userid,
 }, {
 $set: {
 'user.connection_status': 'online',
 },
 });
 logger.info(`username of the subscriber: ${username}, connection_status becomes online`);
 this._session.socket.on('close', Meteor.bindEnvironment((function (_this) {
 return function () {
 logger.info(`a user lost connection: session.id=${_this._session.id} userId = ${userid}, username=${username}, meeting=${meetingId}`);
 Users.update({
 meetingId: meetingId,
 userId: userid,
 }, {
 $set: {
 'user.connection_status': 'offline',
 },
 });
 logger.info(`username of the user losing connection: ${username}, connection_status: becomes offline`);
 return requestUserLeaving(meetingId, userid);
 };
 })(this)));

 //publish the users which are not offline
 return Users.find({
 meetingId: meetingId,
 'user.connection_status': {
 $in: ['online', ''],
 },
 }, {
 fields: {
 authToken: false,
 },
 });
 } else {
 logger.warn("was not authorized to subscribe to 'users'");
 return this.error(new Meteor.Error(402, "The user was not authorized to subscribe to 'users'"));
 }
 } else { //subscribing before the user was added to the collection
 Meteor.call('validateAuthToken', meetingId, userid, authToken);
 logger.error(`there was no such user ${userid} in ${meetingId}`);
 return Users.find({
 meetingId: meetingId,
 'user.connection_status': {
 $in: ['online', ''],
 },
 }, {
 fields: {
 authToken: false,
 },
 });
 }
 });
 */

Meteor.publish('users', function (meetingId, userid, authToken) {
  if (isAllowedTo('subscribeUsers', meetingId, userid, authToken)) {
    return Users.find({
      meetingId: meetingId,
      'user.connection_status': {
        $in: ['online', ''],
      },
    }, {
      fields: {
        authToken: false,
      },
    });
  }
});
