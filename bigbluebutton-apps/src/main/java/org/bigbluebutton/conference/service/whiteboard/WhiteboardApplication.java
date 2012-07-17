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
import java.util.LinkedHashMap;
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
import org.slf4j.Logger;
import org.bigbluebutton.conference.service.recorder.RecorderApplication;
import org.bigbluebutton.conference.service.recorder.whiteboard.WhiteboardEventRecorder;

public class WhiteboardApplication extends MultiThreadedApplicationAdapter implements IApplication {	
	private static Logger log = Red5LoggerFactory.getLogger(WhiteboardApplication.class, "bigbluebutton");
	
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
		roomManager.removeRoom(getMeetingId());
	}
	
	public void setActivePresentation(String presentationID, int numPages) {
		WhiteboardRoom room = roomManager.getRoom(getMeetingId());
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
	
	public void enableWhiteboard(boolean enabled) {
		roomManager.getRoom(getMeetingId()).setWhiteboardEnabled(enabled);
		
		Map<String, Object> message = new HashMap<String, Object>();
		message.put("enabled", roomManager.getRoom(getMeetingId()).isWhiteboardEnabled());
		ClientMessage m = new ClientMessage(ClientMessage.BROADCAST, getMeetingId(), "WhiteboardEnableWhiteboardCommand", message);
		connInvokerService.sendMessage(m);
	}
	
	public void isWhiteboardEnabled(String userid) {
		Map<String, Object> message = new HashMap<String, Object>();
		message.put("enabled", roomManager.getRoom(getMeetingId()).isWhiteboardEnabled());
		ClientMessage m = new ClientMessage(ClientMessage.DIRECT, userid, "WhiteboardIsWhiteboardEnabledReply", message);
		connInvokerService.sendMessage(m);
	}

	public void sendAnnotationHistory(String userid) {
		Map<String, Object> message = new HashMap<String, Object>();		
		List<Map<String, Object>> annotations = roomManager.getRoom(getMeetingId()).getAnnotations();
		message.put("count", new Integer(annotations.size()));
		message.put("annotations", annotations);
		ClientMessage m = new ClientMessage(ClientMessage.DIRECT, userid, "WhiteboardRequestAnnotationHistoryReply", message);
		connInvokerService.sendMessage(m);
	}
	
	public void sendAnnotation(Map<String, Object> annotation) {	
		Map<String, Object> message = new HashMap<String, Object>();		
		roomManager.getRoom(getMeetingId()).addAnnotation(annotation);
		message.put("annotation", annotation);
		ClientMessage m = new ClientMessage(ClientMessage.BROADCAST, getMeetingId(), "WhiteboardNewAnnotationCommand", annotation);
		connInvokerService.sendMessage(m);
	}
	
	public void changePage(int pageNum) {
		Presentation pres = roomManager.getRoom(getMeetingId()).getActivePresentation();
		pres.setActivePage(pageNum);
				
		Map<String, Object> message = new HashMap<String, Object>();		
		message.put("pageNum", pageNum);
		message.put("numAnnotations", pres.getActivePage().getNumShapesOnPage());
		ClientMessage m = new ClientMessage(ClientMessage.BROADCAST, getMeetingId(), "WhiteboardChangePageCommand", message);
		connInvokerService.sendMessage(m);
	}
			
	public void clear() {
		roomManager.getRoom(getMeetingId()).clear();

		Map<String, Object> message = new HashMap<String, Object>();		
		ClientMessage m = new ClientMessage(ClientMessage.BROADCAST, getMeetingId(), "WhiteboardClearCommand", message);
		connInvokerService.sendMessage(m);
		
	}
	
	public void sendShape(double[] shape, String type, int color, int thickness, boolean fill, int fillColor, boolean transparency, String id, String status){
		ShapeGraphic newShape = new ShapeGraphic(shape, type, color, thickness, fill, fillColor, transparency, id, status);	
		
		 /*
		    maintains unique-ness. ensures that only
		 	one entry per shape is added. exception is DrawObject.PENCIL, 
		    because it is a collection of "points".
		 */
		
//		if(status.equals("DRAW_END")) {
//			newShape.ID = Integer.toString(roomManager.getRoom(getLocalScope().getName()).getUniqueWBGraphicIdentifier());
//			roomManager.getRoom(getLocalScope().getName()).addShape(newShape);
//		}
	
//		ISharedObject drawSO = getSharedObject(getLocalScope(), WHITEBOARD_SHARED_OBJECT);
//		List<Object> arguments = newShape.toList();
//		drawSO.sendMessage("addSegment", arguments);
	}
	
	public void sendText(String text, int textColor, int bgColor, boolean bgColorVisible, int x, int y, int textSize, String id, String status){
		TextGraphic newText = new TextGraphic(text, textColor, bgColor, bgColorVisible, x, y, textSize, id, status);	
		
		/*  
		 	maintains unique-ness. ensures that only
	 		one entry per text is added. all other calls must involve the modification of text,
	 		and so they are handled appropriately
	 	*/
		if(status.equals("textCreated")) {
			newText.ID = Integer.toString(roomManager.getRoom(getMeetingId()).getUniqueWBGraphicIdentifier());
//			roomManager.getRoom(getLocalScope().getName()).addText(newText);
		} else {
////			roomManager.getRoom(getLocalScope().getName()).modifyText(newText.ID, newText);
		}
//		ISharedObject drawSO = getSharedObject(getLocalScope(), WHITEBOARD_SHARED_OBJECT);
		List<Object> arguments = newText.toList();
//		drawSO.sendMessage("addText", arguments);
	}
	
	public int getNumGraphicsOnPage(int pageNum){
		Presentation pres = roomManager.getRoom(getMeetingId()).getActivePresentation();
		pres.setActivePage(pageNum);
		return pres.getActivePage().getNumGraphicsOnPage();
	}
	
//	public List<Object[]> getHistory(){
//		List<Object[]> graphicsList = roomManager.getRoom(getMeetingId()).getHistory();
//		for(Object[] o: graphicsList) {
//			System.out.println();
//			for(int i = 0; i < o.length; i++) {
//				System.out.print(" " + i);
//			}
//		}
//		return graphicsList;
//	}
	
//	public void clear(){
//		roomManager.getRoom(getLocalScope().getName()).clear();
//		ISharedObject drawSO = getSharedObject(getLocalScope(), WHITEBOARD_SHARED_OBJECT);
//		drawSO.sendMessage("clear", new ArrayList<Object>());
//	}
	
	public void undo() {
		roomManager.getRoom(getMeetingId()).undo();

		Map<String, Object> message = new HashMap<String, Object>();		
		ClientMessage m = new ClientMessage(ClientMessage.BROADCAST, getMeetingId(), "WhiteboardUndoCommand", message);
		connInvokerService.sendMessage(m);
	}
	
	public void toggleGrid(){
//		System.out.println("toggling grid mode ");
//		roomManager.getRoom(getLocalScope().getName()).toggleGrid();
//		ISharedObject drawSO = getSharedObject(getLocalScope(), WHITEBOARD_SHARED_OBJECT);
//		drawSO.sendMessage("toggleGridCallback", new ArrayList<Object>());
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
			WhiteboardEventRecorder recorder = new WhiteboardEventRecorder(getMeetingId(), recorderApplication);
			roomManager.getRoom(getMeetingId()).addRoomListener(recorder);
			log.debug("event session is " + getMeetingId());
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
		roomManager.addRoom(scope.getName());
    	return true;
	}

	@Override
	public void roomStop(IScope scope) {
		roomManager.removeRoom(scope.getName());
	}
	
	private String getMeetingId(){
		return Red5.getConnectionLocal().getScope().getName();
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
