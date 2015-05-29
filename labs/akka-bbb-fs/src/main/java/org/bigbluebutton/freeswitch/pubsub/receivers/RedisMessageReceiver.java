package org.bigbluebutton.freeswitch.pubsub.receivers;

import org.bigbluebutton.freeswitch.voice.freeswitch.FreeswitchApplication;

public class RedisMessageReceiver {
	
	private final FreeswitchApplication fsApp;
	
	public RedisMessageReceiver(FreeswitchApplication fsApp) {
		this.fsApp = fsApp;
	}
	
	public void handleMessage(String pattern, String channel, String message) {

	}
}
