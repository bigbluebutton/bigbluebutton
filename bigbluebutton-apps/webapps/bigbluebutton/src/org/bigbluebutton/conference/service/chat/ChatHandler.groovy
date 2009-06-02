
package org.bigbluebutton.conference.service.chat

import org.red5.server.adapter.IApplication
import org.red5.server.api.IClient
import org.red5.server.api.IConnection
import org.red5.server.api.IScope
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory

import org.red5.server.api.so.ISharedObject
import org.red5.server.adapter.ApplicationAdapter
import org.red5.server.api.Red5import java.util.Mapimport org.bigbluebutton.conference.service.chat.ChatRoomsManager
import org.bigbluebutton.conference.service.chat.ChatRoomimport org.bigbluebutton.conference.BigBlueButtonSessionimport org.bigbluebutton.conference.Constantsimport org.bigbluebutton.conference.service.archive.ArchiveApplication
public class ChatHandler extends ApplicationAdapter implements IApplication{
	private static Logger log = Red5LoggerFactory.getLogger( ChatHandler.class, "bigbluebutton" )

	private static final String CHAT = "CHAT"
	private static final String CHAT_SO = "chatSO"   
	private static final String APP = "CHAT"

	private ArchiveApplication archiveApplication
	private ChatApplication chatApplication
	
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
		if (getBbbSession().playbackMode()) {
			log.debug("In playback mode")
			ISharedObject so = getSharedObject(connection.scope, CHAT_SO)
			ChatPlaybackNotifier notifier = new ChatPlaybackNotifier(so)
			archiveApplication.addPlaybackNotifier(connection.scope.name, notifier)
		} else {
			log.debug("In live mode")
			ISharedObject so = getSharedObject(connection.scope, CHAT_SO)
			log.debug("Setting up recorder")
			ChatEventRecorder recorder = new ChatEventRecorder(so, getBbbSession().record)
			log.debug("adding event recorder to ${connection.scope.name}")
			archiveApplication.addEventRecorder(connection.scope.name, recorder)
			log.debug("Adding room listener")
    		chatApplication.addRoomListener(connection.scope.name, recorder)
    		log.debug("Done setting up recorder and listener")
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
		chatApplication.createRoom(scope.name)
    	if (!hasSharedObject(scope, CHAT_SO)) {
    		if (createSharedObject(scope, CHAT_SO, false)) {    			
    			return true 			
    		}    		
    	}  	
		log.error("Failed to start room ${scope.name}")
    	return false;
	}

	@Override
	public void roomStop(IScope scope) {
		log.debug("${APP}:roomStop ${scope.name}")
		chatApplication.destroyRoom(scope.name)
		if (!hasSharedObject(scope, CHAT_SO)) {
    		clearSharedObjects(scope, CHAT_SO)
    	}
	}
	
	public void setChatApplication(ChatApplication a) {
		log.debug("Setting chat application")
		chatApplication = a
	}
	
	public void setArchiveApplication(ArchiveApplication a) {
		log.debug("Setting archive application")
		archiveApplication = a
	}
	
	private BigBlueButtonSession getBbbSession() {
		return Red5.connectionLocal.getAttribute(Constants.SESSION)
	}
}
