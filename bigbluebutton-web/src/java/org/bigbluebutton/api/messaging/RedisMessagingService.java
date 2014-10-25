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
		log.info("Sending destory meeting message to bbb-apps:[{}]", json);
		sender.send(MessagingConstants.TO_MEETING_CHANNEL, json);	
	}
	
	public void registerUser(String meetingID, String internalUserId, String fullname, String role, String externUserID, String authToken) {
		RegisterUserMessage msg = new RegisterUserMessage(meetingID, internalUserId, fullname, role, externUserID, authToken);
		String json = MessageToJson.registerUserToJson(msg);
		log.info("Sending register user message to bbb-apps:[{}]", json);
		sender.send(MessagingConstants.TO_MEETING_CHANNEL, json);		
	}
	
	public void createMeeting(String meetingID, String meetingName, Boolean recorded, 
			                      String voiceBridge, Long duration, 
			                      Boolean autoStartRecording, Boolean allowStartStopRecording) {
		CreateMeetingMessage msg = new CreateMeetingMessage(meetingID, meetingName, 
				                                  recorded, voiceBridge, duration, 
				                                  autoStartRecording, allowStartStopRecording);
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
  
	public String storeSubscription(String meetingId, String externalMeetingID, String callbackURL){
		return storeService.storeSubscription(meetingId, externalMeetingID, callbackURL);
	}

	public boolean removeSubscription(String meetingId, String subscriptionId){
		return storeService.removeSubscription(meetingId, subscriptionId);
	}

	public List<Map<String,String>> listSubscriptions(String meetingId){
		return storeService.listSubscriptions(meetingId);	
	}	
	
	public void removeMeeting(String meetingId){
		storeService.removeMeeting(meetingId);
	}
	
}
