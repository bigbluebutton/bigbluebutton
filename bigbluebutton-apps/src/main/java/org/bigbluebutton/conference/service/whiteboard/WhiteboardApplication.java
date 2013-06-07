/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.conference.service.whiteboard;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.bigbluebutton.conference.BigBlueButtonSession;
import org.bigbluebutton.conference.ClientMessage;
import org.bigbluebutton.conference.ConnectionInvokerService;
import org.bigbluebutton.conference.Constants;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.adapter.ApplicationAdapter;
import org.red5.server.adapter.IApplication;
import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.Red5;
import org.red5.server.api.scope.IScope;
import org.slf4j.Logger;
import org.bigbluebutton.conference.service.recorder.whiteboard.WhiteboardEventRecorder;
import org.bigbluebutton.conference.service.whiteboard.shapes.Annotation;
import java.util.concurrent.ConcurrentHashMap;

public class WhiteboardApplication extends ApplicationAdapter implements IApplication {	
	private static Logger log = Red5LoggerFactory.getLogger(WhiteboardApplication.class, "bigbluebutton");

	private WhiteboardRecordingService recordingService;
	private ConnectionInvokerService connInvokerService;
	private static final String APP = "WHITEBOARD";
	private ConcurrentHashMap<String, WhiteboardRoom> rooms;


	@Override
	public boolean appConnect(IConnection conn, Object[] params) {
		log.debug("***** " + APP + " [ " + " appConnect *********");
		return true;
	}

	@Override
	public void appDisconnect(IConnection conn) {
		log.debug("***** " + APP + " [ " + " appDisconnect *********");
	}

	@Override
	public boolean appJoin(IClient client, IScope scope) {
		log.debug("***** " + APP + " [ " + " appJoin [ " + scope.getName() + "] *********");
		return true;
	}

	@Override
	public void appLeave(IClient client, IScope scope) {
		log.debug("***** " + APP + " [ " + " appLeave [ " + scope.getName() + "] *********");
	}

	@Override
	public boolean appStart(IScope scope) {
		rooms = new ConcurrentHashMap<String, WhiteboardRoom>();
		log.debug("***** " + APP + " [ " + " appStart [ " + scope.getName() + "] *********");
		return true;
	}

	@Override
	public void appStop(IScope scope) {
		log.debug("***** " + APP + " [ " + " appStop [ " + scope.getName() + "] *********");
		rooms.clear();
	}
	
	@Override
	public boolean roomConnect(IConnection connection, Object[] params) {
		boolean record = getBbbSession().getRecord();
		if (record) {
			String meetingID = connection.getScope().getName();
			if (rooms.containsKey(meetingID)) {
				WhiteboardRoom wbMeeting = rooms.get(meetingID);
				wbMeeting.record(record);
			}
		}
    	return true;
	}

	@Override
	public void roomDisconnect(IConnection connection) {
		
	}

	@Override
	public boolean roomJoin(IClient client, IScope scope) {
		return true;
	}

	@Override
	public void roomLeave(IClient client, IScope scope) {
	}

	@Override
	public boolean roomStart(IScope scope) {
		String meetingID = scope.getName();
		// Set the recording to false here. We don't have the information yet as
		// the recorded info is passed from the client on the connect.
		WhiteboardRoom newRoom = new WhiteboardRoom(meetingID, false);
		rooms.put(meetingID, newRoom);

    return true;
	}

	@Override
	public void roomStop(IScope scope) {
		rooms.remove(scope.getName());
	}
	
	public void setActivePresentation(String presentationID, int numPages) {
		String meetingID = getMeetingId();

		if (rooms.containsKey(meetingID)) {		
			WhiteboardRoom room = rooms.get(meetingID);
			if (room.presentationExists(presentationID)) {
				room.setActivePresentation(presentationID);
			} else {
				room.addPresentation(presentationID, numPages);
			}
		
			Map<String, Object> message = new HashMap<String, Object>();
			message.put("presentationID", presentationID);
			message.put("numberOfPages", numPages);
			ClientMessage m = new ClientMessage(ClientMessage.BROADCAST, getMeetingId(), "WhiteboardChangePresentationCommand", message);
			connInvokerService.sendMessage(m);
		}
	}
	
	public void enableWhiteboard(boolean enabled) {
		String meetingID = getMeetingId();
		if (rooms.containsKey(meetingID)) {
			WhiteboardRoom room = rooms.get(meetingID);
			room.setWhiteboardEnabled(enabled);
		
			Map<String, Object> message = new HashMap<String, Object>();
			message.put("enabled", room.isWhiteboardEnabled());
			ClientMessage m = new ClientMessage(ClientMessage.BROADCAST, meetingID, "WhiteboardEnableWhiteboardCommand", message);
			connInvokerService.sendMessage(m);
		}
	}
	
	public void isWhiteboardEnabled(String userid) {
		String meetingID = getMeetingId();
		if (rooms.containsKey(meetingID)) {
			WhiteboardRoom room = rooms.get(meetingID);
			Map<String, Object> message = new HashMap<String, Object>();
			message.put("enabled", room.isWhiteboardEnabled());
			ClientMessage m = new ClientMessage(ClientMessage.DIRECT, userid, "WhiteboardIsWhiteboardEnabledReply", message);
			connInvokerService.sendMessage(m);
		}
	}

	public void sendAnnotationHistory(String userid, String presentationID, Integer pageNumber) {
		String meetingID = getMeetingId();
		if (rooms.containsKey(meetingID)) {
			WhiteboardRoom room = rooms.get(meetingID);

			Map<String, Object> message = new HashMap<String, Object>();		
			List<Annotation> annotations = room.getAnnotations(presentationID, pageNumber);
			message.put("count", new Integer(annotations.size()));
			
			/** extract annotation into a Map */
			List<Map<String, Object>> a = new ArrayList<Map<String, Object>>();
			for (Annotation v : annotations) {
				a.add(v.getAnnotation());
			}
			
			message.put("presentationID", presentationID);
			message.put("pageNumber", pageNumber);
			message.put("annotations", a);
			ClientMessage m = new ClientMessage(ClientMessage.DIRECT, userid, "WhiteboardRequestAnnotationHistoryReply", message);
			connInvokerService.sendMessage(m);

		}
	}
	
	private static final String TEXT_CREATED = "textCreated";
	private static final String TEXT_TYPE = "text";
	private static final String PENCIL_TYPE = "pencil";
	private static final String RECTANGLE_TYPE = "rectangle";
	private static final String ELLIPSE_TYPE = "ellipse";
	private static final String TRIANGLE_TYPE = "triangle";
	private static final String LINE_TYPE = "line";
	
	public void sendAnnotation(Annotation annotation) {	
		String meetingID = getMeetingId();
		if (rooms.containsKey(meetingID)) {
			WhiteboardRoom room = rooms.get(meetingID);
		
			String status = annotation.getStatus();

			if ("textCreated".equals(status)) {
				room.addAnnotation(annotation);
				if (room.isRecorded()) {
					recordingService.addAnnotation(meetingID, annotation, room.getPresentationID(), room.getPageNumber());
				}
			} else if (PENCIL_TYPE.equals(annotation.getType()) && "DRAW_START".equals(status)) {
				room.addAnnotation(annotation);
				if (room.isRecorded()) {
					recordingService.addAnnotation(meetingID, annotation, room.getPresentationID(), room.getPageNumber());
				}
			} else if ("DRAW_END".equals(status) && (RECTANGLE_TYPE.equals(annotation.getType()) 
														|| ELLIPSE_TYPE.equals(annotation.getType())
														|| TRIANGLE_TYPE.equals(annotation.getType())
														|| LINE_TYPE.equals(annotation.getType()))) {				
				room.addAnnotation(annotation);
				if (room.isRecorded()) {
					recordingService.addAnnotation(meetingID, annotation, room.getPresentationID(), room.getPageNumber());
				}
			} else {
				if ("text".equals(annotation.getType())) {
					room.modifyText(annotation);	
					if (room.isRecorded()) {
						recordingService.modifyText(meetingID, annotation, room.getPresentationID(), room.getPageNumber());			
					}
				}
			}
			
			ClientMessage m = new ClientMessage(ClientMessage.BROADCAST, meetingID, "WhiteboardNewAnnotationCommand", annotation.getAnnotation());
			connInvokerService.sendMessage(m);

		}
	}
	
	public void changePage(int pageNum) {
		String meetingID = getMeetingId();
		if (rooms.containsKey(meetingID)) {
			WhiteboardRoom room = rooms.get(meetingID);
		
			Presentation pres = room.getActivePresentation();
			pres.setActivePage(pageNum);
			
			Map<String, Object> message = new HashMap<String, Object>();		
			message.put("pageNum", pageNum);
			message.put("numAnnotations", pres.getActivePage().getNumShapesOnPage());
			ClientMessage m = new ClientMessage(ClientMessage.BROADCAST, meetingID, "WhiteboardChangePageCommand", message);
			connInvokerService.sendMessage(m);

		}
	}
			
	public void clear() {
		String meetingID = getMeetingId();
		if (rooms.containsKey(meetingID)) {
			WhiteboardRoom room = rooms.get(meetingID);
			room.clear();

			if (room.isRecorded()) {
				recordingService.clearPage(meetingID, room.getPresentationID(), room.getPageNumber());							
			}

			Map<String, Object> message = new HashMap<String, Object>();		
			ClientMessage m = new ClientMessage(ClientMessage.BROADCAST, meetingID, "WhiteboardClearCommand", message);
			connInvokerService.sendMessage(m);		
		
		}
	}
			
	public void undo() {
		String meetingID = getMeetingId();
		if (rooms.containsKey(meetingID)) {
			WhiteboardRoom room = rooms.get(meetingID);
			room.undo();

			if (room.isRecorded()) {
				recordingService.undoWBGraphic(meetingID, room.getPresentationID(), room.getPageNumber());							
			}

			Map<String, Object> message = new HashMap<String, Object>();		
			ClientMessage m = new ClientMessage(ClientMessage.BROADCAST, meetingID, "WhiteboardUndoCommand", message);
			connInvokerService.sendMessage(m);
		}
	}
	
	private String getMeetingId(){
		return Red5.getConnectionLocal().getScope().getName();
	}
	
	private BigBlueButtonSession getBbbSession() {
		return (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
	}
	
	public void setWhiteboardRecordingService(WhiteboardRecordingService recService) {
		recordingService = recService;
	}

	public void setConnInvokerService(ConnectionInvokerService connInvokerService) {
		this.connInvokerService = connInvokerService;
	}
}
