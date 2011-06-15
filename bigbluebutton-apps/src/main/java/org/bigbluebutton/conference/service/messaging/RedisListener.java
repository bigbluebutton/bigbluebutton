package org.bigbluebutton.conference.service.messaging;

import java.io.IOException;
import java.net.UnknownHostException;
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
	
	JedisPool redisPool;
	RoomsManager roomsManager;
	ConversionUpdatesMessageListener messageListener;
	
	public RedisListener() {
		super();
	}
	
	public void init(){
		Jedis jedis = new Jedis("localhost");//redisPool.getResource();
		//subscribe(jedis);
		//redisPool.returnResource(jedis);
		log.debug("subscribing to the channels...");
		try {
			jedis.connect();
		} catch (UnknownHostException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
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
					private Logger log2 = Red5LoggerFactory.getLogger(JedisPubSub.class, "bigbluebutton");
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
						log2.debug("messsage "+pattern+channel+message);
						if(channel.equalsIgnoreCase("bigbluebutton:meeting:request")){
							String[] args=message.split(":");
							String roomname=args[0];
							String type=args[1];
							
							if(type.equalsIgnoreCase("end")){
								roomsManager.endMeetingRequest(roomname);
							}
						}
						else if(channel.equalsIgnoreCase("bigbluebutton:meeting:presentation")){
							//String[] args=message.split(":");
							log2.debug("receiving message "+message);
							Gson gson=new Gson();
							
							
							HashMap<String,Object> map=gson.fromJson(message, new TypeToken<Map<String, String>>() {}.getType());
							/*map.put("code",args[0]);
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
							}*/
							
							messageListener.handleReceivedMessage(map);
						}
						
					}
					
					@Override
					public void onMessage(String channel, String message) {
						log2.debug("messsage "+channel+message);
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
