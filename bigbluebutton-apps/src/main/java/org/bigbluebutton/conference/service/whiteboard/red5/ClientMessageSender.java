package org.bigbluebutton.conference.service.whiteboard.red5;

import java.util.Map;
import org.bigbluebutton.conference.ClientMessage;
import org.bigbluebutton.conference.ConnectionInvokerService;

public class ClientMessageSender {

	private ConnectionInvokerService service;
	
	public void setConnectionInvokerService(ConnectionInvokerService service) {
		this.service = service;
	}
	
	public void sendAnnotation(String meetingID, Map<String, Object> annotation) {
		ClientMessage m = new ClientMessage(ClientMessage.BROADCAST, meetingID, "WhiteboardNewAnnotationCommand", annotation);
		service.sendMessage(m);
	}
}
