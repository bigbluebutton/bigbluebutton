package org.bigbluebutton.conference.service.layout.red5;


import java.util.HashMap;
import java.util.Map;
import org.bigbluebutton.conference.meeting.messaging.red5.BroadcastClientMessage;
import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService;
import org.bigbluebutton.conference.meeting.messaging.red5.DirectClientMessage;

public class LayoutClientSender {

	private ConnectionInvokerService service;
	
	public void setConnectionInvokerService(ConnectionInvokerService service) {
		this.service = service;
	}
	
	public void sendGetCurrentLayoutResponse(String meetingID, String requesterID, Boolean locked, String setByUserID, String layout) {
		Map<String, Object> message = new HashMap<String, Object>();
		message.put("locked", locked);
		message.put("setByUserID", setByUserID);
		message.put("layout", layout);
		DirectClientMessage m = new DirectClientMessage(meetingID, requesterID, "getCurrentLayoutResponse", message);
		service.sendMessage(m);	
	}
	
	public void updateLayout(String meetingID, Boolean locked, String setByUserID, String layout) {
		Map<String, Object> message = new HashMap<String, Object>();
		message.put("locked", locked);
		message.put("setByUserID", setByUserID);
		message.put("layout", layout);
		BroadcastClientMessage m = new BroadcastClientMessage(meetingID, "remoteUpdateLayout", message);
		service.sendMessage(m);		
	}
}
