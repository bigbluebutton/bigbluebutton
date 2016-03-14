// Publish only the online users that are in the particular meetingId
// On the client side we pass the meetingId parameter
Meteor.publish('users', function (meetingId, userid, authToken) {
  let user, userObject, username;
  Meteor.log.info(`attempt publishing users for ${meetingId}, ${userid}, ${authToken}`);
  userObject = Meteor.Users.findOne({
    userId: userid,
    meetingId: meetingId,
  });
  if (userObject != null) {
    Meteor.log.info('found it from the first time ' + userid);
    if (isAllowedTo('subscribeUsers', meetingId, userid, authToken)) {
      Meteor.log.info(`${userid} was allowed to subscribe to 'users'`);
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

      Meteor.Users.update({
        meetingId: meetingId,
        userId: userid,
      }, {
        $set: {
          'user.connection_status': 'online',
        },
      });
      Meteor.log.info(`username of the subscriber: ${username}, connection_status becomes online`);
      this._session.socket.on('close', Meteor.bindEnvironment((function (_this) {
        return function () {
          Meteor.log.info(`
a user lost connection: session.id=${_this._session.id} userId = ${userid}, username=${username}, meeting=${meetingId}`);
          Meteor.Users.update({
            meetingId: meetingId,
            userId: userid,
          }, {
            $set: {
              'user.connection_status': 'offline',
            },
          });
          Meteor.log.info(`username of the user losing connection: ${username}, connection_status: becomes offline`);
          return requestUserLeaving(meetingId, userid);
        };
      })(this)));

      //publish the users which are not offline
      return Meteor.Users.find({
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
      Meteor.log.warn("was not authorized to subscribe to 'users'");
      return this.error(new Meteor.Error(402, "The user was not authorized to subscribe to 'users'"));
    }
  } else { //subscribing before the user was added to the collection
    Meteor.call('validateAuthToken', meetingId, userid, authToken);
    Meteor.log.error(`there was no such user ${userid} in ${meetingId}`);
    return Meteor.Users.find({
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
    Meteor.log.info(`publishing chat for ${meetingId} ${userid} ${authToken}`);
    return Meteor.Chat.find({
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
      Meteor.log.info('publishing Poll for presenter: ' + meetingId + ' ' + userid + ' ' + authToken);
      return Meteor.Polls.find({
        'poll_info.meetingId': meetingId,
        'poll_info.users': userid,
      });
    } else {
      Meteor.log.info('publishing Poll for viewer: ' + meetingId + ' ' + userid + ' ' + authToken);
      return Meteor.Polls.find({
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
  return Meteor.Shapes.find({
    meetingId: meetingId,
  });
});

Meteor.publish('slides', function (meetingId) {
  Meteor.log.info(`publishing slides for ${meetingId}`);
  return Meteor.Slides.find({
    meetingId: meetingId,
  });
});

Meteor.publish('meetings', function (meetingId) {
  Meteor.log.info(`publishing meetings for ${meetingId}`);
  return Meteor.Meetings.find({
    meetingId: meetingId,
  });
});

Meteor.publish('presentations', function (meetingId) {
  Meteor.log.info(`publishing presentations for ${meetingId}`);
  return Meteor.Presentations.find({
    meetingId: meetingId,
  });
});

Meteor.publish('bbb_cursor', function (meetingId) {
  Meteor.log.info(`publishing cursor for ${meetingId}`);
  return Meteor.Cursor.find({
    meetingId: meetingId,
  });
});

Meteor.publish('whiteboard-clean-status', function (meetingId) {
  Meteor.log.info(`whiteboard clean status ${meetingId}`);
  return Meteor.WhiteboardCleanStatus.find({
    meetingId: meetingId,
  });
});
