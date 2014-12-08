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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPubSub;

public class RedisMessagingService implements MessagingService {
	private static Logger log = LoggerFactory.getLogger(RedisMessagingService.class);
	
	private JedisPool redisPool;
	private final Set<MessageListener> listeners = new HashSet<MessageListener>();

	private final Executor exec = Executors.newSingleThreadExecutor();
	private Runnable pubsubListener;

 	@Override
	public void addListener(MessageListener listener) {
 		listeners.add(listener);
	}
 	
	public void removeListener(MessageListener listener) {
 		listeners.remove(listener);
 	}

	public void recordMeetingInfo(String meetingId, Map<String, String> info) {
		Jedis jedis = redisPool.getResource();
		try {
		    for (String key: info.keySet()) {
				    	log.debug("Storing metadata {} = {}", key, info.get(key));
				}   

		    log.debug("Saving metadata in {}", meetingId);
			jedis.hmset("meeting:info:" + meetingId, info);
		} catch (Exception e){
			log.warn("Cannot record the info meeting:"+meetingId,e);
		} finally {
			redisPool.returnResource(jedis);
		}		
	}

	public void destroyMeeting(String meetingID) {
		HashMap<String,String> map = new HashMap<String, String>();
		map.put("messageId", MessagingConstants.DESTROY_MEETING_REQUEST_EVENT);
		map.put("meetingID", meetingID);
		Gson gson = new Gson();
		
		send(MessagingConstants.SYSTEM_CHANNEL, gson.toJson(map));		
	}
	
	public void createMeeting(String meetingID, Boolean recorded, String voiceBridge) {
		HashMap<String, Object> map = new HashMap<String, Object>();
		map.put("messageId", MessagingConstants.CREATE_MEETING_REQUEST_EVENT);
		map.put("meetingID", meetingID);
		map.put("record", recorded);
		map.put("voiceBridge", voiceBridge);
		
		Gson gson = new Gson();
		
		send(MessagingConstants.SYSTEM_CHANNEL, gson.toJson(map));		
	}
	
	public void endMeeting(String meetingId) {
		HashMap<String,String> map = new HashMap<String, String>();
		map.put("messageId", MessagingConstants.END_MEETING_REQUEST_EVENT);
		map.put("meetingId", meetingId);
		Gson gson = new Gson();
		send(MessagingConstants.SYSTEM_CHANNEL, gson.toJson(map));
	}

	public void send(String channel, String message) {
		Jedis jedis = redisPool.getResource();
		try {
			log.debug("Sending to channel[" + channel + "] message[" + message + "]");
			jedis.publish(channel, message);
		} catch(Exception e){
			log.warn("Cannot publish the message to redis",e);
		}finally{
			redisPool.returnResource(jedis);
		}
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
		
		send(MessagingConstants.POLLING_CHANNEL, gson.toJson(map));		
	}

	public String storeSubscription(String meetingId, String externalMeetingID, String callbackURL){
		String sid = "";
		Jedis jedis = redisPool.getResource();
		try {
			sid = Long.toString(jedis.incr("meeting:" + meetingId + ":nextSubscription"));

			HashMap<String,String> props = new HashMap<String,String>();
			props.put("subscriptionID", sid);
			props.put("meetingId", meetingId);
			props.put("externalMeetingID", externalMeetingID);
			props.put("callbackURL", callbackURL);
			props.put("active", "true");

			jedis.hmset("meeting:" + meetingId + ":subscription:" + sid, props);
			jedis.rpush("meeting:" + meetingId + ":subscriptions", sid);
			
		} catch (Exception e){
			log.warn("Cannot store subscription:" + meetingId, e);
		} finally {
			redisPool.returnResource(jedis);
		}

		return sid; 	
	}

	public boolean removeSubscription(String meetingId, String subscriptionId){
		boolean unsubscribed = true;
		Jedis jedis = redisPool.getResource();
		try {
			jedis.hset("meeting:" + meetingId + ":subscription:" + subscriptionId, "active", "false");	
		} catch (Exception e){
			log.warn("Cannot rmove subscription:" + meetingId, e);
			unsubscribed = false;
		} finally {
			redisPool.returnResource(jedis);
		}

		return unsubscribed; 	
	}

	public List<Map<String,String>> listSubscriptions(String meetingId){
		List<Map<String,String>> list = new ArrayList<Map<String,String>>();
		Jedis jedis = redisPool.getResource();
		try {
			List<String> sids = jedis.lrange("meeting:" + meetingId + ":subscriptions", 0 , -1);
			for(int i=0; i<sids.size(); i++){
				Map<String,String> props = jedis.hgetAll("meeting:" + meetingId + ":subscription:" + sids.get(i));
				list.add(props);	
			}
				
		} catch (Exception e){
			log.warn("Cannot list subscriptions:" + meetingId, e);
		} finally {
			redisPool.returnResource(jedis);
		}

		return list;	
	}	

	public void start() {
		log.debug("Starting redis pubsub...");		

		final Jedis jedis = redisPool.getResource();
		try {
			pubsubListener = new Runnable() {
			    public void run() {
			    	jedis.psubscribe(new PubSubListener(), MessagingConstants.BIGBLUEBUTTON_PATTERN);       			
			    }
			};
			exec.execute(pubsubListener);
		} catch (Exception e) {
			log.error("Error in subscribe: " + e.getMessage());
		}
	}

	public void stop() {
		try {
			redisPool.destroy();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	public void setRedisPool(JedisPool redisPool){
		this.redisPool=redisPool;
	}
	
	private class PubSubListener extends JedisPubSub {
		
		public PubSubListener() {
			super();			
		}

		@Override
		public void onMessage(String channel, String message) {
			// Not used.
		}

		@Override
		public void onPMessage(String pattern, String channel, String message) {
			log.debug("Message Received in channel: " + channel);
			log.debug("Message: " + message);
			
			Gson gson = new Gson();
			
//			for (String key: map.keySet()) {
//				log.debug("rx: {} = {}", key, map.get(key));
//			}
			
			if(channel.equalsIgnoreCase(MessagingConstants.SYSTEM_CHANNEL)){
				HashMap<String,String> map = gson.fromJson(message, new TypeToken<Map<String, String>>() {}.getType());
				String messageId = map.get("messageID");
				log.debug("*** Message {}", messageId);

				for (MessageListener listener : listeners) {
					if(MessagingConstants.MEETING_STARTED_EVENT.equalsIgnoreCase(messageId)) {
						String meetingId = map.get("meetingID");
						listener.meetingStarted(meetingId);
					} else if(MessagingConstants.MEETING_ENDED_EVENT.equalsIgnoreCase(messageId)) {
						String meetingId = map.get("meetingID");
						listener.meetingEnded(meetingId);
					} else if(MessagingConstants.KEEP_ALIVE_REPLY_EVENT.equalsIgnoreCase(messageId)){
						String aliveId = map.get("aliveID");
						listener.keepAliveReply(aliveId);
					}
				}
			}
			else if(channel.equalsIgnoreCase(MessagingConstants.PARTICIPANTS_CHANNEL)){
				HashMap<String,String> map = gson.fromJson(message, new TypeToken<Map<String, String>>() {}.getType());
				String meetingId = map.get("meetingID");
				String messageId = map.get("messageID");
				if(MessagingConstants.USER_JOINED_EVENT.equalsIgnoreCase(messageId)){
					String internalUserId = map.get("internalUserID");
					String externalUserId = map.get("externalUserID");
					String fullname = map.get("fullname");
					String role = map.get("role");
					
					for (MessageListener listener : listeners) {
						listener.userJoined(meetingId, internalUserId, externalUserId, fullname, role);
					}
				} else if(MessagingConstants.USER_STATUS_CHANGE_EVENT.equalsIgnoreCase(messageId)){
					String internalUserId = map.get("internalUserID");
					String status = map.get("status");
					String value = map.get("value");
					
					for (MessageListener listener : listeners) {
						listener.updatedStatus(meetingId, internalUserId, status, value);
					}
				} else if(MessagingConstants.USER_LEFT_EVENT.equalsIgnoreCase(messageId)){
					String internalUserId = map.get("internalUserID");
					
					for (MessageListener listener : listeners) {
						listener.userLeft(meetingId, internalUserId);
					}
				}
			}
		}

		@Override
		public void onPSubscribe(String pattern, int subscribedChannels) {
			log.debug("Subscribed to the pattern:"+pattern);
		}

		@Override
		public void onPUnsubscribe(String pattern, int subscribedChannels) {
			// Not used.
		}

		@Override
		public void onSubscribe(String channel, int subscribedChannels) {
			// Not used.
		}

		@Override
		public void onUnsubscribe(String channel, int subscribedChannels) {
			// Not used.
		}		
	}

}
