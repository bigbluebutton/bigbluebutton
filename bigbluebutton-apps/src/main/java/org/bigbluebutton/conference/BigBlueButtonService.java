package org.bigbluebutton.conference;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.red5.server.api.Red5;

public class BigBlueButtonService {
	private ConnectionInvokerService connInvokerService;
	
	public void sendMessage(HashMap<String, Object> params) {
		
		Map<String, Object> messageToSend = new HashMap<String, Object>();
		
	    for (Iterator<String> it = params.keySet().iterator(); it.hasNext();) {
	        String key = it.next();
	        messageToSend.put(key, params.get(key));
	    }
	    		
		ClientMessage m = new ClientMessage(ClientMessage.BROADCAST, getMeetingId(), (String) params.get("messageID"), messageToSend);
		connInvokerService.sendMessage(m);
	}
	
	private String getMeetingId(){
		return Red5.getConnectionLocal().getScope().getName();
	}
	
	public void setConnInvokerService(ConnectionInvokerService connInvokerService) {
		this.connInvokerService = connInvokerService;
	}
	
}
