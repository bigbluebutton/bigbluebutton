package org.bigbluebutton.conference.service.layout.red5;


import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.conference.meeting.messaging.OutMessage;
import org.bigbluebutton.conference.meeting.messaging.OutMessageListener;
import org.bigbluebutton.conference.meeting.messaging.red5.BroadcastClientMessage;
import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService;
import org.bigbluebutton.conference.meeting.messaging.red5.DirectClientMessage;
import org.bigbluebutton.conference.service.layout.messaging.messages.GetCurrentLayoutResponseMessage;
import org.bigbluebutton.conference.service.layout.messaging.messages.UpdateLayoutMessage;

public class LayoutClientSender implements OutMessageListener {

	private ConnectionInvokerService service;
	
	public void setConnectionInvokerService(ConnectionInvokerService service) {
		this.service = service;
	}
	
	@Override
	public void send(OutMessage msg) {
		if (msg instanceof GetCurrentLayoutResponseMessage) {
			sendGetCurrentLayoutResponse((GetCurrentLayoutResponseMessage) msg);
		} else if (msg instanceof UpdateLayoutMessage) {
			updateLayout((UpdateLayoutMessage) msg);
		}
	}
	
	private void sendGetCurrentLayoutResponse(GetCurrentLayoutResponseMessage msg) {
		Map<String, Object> message = new HashMap<String, Object>();
		message.put("locked", msg.isLocked());
		message.put("setByUserID", msg.getSetByUserID());
		message.put("layout", msg.getLayout());
		
		DirectClientMessage m = new DirectClientMessage(msg.getMeetingID(), msg.getRequesterID(), "getCurrentLayoutResponse", message);
		service.sendMessage(m);	
	}
	
	public void updateLayout(UpdateLayoutMessage msg) {
		Map<String, Object> message = new HashMap<String, Object>();
		message.put("locked", msg.isLocked());
		message.put("setByUserID", msg.getSetByUserID());
		message.put("layout", msg.getLayout());
		
		BroadcastClientMessage m = new BroadcastClientMessage(msg.getMeetingID(), "remoteUpdateLayout", message);
		service.sendMessage(m);		
	}
}
