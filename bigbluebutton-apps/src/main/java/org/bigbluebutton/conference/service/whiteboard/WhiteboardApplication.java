package org.bigbluebutton.conference.service.whiteboard;

import java.util.ArrayList;
import java.util.List;

import org.red5.compatibility.flex.messaging.io.ArrayCollection;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.adapter.IApplication;
import org.red5.server.adapter.MultiThreadedApplicationAdapter;
import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.IScope;
import org.red5.server.api.Red5;
import org.red5.server.api.so.ISharedObject;
import org.slf4j.Logger;

public class WhiteboardApplication extends MultiThreadedApplicationAdapter implements IApplication {
	
	private static Logger log = Red5LoggerFactory.getLogger(WhiteboardApplication.class, "bigbluebutton");
	private static final String APP = "WHITEBOARD";
	public static final String WHITEBOARD_SHARED_OBJECT = "drawSO";
	public static final String PRESENTATION_SHARED_OBJECT = "presentationSO";
	
	private WhiteboardRoomManager roomManager;
	
	@Override
	public boolean appStart(IScope app){
		log.info("Starting Whiteboard Application");
		this.scope = app;
		//roomManager.addRoom(app);
		return true;
	}
	
	public void setRoomManager(WhiteboardRoomManager manager){
		this.roomManager = manager;
	}
	
	@Override
	public void appStop(IScope scope){
		roomManager.removeRoom(getLocalScope().getName());
	}
	
	public void setActivePresentation(String name, int numPages){
		WhiteboardRoom room = roomManager.getRoom(getLocalScope().getName());
		if (room.presentationExists(name)) {
			room.setActivePresentation(name);
			//System.out.println("Presentation " + name + " exists");
		} else {
			room.addPresentation(name, numPages);
			//System.out.println("Presentation " + name + " doesn't exists, setting it as active presentation");
		}
	}
	
	public void enableWhiteboard(boolean enabled){
		roomManager.getRoom(getLocalScope().getName()).setWhiteboardEnabled(enabled);
		ISharedObject drawSO = getSharedObject(getLocalScope(), WHITEBOARD_SHARED_OBJECT);
		List<Boolean> arguments = new ArrayList<Boolean>();
		arguments.add(enabled);
		drawSO.sendMessage("modifyEnabledCallback", arguments);
	}
	
	public boolean isWhiteboardEnabled(){
		return roomManager.getRoom(getLocalScope().getName()).isWhiteboardEnabled();
	}
	
	public void sendShape(double[] shape, String type, int color, int thickness, double parentWidth, double parentHeight){
		Shape newShape = new Shape(shape, type, color, thickness, parentWidth, parentHeight);
		roomManager.getRoom(getLocalScope().getName()).addShape(newShape);
		ISharedObject drawSO = getSharedObject(getLocalScope(), WHITEBOARD_SHARED_OBJECT);
		List<Object> arguments = newShape.toList();
		drawSO.sendMessage("addSegment", arguments);
	}
	
	public int getNumShapesOnPage(int pageNum){
		Presentation pres = roomManager.getRoom(getLocalScope().getName()).getActivePresentation();
		pres.setActivePage(pageNum);
		return pres.getActivePage().getNumShapesOnPage();
	}
	
	public List<Object[]> getShapes(){
		List<Object[]> shapesList = roomManager.getRoom(getLocalScope().getName()).getShapes();
		
		return shapesList;
	}
	
	public void clear(){
		roomManager.getRoom(getLocalScope().getName()).clear();
		ISharedObject drawSO = getSharedObject(getLocalScope(), WHITEBOARD_SHARED_OBJECT);
		drawSO.sendMessage("clear", new ArrayList<Object>());
	}
	
	public void undo(){
		roomManager.getRoom(getLocalScope().getName()).undo();
		ISharedObject drawSO = getSharedObject(getLocalScope(), WHITEBOARD_SHARED_OBJECT);
		drawSO.sendMessage("undo", new ArrayList<Object>());
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
		
	}
	
	private IScope getLocalScope(){
		return Red5.getConnectionLocal().getScope();
	}
	
}
