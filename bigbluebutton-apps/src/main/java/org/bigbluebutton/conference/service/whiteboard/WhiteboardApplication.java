/** 
* ===License Header===
*
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
* ===License Header===
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
import org.red5.server.adapter.IApplication;
import org.red5.server.adapter.MultiThreadedApplicationAdapter;
import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.IScope;
import org.red5.server.api.Red5;
import org.red5.server.api.so.ISharedObject;
import org.slf4j.Logger;
import org.bigbluebutton.conference.service.recorder.RecorderApplication;
import org.bigbluebutton.conference.service.recorder.whiteboard.WhiteboardEventRecorder;

public class WhiteboardApplication extends MultiThreadedApplicationAdapter implements IApplication {
	
	private static Logger log = Red5LoggerFactory.getLogger(WhiteboardApplication.class, "bigbluebutton");
	private static final String APP = "WHITEBOARD";
	public static final String WHITEBOARD_SHARED_OBJECT = "drawSO";
	public static final String PRESENTATION_SHARED_OBJECT = "presentationSO";
	
	private WhiteboardRoomManager roomManager;
	private RecorderApplication recorderApplication;
	private ConnectionInvokerService connInvokerService;
	
	@Override
	public boolean appStart(IScope app) {
		log.info("Starting Whiteboard Application");
		this.scope = app;
		return true;
	}
	
	public void setRoomManager(WhiteboardRoomManager manager) {
		this.roomManager = manager;
	}
	
	@Override
	public void appStop(IScope scope) {
		roomManager.removeRoom(getLocalScope().getName());
	}
	
	public void setActivePresentation(String name, int numPages) {
		WhiteboardRoom room = roomManager.getRoom(getLocalScope().getName());
		if (room.presentationExists(name)) {
			room.setActivePresentation(name);
		} else {
			room.addPresentation(name, numPages);
		}
	}
	
	public void enableWhiteboard(boolean enabled) {
		roomManager.getRoom(getLocalScope().getName()).setWhiteboardEnabled(enabled);
//		ISharedObject drawSO = getSharedObject(getLocalScope(), WHITEBOARD_SHARED_OBJECT);
//		List<Boolean> arguments = new ArrayList<Boolean>();
//		arguments.add(enabled);
//		drawSO.sendMessage("modifyEnabledCallback", arguments);

		Map<String, Object> message = new HashMap<String, Object>();
		message.put("enabled", roomManager.getRoom(getLocalScope().getName()).isWhiteboardEnabled());
		ClientMessage m = new ClientMessage(ClientMessage.BROADCAST, getLocalScope().getName(), "WhiteboardEnableWhiteboardCommand", message);
		connInvokerService.sendMessage(m);
	}
	
	public void isWhiteboardEnabled(String userid) {
		Map<String, Object> message = new HashMap<String, Object>();
		message.put("enabled", roomManager.getRoom(getLocalScope().getName()).isWhiteboardEnabled());
		ClientMessage m = new ClientMessage(ClientMessage.DIRECT, userid, "WhiteboardIsWhiteboardEnabledReply", message);
		connInvokerService.sendMessage(m);
	}

	public void sendAnnotationHistory(String userid) {
		Map<String, Object> message = new HashMap<String, Object>();		
		List<Map<String, Object>> annotations = roomManager.getRoom(getLocalScope().getName()).getAnnotations();
		message.put("count", new Integer(annotations.size()));
		message.put("annotations", annotations);
		ClientMessage m = new ClientMessage(ClientMessage.DIRECT, userid, "WhiteboardRequestAnnotationHistoryReply", message);
		connInvokerService.sendMessage(m);
	}
	
	public void sendAnnotation(Map<String, Object> annotation) {
//		ISharedObject drawSO = getSharedObject(getLocalScope(), WHITEBOARD_SHARED_OBJECT);
//		roomManager.getRoom(getLocalScope().getName()).addAnnotation(annotation);
//		List<Object> arguments = new ArrayList<Object>();
//		arguments.add(annotation);
//		drawSO.sendMessage("receiveAnnotation", arguments);
		
		Map<String, Object> message = new HashMap<String, Object>();		
		roomManager.getRoom(getLocalScope().getName()).addAnnotation(annotation);
		message.put("annotation", annotation);
		ClientMessage m = new ClientMessage(ClientMessage.BROADCAST, getLocalScope().getName(), "WhiteboardNewAnnotationCommand", annotation);
		connInvokerService.sendMessage(m);
	}
	
	public void changePage(int pageNum) {
		Presentation pres = roomManager.getRoom(getLocalScope().getName()).getActivePresentation();
		pres.setActivePage(pageNum);
				
		Map<String, Object> message = new HashMap<String, Object>();		
		message.put("pageNum", pageNum);
		message.put("numAnnotations", pres.getActivePage().getNumShapesOnPage());
		ClientMessage m = new ClientMessage(ClientMessage.BROADCAST, getLocalScope().getName(), "WhiteboardChangePageCommand", message);
		connInvokerService.sendMessage(m);
	}
			
	public void clear() {
		roomManager.getRoom(getLocalScope().getName()).clear();
//		ISharedObject drawSO = getSharedObject(getLocalScope(), WHITEBOARD_SHARED_OBJECT);
//		drawSO.sendMessage("clear", new ArrayList<Object>());
		
		Map<String, Object> message = new HashMap<String, Object>();		
		ClientMessage m = new ClientMessage(ClientMessage.BROADCAST, getLocalScope().getName(), "WhiteboardClearCommand", message);
		connInvokerService.sendMessage(m);
		
	}
	
	public void undo() {
		roomManager.getRoom(getLocalScope().getName()).undo();
//		ISharedObject drawSO = getSharedObject(getLocalScope(), WHITEBOARD_SHARED_OBJECT);
//		drawSO.sendMessage("undo", new ArrayList<Object>());
		
		Map<String, Object> message = new HashMap<String, Object>();		
		ClientMessage m = new ClientMessage(ClientMessage.BROADCAST, getLocalScope().getName(), "WhiteboardUndoCommand", message);
		connInvokerService.sendMessage(m);
	}
	
	@Override
	public boolean appConnect(IConnection conn, Object[] params) {
		return true;
	}

	@Override
	public void appDisconnect(IConnection conn) {
	}

	@Override
	public boolean appJoin(IClient client, IScope scope) {
		return true;
	}

	@Override
	public void appLeave(IClient client, IScope scope) {

	}

	@Override
	public boolean roomConnect(IConnection connection, Object[] params) {
		log.debug("WHITEBOARD - getting record parameters");
		if (getBbbSession().getRecord()){
			log.debug("WHITEBOARD - recording : true");
			WhiteboardEventRecorder recorder = new WhiteboardEventRecorder(getLocalScope().getName(), recorderApplication);
			roomManager.getRoom(getLocalScope().getName()).addRoomListener(recorder);
			log.debug("event session is " + getLocalScope().getName());
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
		roomManager.addRoom(scope);
    	return true;
	}

	@Override
	public void roomStop(IScope scope) {
		roomManager.removeRoom(scope.getName());
	}
	
	private IScope getLocalScope(){
		return Red5.getConnectionLocal().getScope();
	}
	
	private BigBlueButtonSession getBbbSession() {
		return (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
	}
	
	public void setRecorderApplication(RecorderApplication a) {
		recorderApplication = a;
	}
	
	public void setConnInvokerService(ConnectionInvokerService connInvokerService) {
		this.connInvokerService = connInvokerService;
	}
}
