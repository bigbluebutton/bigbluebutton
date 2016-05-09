import { isAllowedTo } from '/imports/startup/server/userPermissions';
import { requestUserLeaving } from '/imports/api/users/server/usersManager';
import { Users, Shapes, Meetings, Presentations, Slides, Chat,
  WhiteboardCleanStatus, Polls, Cursor } from '/imports/startup/collections';
import { logger } from '/imports/startup/server/logger';

// Publish only the online users that are in the particular meetingId
// On the client side we pass the meetingId parameter
/*Meteor.publish('bbb_users', function (meetingId, userid, authToken) {
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

Meteor.publish('bbb_users', function (meetingId, userid, authToken) {
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


Meteor.publish('chat', function (meetingId, userid, authToken) {
  if (isAllowedTo('subscribeChat', meetingId, userid, authToken)) {
    logger.info(`publishing chat for ${meetingId} ${userid} ${authToken}`);
    return Chat.find({
      $or: [
        {
          'message.chat_type': 'PUBLIC_CHAT',
          meetingId: meetingId,
        }, {
          'message.from_userid': userid,
          meetingId: meetingId,
        }, {
          'message.to_userid': userid,
          meetingId: meetingId,
        },
      ],
    });
  } else {
    this.error(new Meteor.Error(402, "The user was not authorized to subscribe for 'chats'"));
  }
});

Meteor.publish('bbb_poll', function (meetingId, userid, authToken) {
  //checking if it is allowed to see Poll Collection in general
  if (isAllowedTo('subscribePoll', meetingId, userid, authToken)) {
    //checking if it is allowed to see a number of votes (presenter only)
    if (isAllowedTo('subscribeAnswers', meetingId, userid, authToken)) {
      logger.info('publishing Poll for presenter: ' + meetingId + ' ' + userid + ' ' + authToken);
      return Polls.find({
        'poll_info.meetingId': meetingId,
        'poll_info.users': userid,
      });
    } else {
      logger.info('publishing Poll for viewer: ' + meetingId + ' ' + userid + ' ' + authToken);
      return Polls.find({
        'poll_info.meetingId': meetingId,
        'poll_info.users': userid,
      }, {
        fields: {
          'poll_info.poll.answers.num_votes': 0,
        },
      });
    }
  } else {
    this.error(new Meteor.Error(402, "The user was not authorized to subscribe for 'bbb_poll'"));
  }
});

Meteor.publish('shapes', function (meetingId) {
  return Shapes.find({
    meetingId: meetingId,
  });
});

Meteor.publish('slides', function (meetingId) {
  logger.info(`publishing slides for ${meetingId}`);
  return Slides.find({
    meetingId: meetingId,
  });
});

Meteor.publish('meetings', function (meetingId) {
  logger.info(`publishing meetings for ${meetingId}`);
  return Meetings.find({
    meetingId: meetingId,
  });
});

Meteor.publish('presentations', function (meetingId) {
  logger.info(`publishing presentations for ${meetingId}`);
  return Presentations.find({
    meetingId: meetingId,
  });
});

Meteor.publish('bbb_cursor', function (meetingId) {
  logger.info(`publishing cursor for ${meetingId}`);
  return Cursor.find({
    meetingId: meetingId,
  });
});

Meteor.publish('whiteboard-clean-status', function (meetingId) {
  logger.info(`whiteboard clean status ${meetingId}`);
  return WhiteboardCleanStatus.find({
    meetingId: meetingId,
  });
});
