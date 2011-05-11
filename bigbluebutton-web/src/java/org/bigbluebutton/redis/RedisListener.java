package org.bigbluebutton.redis;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class RedisListener extends RedisServer implements Runnable{
	private static Logger log = LoggerFactory.getLogger(RedisListener.class);
	private PubsubListener pubsubListener;
	
	public RedisListener(String server, int port) {
		super(server, port);
		log.debug("RedisListener is connected");
	}

	public void init(){
		subscribe();
		log.debug("Subscribe to the BigBlueButton Topics");
	}
	
	public void subscribe(){
		System.out.println("execute init method");
		Thread t= new Thread(this);
		t.start();
	}
	
	public PubsubListener getPubsubListener() {
		return pubsubListener;
	}
	public void setPubsubListener(PubsubListener pubsubListener) {
		System.out.println("setting pubsub");
		this.pubsubListener = pubsubListener;
		
	}

	@Override
	public void run() {
		jedis.psubscribe(pubsubListener, "bigbluebutton:meeting:*");
	}
	
}
