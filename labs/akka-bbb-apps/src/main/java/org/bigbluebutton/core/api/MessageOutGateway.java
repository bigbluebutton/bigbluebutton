package org.bigbluebutton.core.api;

import java.util.ArrayList;
import java.util.List;

public class MessageOutGateway {

	private List<OutMessageListener2> listeners;
	
	public MessageOutGateway() {
		listeners = new ArrayList<OutMessageListener2>();
	}
	
	public void send(IOutMessage msg) {
		for (OutMessageListener2 l : listeners) {
			l.handleMessage(msg);
		}
	}
}
