package org.bigbluebutton.core.api;

import java.util.List;

public class MessageOutGateway {

	private List<OutMessageListener2> listeners;
	
	public MessageOutGateway(List<OutMessageListener2> listeners) {
		this.listeners = listeners;
	}
	
	public void send(IOutMessage msg) {
		for (OutMessageListener2 l : listeners) {
			l.handleMessage(msg);
		}
	}
}
