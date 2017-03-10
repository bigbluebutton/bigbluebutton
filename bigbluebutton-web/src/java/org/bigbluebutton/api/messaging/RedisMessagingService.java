/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/

package org.bigbluebutton.api.messaging;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.bigbluebutton.api.messaging.converters.messages.DestroyMeetingMessage;
import org.bigbluebutton.api.messaging.converters.messages.EndMeetingMessage;
import org.bigbluebutton.api.messaging.converters.messages.RegisterUserMessage;
import org.bigbluebutton.api.messaging.converters.messages.PublishRecordingMessage;
import org.bigbluebutton.api.messaging.converters.messages.UnpublishRecordingMessage;
import org.bigbluebutton.api.messaging.converters.messages.DeleteRecordingMessage;
import org.bigbluebutton.common.converters.ToJsonEncoder;
import org.bigbluebutton.common.messages.Constants;
import org.bigbluebutton.common.messages.MessagingConstants;
import org.bigbluebutton.common.messages.SendStunTurnInfoReplyMessage;
import org.bigbluebutton.messages.CreateMeetingRequest;
import org.bigbluebutton.messages.CreateMeetingRequest.CreateMeetingRequestPayload;
import org.bigbluebutton.web.services.turn.StunServer;
import org.bigbluebutton.web.services.turn.TurnEntry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;

public class RedisMessagingService implements MessagingService {
	private static Logger log = LoggerFactory.getLogger(RedisMessagingService.class);
	
	private RedisStorageService storeService;
	private MessageSender sender;
	private ToJsonEncoder encoder = new ToJsonEncoder();
	
	public void recordMeetingInfo(String meetingId, Map<String, String> info, Map<String, String> breakoutInfo) {
		storeService.recordMeetingInfo(meetingId, info, breakoutInfo);
	}

	public void destroyMeeting(String meetingID) {
		DestroyMeetingMessage msg = new DestroyMeetingMessage(meetingID);
		String json = MessageToJson.destroyMeetingMessageToJson(msg);
		log.info("Sending destroy meeting message to bbb-apps:[{}]", json);
		sender.send(MessagingConstants.TO_MEETING_CHANNEL, json);	
	}
	
	public void registerUser(String meetingID, String internalUserId, String fullname, String role, String externUserID, String authToken, String avatarURL, String guest) {
		RegisterUserMessage msg = new RegisterUserMessage(meetingID, internalUserId, fullname, role, externUserID, authToken, avatarURL, guest);
		String json = MessageToJson.registerUserToJson(msg);
		log.info("Sending register user message to bbb-apps:[{}]", json);
		sender.send(MessagingConstants.TO_MEETING_CHANNEL, json);		
	}
	
    public void createMeeting(String meetingID, String externalMeetingID,
            String parentMeetingID, String meetingName, Boolean recorded,
            String voiceBridge, Integer duration, Boolean autoStartRecording,
            Boolean allowStartStopRecording, String moderatorPass,
            String viewerPass, Long createTime, String createDate,
            Boolean isBreakout, Integer sequence, Map<String, String> metadata) {
        CreateMeetingRequestPayload payload = new CreateMeetingRequestPayload(
                meetingID, externalMeetingID, parentMeetingID, meetingName,
                recorded, voiceBridge, duration, autoStartRecording,
                allowStartStopRecording, moderatorPass, viewerPass, createTime,
                createDate, isBreakout, sequence, metadata);
        CreateMeetingRequest msg = new CreateMeetingRequest(payload);

        Gson gson = new Gson();
        String json = gson.toJson(msg);
        log.info("Sending create meeting message to bbb-apps:[{}]", json);
        sender.send(MessagingConstants.TO_MEETING_CHANNEL, json);
    }
	
	public void endMeeting(String meetingId) {
		EndMeetingMessage msg = new EndMeetingMessage(meetingId);
		String json = MessageToJson.endMeetingMessageToJson(msg);
		log.info("Sending end meeting message to bbb-apps:[{}]", json);
		sender.send(MessagingConstants.TO_MEETING_CHANNEL, json);	
	}

  public void sendKeepAlive(String system, Long timestamp) {
   	String json = encoder.encodePubSubPingMessage("BbbWeb", System.currentTimeMillis());	
	sender.send(MessagingConstants.TO_SYSTEM_CHANNEL, json);		
  }
	
  public void send(String channel, String message) {
		sender.send(channel, message);
  }
  
	public void sendPolls(String meetingId, String title, String question, String questionType, List<String> answers){
		Gson gson = new Gson();

		HashMap<String, Object> map = new HashMap<String, Object>();
		map.put("messageId", MessagingConstants.SEND_POLLS_EVENT);
		map.put("meetingId", meetingId);
		map.put("title", title);
		map.put("question", question);
		map.put("questionType", questionType);
		map.put("answers", answers);
		
		sender.send(MessagingConstants.TO_POLLING_CHANNEL, gson.toJson(map));		
	}
	
	public void setMessageSender(MessageSender sender) {
		this.sender = sender;
	}
	
  public void setRedisStorageService(RedisStorageService storeService) {
  	this.storeService = storeService;
  }
  
	public void removeMeeting(String meetingId){
		storeService.removeMeeting(meetingId);
	}

	private void publishRecording(String recordId, String meetingId, String externalMeetingId, String format) {
		PublishRecordingMessage msg = new PublishRecordingMessage(recordId, meetingId, externalMeetingId, format);
		String json = MessageToJson.publishRecordingMessageToJson(msg);
		sender.send(MessagingConstants.FROM_BBB_RECORDING_CHANNEL, json);
	}

	private void unpublishRecording(String recordId, String meetingId, String externalMeetingId, String format) {
		UnpublishRecordingMessage msg = new UnpublishRecordingMessage(recordId, meetingId, externalMeetingId, format);
		String json = MessageToJson.unpublishRecordingMessageToJson(msg);
		sender.send(MessagingConstants.FROM_BBB_RECORDING_CHANNEL, json);
	}

	public void publishRecording(String recordId, String meetingId, String externalMeetingId, String format, boolean publish) {
		if (publish) {
			publishRecording(recordId, meetingId, externalMeetingId, format);
		} else {
			unpublishRecording(recordId, meetingId, externalMeetingId, format);
		}
	}

	public void deleteRecording(String recordId, String meetingId, String externalMeetingId, String format) {
		DeleteRecordingMessage msg = new DeleteRecordingMessage(recordId, meetingId, externalMeetingId, format);
		String json = MessageToJson.deleteRecordingMessageToJson(msg);
		sender.send(MessagingConstants.FROM_BBB_RECORDING_CHANNEL, json);
	}

	public void sendStunTurnInfo(String meetingId, String internalUserId, Set<StunServer> stuns, Set<TurnEntry> turns) {
		ArrayList<String> stunsArrayList = new ArrayList<String>();
		Iterator stunsIter = stuns.iterator();

		while (stunsIter.hasNext()) {
			StunServer aStun = (StunServer) stunsIter.next();
			if (aStun != null) {
				stunsArrayList.add(aStun.url);
			}
		}

		ArrayList<Map<String, Object>> turnsArrayList = new ArrayList<Map<String, Object>>();
		Iterator turnsIter = turns.iterator();
		while (turnsIter.hasNext()) {
			TurnEntry te = (TurnEntry) turnsIter.next();
			if (null != te) {
				Map<String, Object> map = new HashMap<String, Object>();
				map.put(Constants.USERNAME, te.username);
				map.put(Constants.URL, te.url);
				map.put(Constants.TTL, te.ttl);
				map.put(Constants.PASSWORD, te.password);

				turnsArrayList.add(map);
			}
		}

		SendStunTurnInfoReplyMessage msg = new SendStunTurnInfoReplyMessage(meetingId, internalUserId,
				stunsArrayList, turnsArrayList);

		sender.send(MessagingConstants.TO_BBB_HTML5_CHANNEL, msg.toJson());
	}
}
