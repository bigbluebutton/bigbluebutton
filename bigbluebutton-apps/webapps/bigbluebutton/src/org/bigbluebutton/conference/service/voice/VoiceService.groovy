package org.bigbluebutton.conference.service.voice
import org.slf4j.Loggerimport org.slf4j.LoggerFactoryimport org.red5.server.api.Red5import org.red5.server.api.IScopeimport org.bigbluebutton.conference.BigBlueButtonSessionimport org.bigbluebutton.conference.Constantsimport org.red5.logging.Red5LoggerFactory
public class VoiceService {
	
	private static Logger log = Red5LoggerFactory.getLogger( VoiceService.class, "bigbluebutton" );
	
	private VoiceApplication application
	private IVoiceServer voiceServer

	public Map<String, List> getMeetMeUsers() {
		def sessionName = getBbbSession().sessionName
		
    	log.debug("GetMeetmeUsers request for room[$sessionName]")
    	Map p = application.participants(sessionName)

		Map participants = new HashMap()
		if (p == null) {
			participants.put("count", 0)
		} else {		
			participants.put("count", p.size())
			if (p.size() > 0) { 
				participants.put("participants", p)
			}			
		}
		log.info("MeetMe::service - Sending " + p.size() + " current users...");
		return participants
	}
	
	def muteAllUsers(mute) {
		def conference = getBbbSession().voiceBridge    	
    	log.debug("Mute all users in room[$conference]")
    	voiceServer.mute(conference, mute)	   	
	}	
	
	def muteUnmuteUser(userid, mute) {
		def conference = getBbbSession().voiceBridge    	
    	log.debug("MuteUnmute request for user [$userid] in room[$conference]")
    	voiceServer.mute(userid, conference, mute)
	}
	
	def kickUSer(userid) {
		def conference = getBbbSession().voiceBridge		
    	log.debug("KickUser $userid from $conference")		
		voiceServer.kick(userid, conference)
	}
	
	public void setVoiceApplication(VoiceApplication a) {
		log.debug("Setting Voice Applications")
		application = a
	}
	
	public void setIVoiceServer(IVoiceServer s) {
		log.debug("Setting voice server")
		voiceServer = s
		log.debug("Setting voice server DONE")
	}
	
	private BigBlueButtonSession getBbbSession() {
		return Red5.connectionLocal.getAttribute(Constants.SESSION)
	}
}
