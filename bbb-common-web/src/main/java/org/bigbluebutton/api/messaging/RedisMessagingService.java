/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * <p>
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 * <p>
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * <p>
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * <p>
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 */

package org.bigbluebutton.api.messaging;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.bigbluebutton.api.messaging.converters.messages.DeleteRecordingMessage;
import org.bigbluebutton.api.messaging.converters.messages.DestroyMeetingMessage;
import org.bigbluebutton.api.messaging.converters.messages.EndMeetingMessage;
import org.bigbluebutton.api.messaging.converters.messages.PublishRecordingMessage;
import org.bigbluebutton.api.messaging.converters.messages.UnpublishRecordingMessage;
import org.bigbluebutton.api2.IBbbWebApiGWApp;
import org.bigbluebutton.common.converters.ToJsonEncoder;
import org.bigbluebutton.common.messages.Constants;
import org.bigbluebutton.common.messages.MessagingConstants;
import org.bigbluebutton.common.messages.SendStunTurnInfoReplyMessage;
import org.bigbluebutton.messages.CreateMeetingRequest;
import org.bigbluebutton.messages.CreateMeetingRequestPayload;
import org.bigbluebutton.messages.RegisterUserMessage;
import org.bigbluebutton.messages.RegisterUserMessagePayload;
import org.bigbluebutton.presentation.messages.IDocConversionMsg;
import org.bigbluebutton.web.services.turn.StunServer;
import org.bigbluebutton.web.services.turn.TurnEntry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;

public class RedisMessagingService  {
  private static Logger log = LoggerFactory.getLogger(RedisMessagingService.class);


  public void destroyMeeting(String meetingID) {
    DestroyMeetingMessage msg = new DestroyMeetingMessage(meetingID);

  }

  public void registerUser(String meetingID, String internalUserId, String fullname, String role,
                           String externUserID, String authToken, String avatarURL, Boolean guest, Boolean authed) {
    RegisterUserMessagePayload payload = new RegisterUserMessagePayload(meetingID, internalUserId, fullname, role, externUserID,
      authToken, avatarURL, guest, authed);
    RegisterUserMessage msg = new RegisterUserMessage(payload);

    Gson gson = new Gson();
    String json = gson.toJson(msg);
    log.info("*****Sending register user message to bbb-apps:[{}]", json);

  }

  public void createMeeting(String meetingID, String externalMeetingID,
                            String parentMeetingID, String meetingName, Boolean recorded,
                            String voiceBridge, Integer duration, Boolean autoStartRecording,
                            Boolean allowStartStopRecording, Boolean webcamsOnlyForModerator,
                            String moderatorPass, String viewerPass, Long createTime,
                            String createDate, Boolean isBreakout, Integer sequence, Map<String, String> metadata,
                            String guestPolicy) {
    CreateMeetingRequestPayload payload = new CreateMeetingRequestPayload(
      meetingID, externalMeetingID, parentMeetingID, meetingName,
      recorded, voiceBridge, duration, autoStartRecording,
      allowStartStopRecording, webcamsOnlyForModerator,
      moderatorPass, viewerPass, createTime, createDate, isBreakout,
      sequence, metadata, guestPolicy);
    CreateMeetingRequest msg = new CreateMeetingRequest(payload);

    Gson gson = new Gson();
    String json = gson.toJson(msg);
    log.info("Sending create meeting message to bbb-apps:[{}]", json);

  }

  public void endMeeting(String meetingId) {
    EndMeetingMessage msg = new EndMeetingMessage(meetingId);
    String json = MessageToJson.endMeetingMessageToJson(msg);
    log.info("Sending end meeting message to bbb-apps:[{}]", json);

  }

  public void sendKeepAlive(String system, Long timestamp) {

  }

  public void send(String channel, String message) {

  }

  public void sendPolls(String meetingId, String title, String question, String questionType, List<String> answers) {
    Gson gson = new Gson();

    HashMap<String, Object> map = new HashMap<String, Object>();
    map.put("messageId", MessagingConstants.SEND_POLLS_EVENT);
    map.put("meetingId", meetingId);
    map.put("title", title);
    map.put("question", question);
    map.put("questionType", questionType);
    map.put("answers", answers);


  }


  public void publishRecording(PublishRecordingMessage msg) {

    String json = MessageToJson.publishRecordingMessageToJson(msg);

  }

  public void unpublishRecording(UnpublishRecordingMessage msg) {

    String json = MessageToJson.unpublishRecordingMessageToJson(msg);

  }

  public void publishRecording(String recordId, String meetingId, String externalMeetingId, String format, boolean publish) {
    if (publish) {
      PublishRecordingMessage msg = new PublishRecordingMessage(recordId, meetingId, externalMeetingId, format);
      publishRecording(msg);
    } else {
      UnpublishRecordingMessage msg = new UnpublishRecordingMessage(recordId, meetingId, externalMeetingId, format);
      unpublishRecording(msg);
    }
  }

  public void deleteRecording(String recordId, String meetingId, String externalMeetingId, String format) {
    DeleteRecordingMessage msg = new DeleteRecordingMessage(recordId, meetingId, externalMeetingId, format);
    String json = MessageToJson.deleteRecordingMessageToJson(msg);

  }

  public void sendStunTurnInfo(String meetingId, String internalUserId, Set<StunServer> stuns, Set<TurnEntry> turns) {



  }

  public void sendDocConversionMsg(IDocConversionMsg msg) {

  }
}
