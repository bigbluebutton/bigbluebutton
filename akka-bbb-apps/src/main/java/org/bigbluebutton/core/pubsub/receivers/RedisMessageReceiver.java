package org.bigbluebutton.core.pubsub.receivers;

import java.util.ArrayList;
import java.util.List;

import org.bigbluebutton.core.api.IBigBlueButtonInGW;

public class RedisMessageReceiver {
	private List<MessageHandler> receivers;
	private IBigBlueButtonInGW bbbGW;
	
	public RedisMessageReceiver(IBigBlueButtonInGW bbbGW) {
		this.bbbGW = bbbGW;
		receivers = new ArrayList<MessageHandler>();
		setupReceivers();
	}
	
	private void setupReceivers() {
		ChatMessageReceiver chatRx = new ChatMessageReceiver(bbbGW);
		receivers.add(chatRx);
		
		LockMessageReceiver lockRx = new LockMessageReceiver(bbbGW);
		receivers.add(lockRx);
		
		PresentationMessageListener presRx = new PresentationMessageListener(bbbGW);
		receivers.add(presRx);
		
		UsersMessageReceiver usersRx = new UsersMessageReceiver(bbbGW);
		receivers.add(usersRx);
				
		WhiteboardMessageReceiver whiteboardRx = new WhiteboardMessageReceiver(bbbGW);
		receivers.add(whiteboardRx);
		
		MeetingMessageReceiver meetingRx = new MeetingMessageReceiver(bbbGW);
		receivers.add(meetingRx);
	}
	
	public void handleMessage(String pattern, String channel, String message) {
		for (MessageHandler l : receivers) {
			l.handleMessage(pattern, channel, message);
		}
	}
}
