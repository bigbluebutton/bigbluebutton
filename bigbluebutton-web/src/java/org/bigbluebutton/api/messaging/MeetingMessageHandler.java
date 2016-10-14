package org.bigbluebutton.api.messaging;

import java.util.Set;

import org.bigbluebutton.api.messaging.messages.CreateBreakoutRoom;
import org.bigbluebutton.api.messaging.messages.EndBreakoutRoom;
import org.bigbluebutton.api.messaging.messages.IMessage;
import org.bigbluebutton.api.messaging.messages.KeepAliveReply;
import org.bigbluebutton.api.messaging.messages.MeetingDestroyed;
import org.bigbluebutton.api.messaging.messages.MeetingEnded;
import org.bigbluebutton.api.messaging.messages.MeetingStarted;
import org.bigbluebutton.api.messaging.messages.UserJoined;
import org.bigbluebutton.api.messaging.messages.UserJoinedVoice;
import org.bigbluebutton.api.messaging.messages.UserLeft;
import org.bigbluebutton.api.messaging.messages.UserLeftVoice;
import org.bigbluebutton.api.messaging.messages.UserListeningOnly;
import org.bigbluebutton.api.messaging.messages.UserSharedWebcam;
import org.bigbluebutton.api.messaging.messages.UserStatusChanged;
import org.bigbluebutton.api.messaging.messages.UserUnsharedWebcam;
import org.bigbluebutton.api.messaging.messages.*;
import org.bigbluebutton.common.converters.FromJsonDecoder;
import org.bigbluebutton.common.messages.IBigBlueButtonMessage;
import org.bigbluebutton.common.messages.PubSubPongMessage;
import org.bigbluebutton.messages.CreateBreakoutRoomRequest;
import org.bigbluebutton.messages.EndBreakoutRoomRequest;
import org.bigbluebutton.common.messages.SendStunTurnInfoRequestMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class MeetingMessageHandler implements MessageHandler {
  private static Logger log = LoggerFactory.getLogger(MeetingMessageHandler.class);

  private Set<MessageListener> listeners;
  private final FromJsonDecoder decoder = new FromJsonDecoder();
  
  public void setMessageListeners(Set<MessageListener> listeners) {
    this.listeners = listeners;
  }
  
  public void handleMessage(String pattern, String channel, String message) {	
    JsonParser parser = new JsonParser();
    JsonObject obj = (JsonObject) parser.parse(message);

    if (channel.equalsIgnoreCase(MessagingConstants.FROM_MEETING_CHANNEL)) {
      if (obj.has("header") && obj.has("payload")) {
        JsonObject header = (JsonObject) obj.get("header");
        JsonObject payload = (JsonObject) obj.get("payload");

        if (header.has("name")) {
          String messageName = header.get("name").getAsString();
          if(MessagingConstants.MEETING_STARTED_EVENT.equalsIgnoreCase(messageName)) {
            String meetingId = payload.get("meeting_id").getAsString();
            for (MessageListener listener : listeners) {
              listener.handle(new MeetingStarted(meetingId));
            }
          } else if(MessagingConstants.MEETING_ENDED_EVENT.equalsIgnoreCase(messageName)) {
            String meetingId = payload.get("meeting_id").getAsString();
            for (MessageListener listener : listeners) {
              listener.handle(new MeetingEnded(meetingId));
            }
          } else if (MessagingConstants.MEETING_DESTROYED_EVENT.equalsIgnoreCase(messageName)) {
            String meetingId = payload.get("meeting_id").getAsString();
            log.info("Received a meeting destroyed message for meeting id=[{}]", meetingId);
            for (MessageListener listener : listeners) {
              listener.handle(new MeetingDestroyed(meetingId));
            }
          } else if (CreateBreakoutRoomRequest.NAME.equals(messageName)) {
            CreateBreakoutRoomRequest msg = new Gson().fromJson(message, CreateBreakoutRoomRequest.class);
            for (MessageListener listener : listeners) {
              listener.handle(new CreateBreakoutRoom(
                  msg.payload.breakoutMeetingId,
                  msg.payload.parentMeetingId,
                  msg.payload.name,
                  msg.payload.sequence,
                  msg.payload.voiceConfId,
                  msg.payload.viewerPassword,
                  msg.payload.moderatorPassword,
                  msg.payload.durationInMinutes,
                  msg.payload.sourcePresentationId,
                  msg.payload.sourcePresentationSlide,
                  msg.payload.record
                  )
              );
            }
          }
          else if (EndBreakoutRoomRequest.NAME.equals(messageName)) {
            EndBreakoutRoomRequest msg = new Gson().fromJson(message, EndBreakoutRoomRequest.class);
            log.info("Received end breakout room request message for breakout meeting id=[{}]", msg.payload.meetingId);
            for (MessageListener listener : listeners) {
              listener.handle(new EndBreakoutRoom(msg.payload.meetingId));
            }
          }
        }
      }
    } else if (channel.equalsIgnoreCase(MessagingConstants.FROM_SYSTEM_CHANNEL)) {
      if (obj.has("header") && obj.has("payload")) {
        JsonObject header = (JsonObject) obj.get("header");
        JsonObject payload = (JsonObject) obj.get("payload");
        if (header.has("name")) {
          String messageName = header.get("name").getAsString();
          IMessage rxMsg = null;
          if (PubSubPongMessage.PUBSUB_PONG.equals(messageName)) {
            IBigBlueButtonMessage msg = decoder.decodeMessage(message);
            if (msg != null) {
              PubSubPongMessage m = (PubSubPongMessage) msg;
              rxMsg = new KeepAliveReply(m.payload.system, m.payload.timestamp);
            }
          }
          if (rxMsg != null) {
            for (MessageListener listener : listeners) {
              listener.handle(rxMsg);
            } 
          }
        }
      }
    } else if (channel.equalsIgnoreCase(MessagingConstants.FROM_USERS_CHANNEL)) {	
      if (obj.has("header") && obj.has("payload")) {
        JsonObject header = (JsonObject) obj.get("header");
        JsonObject payload = (JsonObject) obj.get("payload");
        if (header.has("name")) {
          String messageName = header.get("name").getAsString();
          if (MessagingConstants.USER_JOINED_EVENT.equalsIgnoreCase(messageName)) {
            String meetingId = payload.get("meeting_id").getAsString();
            JsonObject user = (JsonObject) payload.get("user");
            String userid = user.get("userid").getAsString();
            String externuserid = user.get("extern_userid").getAsString();
            String username = user.get("name").getAsString();
            String role = user.get("role").getAsString();
            String avatarURL = user.get("avatarURL").getAsString();
            for (MessageListener listener : listeners) {
              listener.handle(new UserJoined(meetingId, userid, externuserid, username, role, avatarURL));
            }
          } else if(MessagingConstants.USER_STATUS_CHANGE_EVENT.equalsIgnoreCase(messageName)) {
            String meetingId = payload.get("meeting_id").getAsString();
            String userid = payload.get("userid").getAsString();
            String status = payload.get("status").getAsString();
            String value = payload.get("value").getAsString();
            for (MessageListener listener : listeners) {
              listener.handle(new UserStatusChanged(meetingId, userid, status, value));
            }
          } else if (MessagingConstants.USER_LEFT_EVENT.equalsIgnoreCase(messageName)) {
            String meetingId = payload.get("meeting_id").getAsString();
            JsonObject user = (JsonObject) payload.get("user");
            String userid = user.get("userid").getAsString();
            for (MessageListener listener : listeners) {
              listener.handle(new UserLeft(meetingId, userid));
            }
          } else if (MessagingConstants.USER_JOINED_VOICE_EVENT.equalsIgnoreCase(messageName)) {
            String meetingId = payload.get("meeting_id").getAsString();
            JsonObject user = (JsonObject) payload.get("user");
            String userid = user.get("userid").getAsString();
            for (MessageListener listener : listeners) {
              listener.handle(new UserJoinedVoice(meetingId, userid));
            }
          } else if (MessagingConstants.USER_LEFT_VOICE_EVENT.equalsIgnoreCase(messageName)) {
            String meetingId = payload.get("meeting_id").getAsString();
            JsonObject user = (JsonObject) payload.get("user");
            String userid = user.get("userid").getAsString();
            for (MessageListener listener : listeners) {
              listener.handle(new UserLeftVoice(meetingId, userid));
            }
          } else if (MessagingConstants.USER_LISTEN_ONLY_EVENT.equalsIgnoreCase(messageName)) {
            String meetingId = payload.get("meeting_id").getAsString();
            String userid = payload.get("userid").getAsString();
            Boolean listenOnly = payload.get("listen_only").getAsBoolean();
            for (MessageListener listener : listeners) {
              listener.handle(new UserListeningOnly(meetingId, userid, listenOnly));
            }
          } else if (MessagingConstants.USER_SHARE_WEBCAM_EVENT.equalsIgnoreCase(messageName)) {
            String meetingId = payload.get("meeting_id").getAsString();
            String userid = payload.get("userid").getAsString();
            String stream = payload.get("stream").getAsString();
            for (MessageListener listener : listeners) {
              listener.handle(new UserSharedWebcam(meetingId, userid, stream));
            }
          } else if (MessagingConstants.USER_UNSHARE_WEBCAM_EVENT.equalsIgnoreCase(messageName)) {
            String meetingId = payload.get("meeting_id").getAsString();
            String userid = payload.get("userid").getAsString();
            String stream = payload.get("stream").getAsString();
            for (MessageListener listener : listeners) {
              listener.handle(new UserUnsharedWebcam(meetingId, userid, stream));
            }
          } else if (SendStunTurnInfoRequestMessage.SEND_STUN_TURN_INFO_REQUEST_MESSAGE.equalsIgnoreCase(messageName)) {
            String meetingId = payload.get(Constants.MEETING_ID).getAsString();
            String requesterId = payload.get(Constants.REQUESTER_ID).getAsString();
            for (MessageListener listener : listeners) {
              listener.handle(new StunTurnInfoRequested(meetingId, requesterId));
            }
          }
        }
      }
    } 
  }
}
