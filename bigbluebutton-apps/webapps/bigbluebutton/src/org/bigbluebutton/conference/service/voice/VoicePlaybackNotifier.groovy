
package org.bigbluebutton.conference.service.voice

import java.util.Map
import org.bigbluebutton.conference.service.archive.playback.IPlaybackNotifier
import org.red5.server.api.so.ISharedObjectimport org.slf4j.Logger
import org.slf4j.LoggerFactory

public class VoicePlaybackNotifier implements IPlaybackNotifier{
	protected static Logger log = LoggerFactory.getLogger( VoicePlaybackNotifier.class )
	
	private ISharedObject so
	def name = 'VOICE'
	
	public VoicePlaybackNotifier(ISharedObject so) {
		this.so = so
	}
	
	def sendMessage(Map event){
		log.debug("Playing event " + event['event'])
		switch (event['event']) {
		case 'joined':
			joined(event['participant'], event['name'], event['muted'], event['talking'])
			break
		case 'left':
			left(event['participant'])
			break
		case 'mute':
			mute(event['participant'], event['mute'])
			break
		case 'talk':
			talk(event['participant'], event['talk'])
			break
		}
	}
	
	def notifierName(){
		return name
	}
	
	def joined(participant, name, muted, talking){
		log.debug("Participant $name joining")
		
		// Just send the name to represent callerId number for now
		so.sendMessage("userJoin", [participant, name, name, muted, talking])		
	}
	
	def left(participant){
		log.debug("Participant $participant leaving")
		so.sendMessage("userLeft", [participant])
	}
	
	def mute(participant, mute){
		log.debug("Participant $participant mute $mute")
		so.sendMessage("userMute", [participant, mute])
	}
	

	def talk(participant, talk){
		log.debug("Participant $participant talk $talk")
		so.sendMessage("userTalk", [participant, talk])
	}
}
