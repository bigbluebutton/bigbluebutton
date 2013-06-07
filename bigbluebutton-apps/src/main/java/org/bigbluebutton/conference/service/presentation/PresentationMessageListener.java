package org.bigbluebutton.conference.service.presentation;

import org.bigbluebutton.conference.service.messaging.redis.MessageHandler;

public class PresentationMessageListener implements MessageHandler {

	private ConversionUpdatesMessageListener listener;
	

	
	public void setPresentationListener(ConversionUpdatesMessageListener listener) {
		this.listener = listener;
	}



	@Override
	public void handleMessage(String pattern, String channel, String message) {
		// TODO Auto-generated method stub
		
	}
}
