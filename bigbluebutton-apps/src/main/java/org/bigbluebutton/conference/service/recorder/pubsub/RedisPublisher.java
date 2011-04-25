package org.bigbluebutton.conference.service.recorder.pubsub;

import java.io.IOException;

import redis.clients.jedis.Jedis;

public class RedisPublisher {
	Jedis jedis;
	
	public RedisPublisher(String host, int port){
		jedis= new Jedis(host,port);
	}
	
	public void publish(String channel, String message){
		jedis.publish(channel, message);
	}
	
	public void disconnect(){
		try {
			jedis.disconnect();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
