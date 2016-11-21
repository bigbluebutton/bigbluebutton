import Chat from '/imports/api/chat';
import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import { logger } from '/imports/startup/server/logger';
import { BREAK_LINE } from '/imports/utils/lineEndings.js';
import getStun from '/imports/api/phone/server/getStun';

const parseMessage = (message) => {
  message = message || '';

  // Replace \r and \n to <br/>
  message = message.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + BREAK_LINE + '$2');

  // Replace flash links to html valid ones
  message = message.split(`<a href='event:`).join(`<a target="_blank" href='`);
  message = message.split(`<a href="event:`).join(`<a target="_blank" href="`);

  return message;
};

export function userJoined(meetingId, user, callback) {
  const APP_CONFIG = Meteor.settings.public.app;
  let welcomeMessage;
  const userId = user.userid;
  const userObject = Users.findOne({
    userId: user.userid,
    meetingId: meetingId,
  });

  // the collection already contains an entry for this user
  // because the user is reconnecting OR
  // in the case of an html5 client user we added a dummy user on
  // register_user_message (to save authToken)
  if (userObject != null && userObject.authToken != null) {
    getStun({
      meetingId: meetingId,
      requesterUserId: userId,
    });

    Users.update({
      userId: user.userid,
      meetingId: meetingId,
    }, {
      $set: {
        user: {
          userid: user.userid,
          presenter: user.presenter,
          name: user.name,
          _sort_name: user.name.toLowerCase(),
          phone_user: user.phone_user,
          set_emoji_time: user.set_emoji_time,
          emoji_status: user.emoji_status,
          has_stream: user.has_stream,
          role: user.role,
          listenOnly: user.listenOnly,
          extern_userid: user.extern_userid,
          locked: user.locked,
          time_of_joining: user.timeOfJoining,
          connection_status: 'online', // TODO consider other default value
          voiceUser: {
            web_userid: user.voiceUser.web_userid,
            callernum: user.voiceUser.callernum,
            userid: user.voiceUser.userid,
            talking: user.voiceUser.talking,
            joined: user.voiceUser.joined,
            callername: user.voiceUser.callername,
            locked: user.voiceUser.locked,
            muted: user.voiceUser.muted,
          },
          webcam_stream: user.webcam_stream,
        },
      },
    }, err => {
      let funct;
      if (err != null) {
        logger.error(`_error ${err} when trying to insert user ${userId}`);
        return callback();
      } else {
        funct = function (cbk) {
          logger.info(
            `_(case1) UPDATING USER ${user.userid}, ` +
            `authToken= ${userObject.authToken}, ` +
            `locked=${user.locked}, username=${user.name}`
          );
          return cbk();
        };

        return funct(callback);
      }
    });
    const meetingObject = Meetings.findOne({
      meetingId: meetingId,
    });
    if (meetingObject != null) {
      welcomeMessage = APP_CONFIG.defaultWelcomeMessage.replace(/%%CONFNAME%%/,
          meetingObject.meetingName);
    }

    welcomeMessage = welcomeMessage + APP_CONFIG.defaultWelcomeMessageFooter;

    // add the welcome message if it's not there already OR update time_of_joining
    return Chat.upsert({
      meetingId: meetingId,
      userId: userId,
      'message.chat_type': 'SYSTEM_MESSAGE',
      'message.to_userid': userId,
    }, {
      meetingId: meetingId,
      userId: userId,
      message: {
        chat_type: 'SYSTEM_MESSAGE',
        message: parseMessage(welcomeMessage),
        from_color: '0x3399FF',
        to_userid: userId,
        from_userid: 'SYSTEM_MESSAGE',
        from_username: '',
        from_time: (user != null && user.timeOfJoining != null) ? +(user.timeOfJoining) : 0,
      },
    }, err => {
      if (err != null) {
        return logger.error(`_error ${err} when trying to insert welcome message for ${userId}`);
      } else {
        return logger.info(`_added/updated a system message in chat for user ${userId}`);
      }

      // note that we already called callback() when updating the user. Adding
      // the welcome message in the chat is not as vital and we can afford to
      // complete it when possible, without blocking the serial event messages processing
    });
  } else {
    // logger.info "NOTE: got user_joined_message #{user.name} #{user.userid}"
    getStun({
      meetingId: meetingId,
      requesterUserId: userId,
    });

    return Users.upsert({
      meetingId: meetingId,
      userId: userId,
    }, {
      meetingId: meetingId,
      userId: userId,
      user: {
        userid: user.userid,
        presenter: user.presenter,
        name: user.name,
        _sort_name: user.name.toLowerCase(),
        phone_user: user.phone_user,
        emoji_status: user.emoji_status,
        set_emoji_time: user.set_emoji_time,
        has_stream: user.has_stream,
        role: user.role,
        listenOnly: user.listenOnly,
        extern_userid: user.extern_userid,
        locked: user.locked,
        time_of_joining: user.timeOfJoining,
        connection_status: '',
        voiceUser: {
          web_userid: user.voiceUser.web_userid,
          callernum: user.voiceUser.callernum,
          userid: user.voiceUser.userid,
          talking: user.voiceUser.talking,
          joined: user.voiceUser.joined,
          callername: user.voiceUser.callername,
          locked: user.voiceUser.locked,
          muted: user.voiceUser.muted,
        },
        webcam_stream: user.webcam_stream,
      },
    }, (err, numChanged) => {
      let funct;
      if (numChanged.insertedId != null) {
        funct = function (cbk) {
          logger.info(
            `_joining user (case2) userid=[${userId}]:${user.name}. Users.size is now ` +
            `${Users.find({
              meetingId: meetingId,
            }).count()}`
          );
          return cbk();
        };

        return funct(callback);
      } else {
        return callback();
      }
    });
  }
};
