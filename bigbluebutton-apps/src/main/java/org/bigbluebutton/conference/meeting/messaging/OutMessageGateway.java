package org.bigbluebutton.conference.meeting.messaging;

import java.util.Set;

public class OutMessageGateway {

	private Set<OutMessageListener> listeners;
	
	public void setOutMessageListeners(Set<OutMessageListener> listeners) {
		this.listeners = listeners;
	}
	
	public void send(OutMessage message) {
		for (OutMessageListener listener : listeners) {
			listener.send(message);
		}
	}
}
