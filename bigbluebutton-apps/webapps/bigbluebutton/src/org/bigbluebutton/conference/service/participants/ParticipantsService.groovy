
package org.bigbluebutton.conference.service.participants

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.server.api.Red5import java.util.Mapimport org.bigbluebutton.conference.Participant
public class ParticipantsService {

	protected static Logger log = LoggerFactory.getLogger( ParticipantsService.class );	
	private ParticipantsApplication application

	public Map getParticipants() {
		String roomName = Red5.connectionLocal.scope.name
		log.debug("getting participants for ${roomName}")
		Map p = application.getParticipants(roomName)
		log.debug("getting participants for ${roomName}")
		Map participants = new HashMap()
		if (p == null) {
			participants.put("count", 0)
		} else {		
			participants.put("count", p.size())
			if (p.size() > 0) {
				/**
				 * Somehow we need to convert to Map so the client will be
				 * able to decode it. Need to figure out if we can send Participant
				 * directly. (ralam - 2/20/2009)
				 */
				Collection pc = p.values()
	    		Map pm = new HashMap()
	    		for (Iterator it = pc.iterator(); it.hasNext();) {
	    			Participant ap = (Participant) it.next();
	    			pm.put(ap.userid, ap.toMap()); 
	    		}  
				participants.put("participants", pm)
			}			
		}
		return participants
	}
	
	def setParticipantStatus(def userid, def status, def value) {
		String roomName = Red5.connectionLocal.scope.name
		log.debug("Setting participant status $roomName $userid $status $value")
		application.setParticipantStatus(roomName, userid, status, value)
	}
	
	public void setParticipantsApplication(ParticipantsApplication a) {
		log.debug("Setting Participants Applications")
		application = a
	}
}
