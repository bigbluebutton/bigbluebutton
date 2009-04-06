
package org.bigbluebutton.conference.service.voice

import java.util.Map
import org.bigbluebutton.conference.service.archive.record.IEventRecorder
import org.bigbluebutton.conference.service.archive.record.IRecorderimport org.red5.server.api.so.ISharedObject
import org.bigbluebutton.conference.Participant
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory
public class VoiceEventRecorder implements IEventRecorder, IVoiceRoomListener {
	private static Logger log = Red5LoggerFactory.getLogger( VoiceEventRecorder.class, "bigbluebutton" )
	
	IRecorder recorder
	private ISharedObject so
	def recorderName = 'VOICE'
	
	def acceptRecorder(IRecorder recorder){
		log.debug("Accepting IRecorder")
		this.recorder = recorder
	}
	
	def getName() {
		return recorderName
	}
	
	def recordEvent(Map event){
		recorder.recordEvent(event)
	}
	
	public VoiceEventRecorder(ISharedObject so) {
		this.so = so 
	}
	
	def joined(participant, name, muted, talking){
		log.debug("Participant $name joining")
		// Just send the name to represent callerId number for now
		so.sendMessage("userJoin", [participant, name, name, muted, talking])
					
		Map event = new HashMap()
		event.put("date", new Date().time)
		event.put("application", recorderName)
		event.put("event", "joined")
		event.put('participant', participant)
		event.put('name', name)
		event.put('muted', muted)
		event.put('talking', talking)
		recordEvent(event)		
	}
	
	def left(participant){
		log.debug("Participant $participant leaving")
		so.sendMessage("userLeft", [participant])

		Map event = new HashMap()
		event.put("date", new Date().time)
		event.put("application", recorderName)
		event.put("event", "left")
		event.put('participant', participant)
		recordEvent(event)	
	}
	
	def mute(participant, mute){
		log.debug("Participant $participant mute $mute")
		so.sendMessage("userMute", [participant, mute])

		Map event = new HashMap()
		event.put("date", new Date().time)
		event.put("application", recorderName)
		event.put("event", "mute")
		event.put('participant', participant)
		event.put('mute', mute)
		recordEvent(event)	
	}
	

	def talk(participant, talk){
		log.debug("Participant $participant talk $talk")
		so.sendMessage("userTalk", [participant, talk])

		Map event = new HashMap()
		event.put("date", new Date().time)
		event.put("application", recorderName)
		event.put("event", "talk")
		event.put('participant', participant)
		event.put('talk', talk)
		recordEvent(event)
	}
}
