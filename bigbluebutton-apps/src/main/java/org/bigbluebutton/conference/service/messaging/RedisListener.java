package org.bigbluebutton.conference.service.messaging;

import java.util.HashMap;

import org.bigbluebutton.conference.RoomsManager;
import org.bigbluebutton.conference.service.presentation.ConversionUpdatesMessageListener;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPubSub;


public class RedisListener{

	JedisPool redisPool;
	RoomsManager roomsManager;
	ConversionUpdatesMessageListener messageListener;
	
	public RedisListener() {
		super();
	}
	
	public void init(){
		Jedis jedis = redisPool.getResource();
		//subscribe(jedis);
		redisPool.returnResource(jedis);
	}

	public void subscribe(final Jedis jedis){
		Thread t= new Thread(new Runnable() {
			@Override
			public void run() {
				jedis.subscribe(new JedisPubSub() {
					
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
						
					}
					
					@Override
					public void onPMessage(String pattern, String channel, String message) {
						if(channel.equalsIgnoreCase("bigbluebutton:meeting:request")){
							String[] args=message.split(":");
							String roomname=args[0];
							String type=args[1];
							
							if(type.equalsIgnoreCase("end")){
								roomsManager.endMeetingRequest(roomname);
							}
						}
						else if(channel.equalsIgnoreCase("bigbluebutton:meeting:presentation")){
							String[] args=message.split(":");
							
							HashMap<String,Object> map=new HashMap<String, Object>();
							map.put("code",args[0]);
							map.put("presentationName",args[1]);
							map.put("conference",args[2]);
							
							String messageKey=args[3];
							map.put("messageKey",messageKey);
							
							if(messageKey.equalsIgnoreCase(ConversionUpdatesMessageListener.PAGE_COUNT_EXCEEDED_KEY)){
								map.put("numberOfPages", args[4]);
								map.put("maxNumberPages", args[5]);
							}
							else if(messageKey.equalsIgnoreCase(ConversionUpdatesMessageListener.GENERATED_SLIDE_KEY)){
								map.put("numberOfPages", args[4]);
								map.put("pagesCompleted", args[5]);
							}
							else if(messageKey.equalsIgnoreCase(ConversionUpdatesMessageListener.CONVERSION_COMPLETED_KEY)){
								map.put("slidesInfo", args[4]);				
							}
							
							messageListener.handleReceivedMessage(map);
						}
						
					}
					
					@Override
					public void onMessage(String channel, String message) {
						
					}
				}, "bigbluebutton:meeting:*");
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
