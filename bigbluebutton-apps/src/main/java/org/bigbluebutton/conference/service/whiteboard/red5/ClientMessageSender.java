package org.bigbluebutton.conference.service.whiteboard.red5;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.bigbluebutton.conference.meeting.messaging.red5.ClientMessage;
import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService;
import org.bigbluebutton.conference.service.whiteboard.shapes.Annotation;

public class ClientMessageSender {

	private ConnectionInvokerService service;
	
	public void setConnectionInvokerService(ConnectionInvokerService service) {
		this.service = service;
	}
	
	public void setActivePresentation(String meetingID, String presentationID, int numPages) {
		Map<String, Object> message = new HashMap<String, Object>();
		message.put("presentationID", presentationID);
		message.put("numberOfPages", numPages);
		ClientMessage m = new ClientMessage(ClientMessage.BROADCAST, meetingID, "WhiteboardChangePresentationCommand", message);
		service.sendMessage(m);	
	}
	
	public void enableWhiteboard(String meetingID, boolean enabled) {
		Map<String, Object> message = new HashMap<String, Object>();
		message.put("enabled", enabled);
		ClientMessage m = new ClientMessage(ClientMessage.BROADCAST, meetingID, "WhiteboardEnableWhiteboardCommand", message);
		service.sendMessage(m);
	}
	
	public void isWhiteboardEnabled(String meetingID, String userID, boolean enabled) {
		Map<String, Object> message = new HashMap<String, Object>();
		message.put("enabled", enabled);
		ClientMessage m = new ClientMessage(ClientMessage.DIRECT, userID, "WhiteboardIsWhiteboardEnabledReply", message);
		service.sendMessage(m);
	}
	
	public void sendAnnotationHistory(String meetingID, String userID, String presentationID, Integer pageNumber, List<Annotation> annotations) {
		Map<String, Object> message = new HashMap<String, Object>();		
		
		message.put("count", new Integer(annotations.size()));
		
		/** extract annotation into a Map */
		List<Map<String, Object>> a = new ArrayList<Map<String, Object>>();
		for (Annotation v : annotations) {
			a.add(v.getAnnotation());
		}
		
		message.put("presentationID", presentationID);
		message.put("pageNumber", pageNumber);
		message.put("annotations", a);
		ClientMessage m = new ClientMessage(ClientMessage.DIRECT, userID, "WhiteboardRequestAnnotationHistoryReply", message);
		service.sendMessage(m);		
	}
	
	public void sendAnnotation(String meetingID, Map<String, Object> annotation) {
		ClientMessage m = new ClientMessage(ClientMessage.BROADCAST, meetingID, "WhiteboardNewAnnotationCommand", annotation);
		service.sendMessage(m);
	}
	
	public void changePage(String meetingID, int pageNum, int numAnnotations) {
		Map<String, Object> message = new HashMap<String, Object>();		
		message.put("pageNum", pageNum);
		message.put("numAnnotations", numAnnotations);
		ClientMessage m = new ClientMessage(ClientMessage.BROADCAST, meetingID, "WhiteboardChangePageCommand", message);
		service.sendMessage(m);		
	}
	
	public void clear(String meetingID) {
		Map<String, Object> message = new HashMap<String, Object>();		
		ClientMessage m = new ClientMessage(ClientMessage.BROADCAST, meetingID, "WhiteboardClearCommand", message);
		service.sendMessage(m);	
	}
	
	public void undo(String meetingID) {
		Map<String, Object> message = new HashMap<String, Object>();		
		ClientMessage m = new ClientMessage(ClientMessage.BROADCAST, meetingID, "WhiteboardUndoCommand", message);
		service.sendMessage(m);
	}
}
