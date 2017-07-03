package org.bigbluebutton.api.messaging;

import java.util.Set;

import org.bigbluebutton.api.messaging.messages.CreateBreakoutRoom;
import org.bigbluebutton.api.messaging.messages.EndBreakoutRoom;
import org.bigbluebutton.api.messaging.messages.IMessage;
import org.bigbluebutton.api.messaging.messages.KeepAliveReply;
import org.bigbluebutton.api.messaging.messages.MeetingDestroyed;
import org.bigbluebutton.api.messaging.messages.MeetingEnded;
import org.bigbluebutton.api.messaging.messages.MeetingStarted;
import org.bigbluebutton.api.messaging.messages.StunTurnInfoRequested;
import org.bigbluebutton.api.messaging.messages.UserJoined;
import org.bigbluebutton.api.messaging.messages.UserJoinedVoice;
import org.bigbluebutton.api.messaging.messages.UserLeft;
import org.bigbluebutton.api.messaging.messages.UserLeftVoice;
import org.bigbluebutton.api.messaging.messages.UserListeningOnly;
import org.bigbluebutton.api.messaging.messages.UserRoleChanged;
import org.bigbluebutton.api.messaging.messages.UserSharedWebcam;
import org.bigbluebutton.api.messaging.messages.UserStatusChanged;
import org.bigbluebutton.api.messaging.messages.UserUnsharedWebcam;
import org.bigbluebutton.common.converters.FromJsonDecoder;
import org.bigbluebutton.common.messages.IBigBlueButtonMessage;
import org.bigbluebutton.common.messages.PubSubPongMessage;
import org.bigbluebutton.common.messages.SendStunTurnInfoRequestMessage;
import org.bigbluebutton.messages.CreateBreakoutRoomRequest;
import org.bigbluebutton.messages.EndBreakoutRoomRequest;
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
  
  public void handleMessage(IMessage message) {
    /*
    for (MessageListener listener : listeners) {
      listener.handle(new MeetingStarted(meetingId));
    }
    for (MessageListener listener : listeners) {
      listener.handle(new MeetingEnded(meetingId));
    }
    for (MessageListener listener : listeners) {
      listener.handle(new MeetingDestroyed(meetingId));
    }
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
    for (MessageListener listener : listeners) {
      listener.handle(new EndBreakoutRoom(msg.payload.meetingId));
    }
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
    for (MessageListener listener : listeners) {
      listener.handle(new UserJoined(meetingId, userid, externuserid, username, role, avatarURL, guest, waitingForAcceptance));
    }
    for (MessageListener listener : listeners) {
      listener.handle(new UserStatusChanged(meetingId, userid, status, value));
    }
    for (MessageListener listener : listeners) {
      listener.handle(new UserLeft(meetingId, userid));
    }
    for (MessageListener listener : listeners) {
      listener.handle(new UserJoinedVoice(meetingId, userid));
    }
    for (MessageListener listener : listeners) {
      listener.handle(new UserLeftVoice(meetingId, userid));
    }
    for (MessageListener listener : listeners) {
      listener.handle(new UserListeningOnly(meetingId, userid, listenOnly));
    }
    for (MessageListener listener : listeners) {
      listener.handle(new UserSharedWebcam(meetingId, userid, stream));
    }
    for (MessageListener listener : listeners) {
      listener.handle(new UserUnsharedWebcam(meetingId, userid, stream));
    }
    for (MessageListener listener : listeners) {
      listener.handle(new UserRoleChanged(meetingId, userid, role));
    }
    for (MessageListener listener : listeners) {
      listener.handle(new StunTurnInfoRequested(meetingId, requesterId));
    }
*/

  }
}
