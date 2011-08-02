package org.bigbluebutton.conference.service.messaging;

import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.conference.RoomsManager;
import org.bigbluebutton.conference.service.presentation.ConversionUpdatesMessageListener;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPubSub;


public class RedisListener{
	private static Logger log = Red5LoggerFactory.getLogger(RedisListener.class, "bigbluebutton");
	
	String host;
	int port;
	
	JedisPool redisPool;
	RoomsManager roomsManager;
	ConversionUpdatesMessageListener messageListener;
	
	public RedisListener(String host, int port) {
		super();
		this.host=host;
		this.port=port;
	}
	
	public void init(){
		Jedis jedis = new Jedis(host,port);//redisPool.getResource();
		//subscribe(jedis);
		//redisPool.returnResource(jedis);
		log.debug("subscribing to the channels...");
		try {
			jedis.connect();
		} catch (Exception e) {
			e.printStackTrace();
		}
		subscribe(jedis);
	}

	public void subscribe(final Jedis jedis){
		log.debug("subscribe init...");
		Thread t= new Thread(new Runnable() {
			@Override
			public void run() {
				jedis.psubscribe(new JedisPubSub() {
					@Override
					public void onUnsubscribe(String arg0, int arg1) {
						// TODO Auto-generated method stub
						
					}
					
					@Override
					public void onSubscribe(String arg0, int arg1) {
						// TODO Auto-generated method stub
						
					}
					
					@Override
					public void onPUnsubscribe(String arg0, int arg1) {
						// TODO Auto-generated method stub
						
					}
					
					@Override
					public void onPSubscribe(String arg0, int arg1) {
						log.debug("subscribe to: "+arg0+" "+arg1);
					}
					
					@Override
					public void onPMessage(String pattern, String channel, String message) {
						log.debug("messsage " + pattern + channel + message);
						if(channel.equalsIgnoreCase(MessagingConstants.SYSTEM_CHANNEL)){
							Gson gson = new Gson();
							HashMap<String,String> map = gson.fromJson(message, new TypeToken<Map<String, String>>() {}.getType());
							
							String meetingId = map.get("meetingId");
							String messageId = map.get("messageId");
							if(messageId != null){
								if(MessagingConstants.END_MEETING_REQUEST_EVENT.equalsIgnoreCase(messageId)){
									roomsManager.endMeetingRequest(meetingId);
								}
							}
						}
						else if(channel.equalsIgnoreCase(MessagingConstants.PRESENTATION_CHANNEL)){
							log.debug("receiving message " + message);
							Gson gson = new Gson();
							
							HashMap<String,String> map = gson.fromJson(message, new TypeToken<Map<String, String>>() {}.getType());
							messageListener.handleReceivedMessage(map);
						}						
					}
					
					@Override
					public void onMessage(String channel, String message) {

					}
				}, MessagingConstants.BIGBLUEBUTTON_PATTERN);
			}
		});
		t.start();
	}

	public JedisPool getRedisPool() {
		return redisPool;
	}

	public void setRedisPool(JedisPool redisPool) {
		this.redisPool = redisPool;
	}

	public RoomsManager getRoomsManager() {
		return roomsManager;
	}

	public void setRoomsManager(RoomsManager roomsManager) {
		this.roomsManager = roomsManager;
	}

	public ConversionUpdatesMessageListener getMessageListener() {
		return messageListener;
	}

	public void setMessageListener(ConversionUpdatesMessageListener messageListener) {
		this.messageListener = messageListener;
	}
	
	
}
