
package org.bigbluebutton.conference.service.participants

import org.red5.server.adapter.IApplication
import org.red5.server.api.IClient
import org.red5.server.api.IConnection
import org.red5.server.api.IScope
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory

import org.red5.server.api.so.ISharedObject
import org.red5.server.adapter.ApplicationAdapter
import org.red5.server.api.Red5import java.util.Mapimport org.bigbluebutton.conference.RoomsManager
import org.bigbluebutton.conference.Roomimport org.bigbluebutton.conference.Participantimport org.bigbluebutton.conference.RoomListenerimport org.bigbluebutton.conference.BigBlueButtonSessionimport org.bigbluebutton.conference.Constantsimport org.bigbluebutton.conference.service.archive.ArchiveApplication
public class ParticipantsHandler extends ApplicationAdapter implements IApplication{
	private static Logger log = Red5LoggerFactory.getLogger( ParticipantsHandler.class, "bigbluebutton" )

	private static final String PARTICIPANTS = "PARTICIPANTS"
	private static final String PARTICIPANTS_SO = "participantsSO"   
	private static final String APP = "PARTICIPANTS"

	private ParticipantsApplication participantsApplication
	private ArchiveApplication archiveApplication
	
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
			ISharedObject so = getSharedObject(connection.scope, PARTICIPANTS_SO)
			ParticipantPlaybackNotifier notifier = new ParticipantPlaybackNotifier(so)
			archiveApplication.addPlaybackNotifier(connection.scope.name, notifier)
			// add the playback notifier with so
		} else {
			log.debug("In live mode")
			ISharedObject so = getSharedObject(connection.scope, PARTICIPANTS_SO)
			
			log.debug "Setting up recorder with recording {}", getBbbSession().record
			ParticipantsEventRecorder recorder = new ParticipantsEventRecorder(so, getBbbSession().record)
			log.debug("adding event recorder to ${connection.scope.name}")
			archiveApplication.addEventRecorder(connection.scope.name, recorder)				
			
			log.debug("Adding room listener")
    		participantsApplication.addRoomListener(connection.scope.name, recorder)
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
		if (getBbbSession().playbackMode()) {
			log.debug("In playback mode, so not joining the conference room.")
		} else {
			participantJoin();
		}
		return true;
	}

	@Override
	public void roomLeave(IClient client, IScope scope) {
		log.debug("${APP}:roomLeave ${scope.name}")
		BigBlueButtonSession bbbSession = getBbbSession()
		if (bbbSession == null) {
			log.debug("roomLeave - session is null") 
		} else {
			log.debug("roomLeave - session is NOT null")
		}
		if (getBbbSession().playbackMode()) {
			log.debug("In playback mode, so not leaving the conference room.")
		} else {
			Long userid = bbbSession.userid
			participantsApplication.participantLeft(bbbSession.sessionName, userid)
		}
	}

	@Override
	public boolean roomStart(IScope scope) {
		log.debug("${APP} - roomStart ${scope.name}")
    	// create ParticipantSO if it is not already created
    	if (!hasSharedObject(scope, PARTICIPANTS_SO)) {
    		if (createSharedObject(scope, PARTICIPANTS_SO, false)) {    			
    			return true 			
    		}    		
    	}  	
		log.error("Failed to start room ${scope.name}")
    	return false;
	}

	@Override
	public void roomStop(IScope scope) {
		log.debug("${APP}:roomStop ${scope.name}")
		if (!hasSharedObject(scope, PARTICIPANTS_SO)) {
    		clearSharedObjects(scope, PARTICIPANTS_SO)
    	}
	}
	
	public boolean participantJoin() {
		log.debug("${APP}:participantJoin - getting userid")
		BigBlueButtonSession bbbSession = getBbbSession()
		if (bbbSession == null) {
			log.warn("bbb session is null")
		}
		
		Long userid = bbbSession.userid
		log.debug("${APP}:participantJoin - userid $userid")
		def username = bbbSession.username
		log.debug("${APP}:participantJoin - username $username")
		def role = bbbSession.role
		log.debug("${APP}:participantJoin - role $role")
		def room = bbbSession.room
		log.debug("${APP}:participantJoin - room $room")
		
		log.debug("${APP}:participantJoin")
		Map status = new HashMap()
		status.put("raiseHand", false)
		status.put("presenter", false)
		status.put("hasStream", false)
		
		log.debug("${APP}:participantJoin setting status")		
		return participantsApplication.participantJoin(room, userid, username, role, status)
	}
	
	public void setParticipantsApplication(ParticipantsApplication a) {
		log.debug("Setting participants application")
		participantsApplication = a
	}
	
	public void setArchiveApplication(ArchiveApplication a) {
		log.debug("Setting archive application")
		archiveApplication = a
	}
	
	private BigBlueButtonSession getBbbSession() {
		return Red5.connectionLocal.getAttribute(Constants.SESSION)
	}
}
