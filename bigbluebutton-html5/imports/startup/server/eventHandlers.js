import { addChatToCollection } from '/imports/api/chat/server/modifiers/addChatToCollection';
import { updateCursorLocation } from '/imports/api/cursor/server/modifiers/updateCursorLocation';
import { handleLockingMic } from '/imports/api/users/server/modifiers/handleLockingMic';
import { userJoined } from '/imports/api/users/server/modifiers/userJoined';
import { updateVoiceUser } from '/imports/api/users/server/modifiers/updateVoiceUser';
import { addSlideToCollection } from '/imports/api/slides/server/modifiers/addSlideToCollection';
import { displayThisSlide } from '/imports/api/slides/server/modifiers/displayThisSlide';
import { addShapeToCollection } from '/imports/api/shapes/server/modifiers/addShapeToCollection';
import { removeAllShapesFromSlide } from '/imports/api/shapes/server/modifiers/removeAllShapesFromSlide';
import { removeShapeFromSlide } from '/imports/api/shapes/server/modifiers/removeShapeFromSlide';
import { addPresentationToCollection, } from '/imports/api/presentations/server/modifiers/addPresentationToCollection';
import { removePresentationFromCollection } from '/imports/api/presentations/server/modifiers/removePresentationFromCollection';
import { addPollToCollection } from '/imports/api/polls/server/modifiers/addPollToCollection';
import { updatePollCollection } from '/imports/api/polls/server/modifiers/updatePollCollection';
import { addMeetingToCollection} from '/imports/api/meetings/server/modifiers/addMeetingToCollection';

import { logger } from '/imports/startup/server/logger';
import { redisConfig } from '/config';
import { eventEmitter } from '/imports/startup/server/index';
import { publish, handleChatEvent, handleEndOfMeeting, handleLockEvent,
  handleRemoveUserEvent, handleVoiceEvent} from '/imports/startup/server/helpers';

import Meetings from '/imports/api/meetings/collection';
import Presentations from '/imports/api/presentations/collection';
import Users from '/imports/api/users/collection';
import Slides from '/imports/api/slides/collection';

// To ensure that we process the redis json event messages serially we use a
// callback. This callback is to be called when the Meteor collection is
// updated with the information coming in the payload of the json message. The
// callback signalizes to the queue that we are done processing the current
// message in the queue and are ready to move on to the next one. If we do not
// use the callback mechanism we may encounter a race condition situation
// due to not following the order of events coming through the redis pubsub.
// for example: a user_left event reaching the collection before a user_joined
// for the same user.

eventEmitter.on('get_users_reply', function (arg) {
  if (arg.payload.requester_id === 'nodeJSapp') {
    console.log('get_users_reply handling');
    let users = arg.payload.users;
    const meetingId = arg.payload.meeting_id;

    //TODO make the serialization be split per meeting. This will allow us to
    // use N threads vs 1 and we'll take advantage of Mongo's concurrency tricks

    // Processing the users recursively with a callback to notify us,
    // ensuring that we update the users collection serially
    let processUser = function () {
      let user = users.pop();
      if (user != null) {
        user.timeOfJoining = arg.header.current_time;
        if (user.emoji_status !== 'none' && typeof user.emoji_status === 'string') {
          user.set_emoji_time = new Date();
          return userJoined(meetingId, user, processUser);
        } else {
          return userJoined(meetingId, user, processUser);
        }
      } else {
        return arg.callback(); // all meeting arrays (if any) have been processed
      }
    };

    return processUser();
  } else {
    arg.callback();
  }
});

eventEmitter.on('meeting_created_message', function (arg) {
  meetingName = arg.payload.name;
  intendedForRecording = arg.payload.recorded;
  voiceConf = arg.payload.voice_conf;
  duration = arg.payload.duration;
  meetingId = arg.payload.meeting_id;
  return addMeetingToCollection(meetingId, meetingName, intendedForRecording,
    voiceConf, duration, arg.callback);
});

eventEmitter.on('get_all_meetings_reply', function (arg) {
  logger.info('Let\'s store some data for the running meetings so that when an' +
    ' HTML5 client joins everything is ready!');
  logger.info(JSON.stringify(arg.payload));
  let listOfMeetings = arg.payload.meetings;

  // Processing the meetings recursively with a callback to notify us,
  // ensuring that we update the meeting collection serially
  let processMeeting = function () {
    let meeting = listOfMeetings.pop();
    if (meeting != null) {
      return addMeetingToCollection(meeting.meetingID, meeting.meetingName,
        meeting.recorded, meeting.voiceBridge, meeting.duration, processMeeting);
    } else {
      return arg.callback(); // all meeting arrays (if any) have been processed
    }
  };

  return processMeeting();
});

eventEmitter.on('user_left_voice_message', function (arg) {
  handleVoiceEvent(arg);
});

eventEmitter.on('user_joined_voice_message', function (arg) {
  handleVoiceEvent(arg);
});

eventEmitter.on('user_voice_talking_message', function (arg) {
  handleVoiceEvent(arg);
});

eventEmitter.on('user_voice_muted_message', function (arg) {
  handleVoiceEvent(arg);
});

eventEmitter.on('user_listening_only', function (arg) {
  const voiceUserObj = {
    web_userid: arg.payload.userid,
    listen_only: arg.payload.listen_only,
  };
  const meetingId = arg.payload.meeting_id;
  return updateVoiceUser(meetingId, voiceUserObj, arg.callback);
});

eventEmitter.on('user_left_message', function (arg) {
  handleRemoveUserEvent(arg);
});

eventEmitter.on('validate_auth_token_reply', function (arg) {
  const meetingId = arg.payload.meeting_id;
  const userId = arg.payload.userid;
  const user = Users.findOne({
    userId: userId,
    meetingId: meetingId,
  });
  let validStatus = arg.payload.valid;

  // if the user already exists in the db
  if (user != null && user.clientType === 'HTML5') {
    //if the html5 client user was validated successfully, add a flag
    return Users.update({
      userId: userId,
      meetingId: meetingId,
    }, {
      $set: {
        validated: validStatus,
      },
    }, (err, numChanged) => {
      if (numChanged.insertedId != null) {
        let funct = function (cbk) {
          let user = Users.findOne({
            userId: userId,
            meetingId: meetingId,
          });
          let val;
          if (user != null) {
            val = user.validated;
          }

          logger.info(`user.validated for ${userId} in meeting ${meetingId} just became ${val}`);
          return cbk();
        };

        return funct(arg.callback);
      } else {
        return arg.callback();
      }
    });
  } else {
    logger.info('a non-html5 user got validate_auth_token_reply.');
    return arg.callback();
  }
});

eventEmitter.on('user_joined_message', function (arg) {
  const meetingId = arg.payload.meeting_id;
  const payload = arg.payload;
  let userObj = payload.user;
  let dbUser = Users.findOne({
    userId: userObj.userid,
    meetingId: meetingId,
  });

  // On attempting reconnection of Flash clients (in voiceBridge) we receive
  // an extra user_joined_message. Ignore it as it will add an extra user
  // in the user list, creating discrepancy with the list in the Flash client
  if (dbUser != null && dbUser.user != null && dbUser.user.connection_status === 'offline') {
    if (payload.user != null && payload.user.phone_user) {
      logger.error('offline AND phone user');
      return arg.callback(); //return without joining the user
    }
  } else {
    if (dbUser != null && dbUser.clientType === 'HTML5') {
      // typically html5 users will be in
      // the db [as a dummy user] before the joining message
      let status = dbUser.validated;
      logger.info(`in user_joined_message the validStatus of the user was ${status}`);
      userObj.timeOfJoining = arg.header.current_time;
      return userJoined(meetingId, userObj, arg.callback);
    } else {
      return userJoined(meetingId, userObj, arg.callback);
    }
  }

  return arg.callback();
});

// for now not handling these serially #TODO
eventEmitter.on('presenter_assigned_message', function (arg) {
  const meetingId = arg.payload.meeting_id;
  const newPresenterId = arg.payload.new_presenter_id;
  if (newPresenterId != null) {
    // reset the previous presenter
    Users.update({
      'user.presenter': true,
      meetingId: meetingId,
    }, {
      $set: {
        'user.presenter': false,
      },
    }, (err, numUpdated) => {
      return logger.info(` Updating old presenter numUpdated=${numUpdated}, err=${err}`);
    });

    // set the new presenter
    Users.update({
      'user.userid': newPresenterId,
      meetingId: meetingId,
    }, {
      $set: {
        'user.presenter': true,
      },
    }, (err, numUpdated) => {
      return logger.info(` Updating new presenter numUpdated=${numUpdated}, err=${err}`);
    });
  }

  return arg.callback();
});

eventEmitter.on('user_emoji_status_message', function (arg) {
  const userId = arg.payload.userid;
  const meetingId = arg.payload.meeting_id;
  const emojiStatus = arg.payload.emoji_status;
  if (userId != null && meetingId != null) {
    let set_emoji_time;
    set_emoji_time = new Date();
    Users.update({
      'user.userid': userId,
    }, {
      $set: {
        'user.set_emoji_time': set_emoji_time,
        'user.emoji_status': emojiStatus,
      },
    }, (err, numUpdated) => {
      return logger.info(` Updating emoji numUpdated=${numUpdated}, err=${err}`);
    });
  }

  return arg.callback();
});

eventEmitter.on('user_locked_message', function (arg) {
  handleLockEvent(arg);
});

eventEmitter.on('user_unlocked_message', function (arg) {
  handleLockEvent(arg);
});

eventEmitter.on('meeting_ended_message', function (arg) {
  handleEndOfMeeting(arg);
});

eventEmitter.on('meeting_destroyed_event', function (arg) {
  handleEndOfMeeting(arg);
});

eventEmitter.on('end_and_kick_all_message', function (arg) {
  handleEndOfMeeting(arg);
});

eventEmitter.on('disconnect_all_users_message', function (arg) {
  handleEndOfMeeting(arg);
});

eventEmitter.on('get_chat_history_reply', function (arg) {
  if (arg.payload.requester_id === 'nodeJSapp') { //TODO extract this check
    const meetingId = arg.payload.meeting_id;
    if (Meetings.findOne({
        meetingId: meetingId,
      }) == null) {
      const chatHistory = arg.payload.chat_history;
      const _chat_history_length = chatHistory.length;
      for (i = 0; i < _chat_history_length; i++) {
        const chatMessage = chatHistory[i];
        addChatToCollection(meetingId, chatMessage);
      }
    }
  }

  return arg.callback();
});

eventEmitter.on('send_public_chat_message', function (arg) {
  handleChatEvent(arg);
});

eventEmitter.on('send_private_chat_message', function (arg) {
  handleChatEvent(arg);
});

eventEmitter.on('presentation_shared_message', function (arg) {
  const payload = arg.payload;
  const meetingId = payload.meeting_id;
  if (payload.presentation != null && payload.presentation.id != null && meetingId != null) {
    const presentationId = payload.presentation.id;

    // change the currently displayed presentation to presentation.current = false
    Presentations.update({
      'presentation.current': true,
      meetingId: meetingId,
    }, {
      $set: {
        'presentation.current': false,
      },
    });

    //update(if already present) entirely the presentation with the fresh data
    removePresentationFromCollection(meetingId, presentationId);
    addPresentationToCollection(meetingId, payload.presentation);
    const pages = payload.presentation.pages;
    for (j = 0; j < pages.length; j++) {
      const slide = pages[j];
      addSlideToCollection(
        meetingId,
        presentationId,
        slide
      );
    }
  }

  return arg.callback();
});

eventEmitter.on('get_presentation_info_reply', function (arg) {
  if (arg.payload.requester_id === 'nodeJSapp') {
    let presentations, payload, k, presentation, pages, page, l,
      meetingId, whiteboardId, replyTo, message;
    payload = arg.payload;
    meetingId = payload.meeting_id;
    presentations = payload.presentations;
    for (k = 0; k < payload.presentations.length; k++) {
      presentation = presentations[k];
      addPresentationToCollection(meetingId, presentation);
      pages = presentation.pages;
      for (l = 0; l < pages.length; l++) {
        page = pages[l];

        //add the slide to the collection
        addSlideToCollection(meetingId, presentation.id, page);

        //request for shapes
        whiteboardId = `${presentation.id}/${page.num}`;

        //logger.info "the whiteboard_id here is:" + whiteboardId

        replyTo = `${meetingId}/nodeJSapp`;
        message = {
          payload: {
            meeting_id: meetingId,
            requester_id: 'nodeJSapp',
            whiteboard_id: whiteboardId,
            reply_to: replyTo,
          },
          header: {
            timestamp: new Date().getTime(),
            name: 'request_whiteboard_annotation_history_request',
          },
        };
        if (whiteboardId != null && meetingId != null) {
          publish(redisConfig.channels.toBBBApps.whiteboard, message);
        } else {
          logger.info('did not have enough information to send a user_leaving_request');
        }
      }
    }

    return arg.callback();
  }
});

eventEmitter.on('presentation_page_changed_message', function (arg) {
  let newSlide, meetingId;
  newSlide = arg.payload.page;
  meetingId = arg.payload.meeting_id;
  if (newSlide != null && newSlide.id != null && meetingId != null) {
    displayThisSlide(meetingId, newSlide.id, newSlide);
  }

  return arg.callback();
});

eventEmitter.on('presentation_removed_message', function (arg) {
  let presentationId, meetingId;
  meetingId = arg.payload.meeting_id;
  presentationId = arg.payload.presentation_id;
  if (meetingId != null && presentationId != null) {
    removePresentationFromCollection(meetingId, presentationId);
  }

  return arg.callback();
});

eventEmitter.on('get_whiteboard_shapes_reply', function (arg) {
  if (arg.payload.requester_id === 'nodeJSapp') {
    const meetingId = arg.payload.meeting_id;
    const shapes = arg.payload.shapes;
    const shapes_length = shapes.length;
    for (let m = 0; m < shapes_length; m++) {
      let shape = shapes[m];
      let whiteboardId = shape.wb_id;
      addShapeToCollection(meetingId, whiteboardId, shape);
    }

    return arg.callback();
  }
});

eventEmitter.on('send_whiteboard_shape_message', function (arg) {
  let payload, shape, whiteboardId, meetingId;
  payload = arg.payload;
  meetingId = payload.meeting_id;

  //Meteor stringifies an array of JSONs (...shape.result) in this message
  //parsing the String and reassigning the value
  if (payload.shape.shape_type === 'poll_result' &&
    typeof payload.shape.shape.result === 'string') {
    payload.shape.shape.result = JSON.parse(payload.shape.shape.result);
  }

  shape = payload.shape;
  if (shape != null && shape.wb_id != null) {
    whiteboardId = shape.wb_id;
  }

  addShapeToCollection(meetingId, whiteboardId, shape);
  return arg.callback();
});

eventEmitter.on('presentation_cursor_updated_message', function (arg) {
  let cursor, meetingId;
  meetingId = arg.payload.meeting_id;
  cursor = {
    x: arg.payload.x_percent,
    y: arg.payload.y_percent,
  };

  // update the location of the cursor on the whiteboard
  updateCursorLocation(meetingId, cursor);
  return arg.callback();
});

eventEmitter.on('whiteboard_cleared_message', function (arg) {
  const meetingId = arg.payload.meeting_id;
  const whiteboardId = arg.payload.whiteboard_id;
  removeAllShapesFromSlide(meetingId, whiteboardId);
  return arg.callback();
});

eventEmitter.on('undo_whiteboard_request', function (arg) {
  let whiteboardId, meetingId, shapeId;
  meetingId = arg.payload.meeting_id;
  whiteboardId = arg.payload.whiteboard_id;
  shapeId = arg.payload.shape_id;
  removeShapeFromSlide(meetingId, whiteboardId, shapeId);
  return arg.callback();
});

eventEmitter.on('user_eject_from_meeting', function (arg) {
  handleRemoveUserEvent(arg);
});

eventEmitter.on('disconnect_user_message', function (arg) {
  handleRemoveUserEvent(arg);
});

eventEmitter.on('presentation_page_resized_message', function (arg) {
  let page, payload;
  payload = arg.payload;
  page = payload.page;
  if (page != null && page.id != null && page.height_ratio != null
    && page.width_ratio != null && page.x_offset != null && page.y_offset != null) {
    let slideId, heightRatio, widthRatio, xOffset, yOffset, presentationId, currentSlide;
    slideId = page.id;
    heightRatio = page.height_ratio;
    widthRatio = page.width_ratio;
    xOffset = page.x_offset;
    yOffset = page.y_offset;
    presentationId = slideId.split('/')[0];

    // In the case when we don't resize, but switch a slide, this message
    // follows a 'presentation_page_changed' and all these properties are already set.
    currentSlide = Slides.findOne(
      { presentationId: presentationId,
        'slide.current': true, });
    if (currentSlide) {
      currentSlide = currentSlide.slide;
    }

    if (currentSlide != null && (currentSlide.height_ratio != heightRatio ||
      currentSlide.width_ratio != widthRatio ||
      currentSlide.x_offset != xOffset ||
      currentSlide.y_offset != yOffset)) {
      Slides.update({
        presentationId: presentationId,
        'slide.current': true,
      }, {
        $set: {
          'slide.height_ratio': heightRatio,
          'slide.width_ratio': widthRatio,
          'slide.x_offset': xOffset,
          'slide.y_offset': yOffset,
        },
      });
    }
  }

  return arg.callback();
});

eventEmitter.on('recording_status_changed_message', function (arg) {
  let intendedForRecording, currentlyBeingRecorded, meetingId;
  intendedForRecording = arg.payload.recorded;
  currentlyBeingRecorded = arg.payload.recording;
  meetingId = arg.payload.meeting_id;

  Meetings.update({
    meetingId: meetingId,
    intendedForRecording: intendedForRecording,
  }, {
    $set: {
      currentlyBeingRecorded: currentlyBeingRecorded,
    },
  });
  return arg.callback();
});

eventEmitter.on('new_permission_settings', function (arg) {
  let meetingObject, meetingId, oldSettings, newSettings, payload;
  meetingId = arg.payload.meeting_id;
  payload = arg.payload;

  meetingObject = Meetings.findOne({
    meetingId: meetingId,
  });
  if (meetingObject != null && payload != null) {
    oldSettings = meetingObject.roomLockSettings;
    newSettings = payload.permissions;

    // if the disableMic setting was turned on
    if (oldSettings != null && !oldSettings.disableMic && newSettings.disableMic) {
      handleLockingMic(meetingId, newSettings);
    }

    // substitute with the new lock settings
    Meetings.update({
      meetingId: meetingId,
    }, {
      $set: {
        'roomLockSettings.disablePrivateChat': newSettings.disablePrivateChat,
        'roomLockSettings.disableCam': newSettings.disableCam,
        'roomLockSettings.disableMic': newSettings.disableMic,
        'roomLockSettings.lockOnJoin': newSettings.lockOnJoin,
        'roomLockSettings.lockedLayout': newSettings.lockedLayout,
        'roomLockSettings.disablePublicChat': newSettings.disablePublicChat,
        'roomLockSettings.lockOnJoinConfigurable': newSettings.lockOnJoinConfigurable,
      },
    });
  }

  return arg.callback();
});

eventEmitter.on('poll_show_result_message', function (arg) {
  let payload, meetingId, poll_id;
  payload = arg.payload;
  meetingId = payload.meeting_id;
  if (payload != null && payload.poll != null && payload.poll.id != null && meetingId != null) {
    poll_id = payload.poll.id;
    clearPollCollection(meetingId, poll_id);
  }

  return arg.callback();
});

eventEmitter.on('poll_started_message', function (arg) {
  let payload, meetingId, users;
  payload = arg.payload;
  meetingId = payload.meeting_id;

  if (payload != null && meetingId != null &&
    payload.requester_id != null && payload.poll != null) {
    if (Meetings.findOne({
        meetingId: meetingId,
      }) != null) {
      users = Users.find({
        meetingId: meetingId,
      }, {
        fields: {
          'user.userid': 1,
          _id: 0,
        },
      }).fetch();
      addPollToCollection(
        payload.poll,
        payload.requester_id,
        users,
        meetingId
      );
    }
  }

  return arg.callback();
});

eventEmitter.on('poll_stopped_message', function (arg) {
  const payload = arg.payload;
  const meetingId = payload.meeting_id;

  if (meetingId != null && payload != null && payload.poll_id != null) {
    const poll_id = payload.poll_id;
    clearPollCollection(meetingId, poll_id);
  }

  return arg.callback();
});

eventEmitter.on('user_voted_poll_message', function (arg) {
  const payload = arg.payload;
  const meetingId = payload.meeting_id;
  if (payload != null && payload.poll != null && meetingId != null &&
    payload.presenter_id != null) {
    const pollObj = payload.poll;
    const requesterId = payload.presenter_id;
    updatePollCollection(pollObj, meetingId, requesterId);
    return arg.callback();
  }
});
