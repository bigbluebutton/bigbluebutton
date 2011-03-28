package org.bigbluebutton.conference.service.recorder.pubsub;

import org.bigbluebutton.conference.service.recorder.RedisServer;


public class RedisListener extends RedisServer implements Runnable {

	private PubsubListener pubsubListener;
	
	public RedisListener(String server, int port) {
		super(server, port);
		// TODO Auto-generated constructor stub
	}

	public void subscribe(){
		Thread t= new Thread(this);
		t.start();
	}
	
	@Override
	public void run() {
		jedis.subscribe(pubsubListener, "bbbConferenceEvents");
	}
	
	public PubsubListener getPubsubListener() {
		return pubsubListener;
	}
	public void setPubsubListener(PubsubListener pubsubListener) {
		System.out.println("setting pubsub");
		this.pubsubListener = pubsubListener;
		
	}

}
