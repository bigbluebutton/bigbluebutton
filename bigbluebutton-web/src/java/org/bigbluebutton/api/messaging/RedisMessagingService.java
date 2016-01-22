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
import java.util.HashSet;
import java.util.Map;
import java.util.List;
import java.util.Set;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import javax.imageio.ImageIO;
import org.bigbluebutton.api.messaging.converters.messages.CreateMeetingMessage;
import org.bigbluebutton.api.messaging.converters.messages.DestroyMeetingMessage;
import org.bigbluebutton.api.messaging.converters.messages.EndMeetingMessage;
import org.bigbluebutton.api.messaging.converters.messages.KeepAliveMessage;
import org.bigbluebutton.api.messaging.converters.messages.RegisterUserMessage;
import org.bigbluebutton.api.messaging.converters.messages.PublishRecordingMessage;
import org.bigbluebutton.api.messaging.converters.messages.UnpublishRecordingMessage;
import org.bigbluebutton.api.messaging.converters.messages.DeleteRecordingMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPubSub;

public class RedisMessagingService implements MessagingService {
	private static Logger log = LoggerFactory.getLogger(RedisMessagingService.class);
	
	private RedisStorageService storeService;
	private MessageSender sender;
	
	public void recordMeetingInfo(String meetingId, Map<String, String> info) {
		storeService.recordMeetingInfo(meetingId, info);	
	}

	public void destroyMeeting(String meetingID) {
		DestroyMeetingMessage msg = new DestroyMeetingMessage(meetingID);
		String json = MessageToJson.destroyMeetingMessageToJson(msg);
		log.info("Sending destroy meeting message to bbb-apps:[{}]", json);
		sender.send(MessagingConstants.TO_MEETING_CHANNEL, json);	
	}
	
	public void registerUser(String meetingID, String internalUserId, String fullname, String role, String externUserID, String authToken, String guest) {
		RegisterUserMessage msg = new RegisterUserMessage(meetingID, internalUserId, fullname, role, externUserID, authToken, guest);
		String json = MessageToJson.registerUserToJson(msg);
		log.info("Sending register user message to bbb-apps:[{}]", json);
		sender.send(MessagingConstants.TO_MEETING_CHANNEL, json);		
	}
	
	public void createMeeting(String meetingID, String externalMeetingID, String meetingName, Boolean recorded, 
			                      String voiceBridge, Long duration, 
			                      Boolean autoStartRecording, Boolean allowStartStopRecording,
			                      String moderatorPass, String viewerPass, Long createTime,
			                      String createDate) {
		CreateMeetingMessage msg = new CreateMeetingMessage(meetingID, externalMeetingID, meetingName, 
				                                  recorded, voiceBridge, duration, 
				                                  autoStartRecording, allowStartStopRecording,
				                                  moderatorPass, viewerPass, createTime, createDate);
		String json = MessageToJson.createMeetingMessageToJson(msg);
		log.info("Sending create meeting message to bbb-apps:[{}]", json);
		sender.send(MessagingConstants.TO_MEETING_CHANNEL, json);			
	}
	
	public void endMeeting(String meetingId) {
		EndMeetingMessage msg = new EndMeetingMessage(meetingId);
		String json = MessageToJson.endMeetingMessageToJson(msg);
		log.info("Sending end meeting message to bbb-apps:[{}]", json);
		sender.send(MessagingConstants.TO_MEETING_CHANNEL, json);	
	}

  public void sendKeepAlive(String keepAliveId) {
		KeepAliveMessage msg = new KeepAliveMessage(keepAliveId);
		String json = MessageToJson.keepAliveMessageToJson(msg);
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
		
		System.out.println(gson.toJson(map));
		
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
	
	public void publishRecording(String meetingID, String recordingID) {
		PublishRecordingMessage msg = new PublishRecordingMessage(meetingID, recordingID);
		String json = MessageToJson.publishRecordingMessageToJson(msg);
		log.info("Sending Recording has been Published message:[{}]", json);
		sender.send(MessagingConstants.RECORDING_PUBLISHED_EVENT, json);		
	}

	public void unpublishRecording(String meetingID, String recordingID) {
		UnpublishRecordingMessage msg = new UnpublishRecordingMessage(meetingID, recordingID);
		String json = MessageToJson.unpublishRecordingMessageToJson(msg);
		log.info("Sending Recording has been Unublished message:[{}]", json);
		sender.send(MessagingConstants.RECORDING_UNPUBLISHED_EVENT, json);		
	}

	public void deleteRecording(String meetingID, String recordingID) {
		DeleteRecordingMessage msg = new DeleteRecordingMessage(meetingID, recordingID);
		String json = MessageToJson.deleteRecordingMessageToJson(msg);
		log.info("Sending Recording has been Deleted message:[{}]", json);
		sender.send(MessagingConstants.RECORDING_DELETED_EVENT, json);		
	}

}
