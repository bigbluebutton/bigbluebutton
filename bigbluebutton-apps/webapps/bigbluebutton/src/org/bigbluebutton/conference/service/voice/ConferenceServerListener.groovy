
package org.bigbluebutton.conference.service.voice

import org.slf4j.Logger
import org.slf4j.LoggerFactory

public class ConferenceServerListener implements IConferenceServerListener{
	protected static Logger log = LoggerFactory.getLogger( ConferenceServerListener.class )
	
	private VoiceApplication voiceApplication
	
	def joined(room, participant, name, muted, talking){
		log.debug("joined: $room $participant $name $muted $talking")
		voiceApplication.joined(room, participant, name, muted, talking)
	}
	

	def left(room, participant){
		log.debug("left: $room $participant")
		voiceApplication.left(room, participant)
	}
	

	def mute(participant, room, mute){
		log.debug("mute: $participant $room $mute")
		voiceApplication.mute(participant, room, mute)
	}
	

	def talk(participant, room, talk){
		log.debug("talk: $participant $room $talk")
		voiceApplication.talk(participant, room, talk)
	}
	
	public void setVoiceApplication(VoiceApplication a) {
		log.debug('setting voice application')
		voiceApplication = a
		log.debug('setting voice application DONE')
	}
}
