
package org.bigbluebutton.conference.service.whiteboard

import org.red5.server.adapter.IApplication
import org.red5.server.api.IClient
import org.red5.server.api.IConnection
import org.red5.server.api.IScope
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory

import org.red5.server.api.so.ISharedObject
import org.red5.server.adapter.ApplicationAdapter
import org.red5.server.api.Red5import java.util.Mapimport org.bigbluebutton.conference.service.whiteboard.WhiteboardRoomsManager
import org.bigbluebutton.conference.service.whiteboard.WhiteboardRoomimport org.bigbluebutton.conference.BigBlueButtonSessionimport org.bigbluebutton.conference.Constantsimport org.bigbluebutton.conference.service.archive.ArchiveApplication
public class WhiteboardHandler extends ApplicationAdapter implements IApplication{
	private static Logger log = Red5LoggerFactory.getLogger( WhiteboardHandler.class, "bigbluebutton" )

	private static final String WHITEBOARD = "WHITEBOARD"
	private static final String WHITEBOARD_SO = "whiteboardSO"   
	private static final String APP = "WHITEBOARD"

	private ArchiveApplication archiveApplication
	private WhiteboardApplication whiteboardApplication
	
	@Override
	public boolean appConnect(IConnection conn, Object[] params) {
		log.debug("${APP}:appConnect")
		return true
	}

	@Override
	public void appDisconnect(IConnection conn) {
		log.debug( "${APP}:appDisconnect")
	}

	@Override
	public boolean appJoin(IClient client, IScope scope) {
		log.debug( "${APP}:appJoin ${scope.name}")
		return true
	}

	@Override
	public void appLeave(IClient client, IScope scope) {
		log.debug("${APP}:appLeave ${scope.name}")

	}

	@Override
	public boolean appStart(IScope scope) {
		log.debug("${APP}:appStart ${scope.name}")
		return true;
	}

	@Override
	public void appStop(IScope scope) {
		log.debug("${APP}:appStop ${scope.name}")
	}

	@Override
	public boolean roomConnect(IConnection connection, Object[] params) {
		log.debug("${APP}:roomConnect")
		if (getBigBlueButtonSession().playbackMode()) 
		{
			log.debug("WhiteboardHandler.groovy::roomConnect ... In playback mode")
			ISharedObject so = getSharedObject(connection.scope, WHITEBOARD_SO)
			WhiteboardPlaybackNotifier notifier = new WhiteboardPlaybackNotifier(so)
			archiveApplication.addPlaybackNotifier(connection.scope.name, notifier)
		} else 
		{
			log.debug("WhiteboardHandler.groovy::roomConnect ... In live mode")
			ISharedObject so = getSharedObject(connection.scope, WHITEBOARD_SO)
			log.debug("WhiteboardHandler.groovy::roomConnect ... Setting up recorder")
			WhiteboardEventRecorder recorder = new WhiteboardEventRecorder(so)
			log.debug("WhiteboardHandler.groovy::roomConnect ... adding event recorder to ${connection.scope.name}")
			archiveApplication.addEventRecorder(connection.scope.name, recorder)
			log.debug("WhiteboardHandler.groovy::roomConnect ... Adding room listener")
    		whiteboardApplication.addRoomListener(connection.scope.name, recorder)
    		log.debug("WhiteboardHandler.groovy::roomConnect ... Done setting up recorder and listener")
		}
    	return true;
	}

	@Override
	public void roomDisconnect(IConnection connection) {
		log.debug("${APP}:roomDisconnect")

	}

	@Override
	public boolean roomJoin(IClient client, IScope scope) {
		log.debug("${APP}:roomJoin ${scope.name} - ${scope.parent.name}")
		return true;
	}

	@Override
	public void roomLeave(IClient client, IScope scope) {
		log.debug("${APP}:roomLeave ${scope.name}")
	}

	@Override
	public boolean roomStart(IScope scope) {
		log.debug("${APP} - roomStart ${scope.name}")
		whiteboardApplication.createRoom(scope.name)
    	if (!hasSharedObject(scope, WHITEBOARD_SO)) {
    		if (createSharedObject(scope, WHITEBOARD_SO, false)) {    			
    			return true 			
    		}    		
    	}  	
		log.error("Failed to start room ${scope.name}")
    	return false;
	}

	@Override
	public void roomStop(IScope scope) {
		log.debug("${APP}:roomStop ${scope.name}")
		whiteboardApplication.destroyRoom(scope.name)
		if (!hasSharedObject(scope, WHITEBOARD_SO)) {
    		clearSharedObjects(scope, WHITEBOARD_SO)
    	}
	}
	
	public void setWhiteboardApplication(WhiteboardApplication a) {
		log.debug("Setting whiteboard application")
		whiteboardApplication = a
	}
	
	public void setArchiveApplication(ArchiveApplication a) {
		log.debug("Setting archive application")
		archiveApplication = a
	}
	
	private BigBlueButtonSession getBigBlueButtonSession() {
		return Red5.connectionLocal.getAttribute(Constants.SESSION)
	}
}
