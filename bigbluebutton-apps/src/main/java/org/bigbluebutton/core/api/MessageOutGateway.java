package org.bigbluebutton.core.api;

import java.util.Set;

public class MessageOutGateway {

	private Set<OutMessageListener2> listeners;
	
	public void send(IOutMessage msg) {
		for (OutMessageListener2 l : listeners) {
			l.handleMessage(msg);
		}
	}
	
	public void setListeners(Set<OutMessageListener2> listeners) {
		this.listeners = listeners;
	}
}
