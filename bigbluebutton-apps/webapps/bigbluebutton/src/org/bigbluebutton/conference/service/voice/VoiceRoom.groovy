
package org.bigbluebutton.conference.service.voice

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import net.jcip.annotations.ThreadSafeimport java.util.concurrent.ConcurrentHashMapimport java.util.concurrent.CopyOnWriteArrayListimport java.util.Collectionsimport java.util.Iteratorimport org.red5.logging.Red5LoggerFactory
/**
 * Contains information about a Room. 
 */
@ThreadSafe
public class VoiceRoom {
	private static Logger log = Red5LoggerFactory.getLogger( VoiceRoom.class, "bigbluebutton" )
	
	private final String name
	private final Map<String, IVoiceRoomListener> listeners
	private final Map<String, HashMap> participants
	
	private String conference
	
	public VoiceRoom(String name) {
		this.name = name
		listeners   = new ConcurrentHashMap<String, IVoiceRoomListener>()
		participants = new ConcurrentHashMap<String, HashMap>()
	}
	
	public String getName() {
		return name
	}
	
	public void setConference(String c) {
		conference = c
	}
	
	public String getConference() {
		return conference
	}
	
	public void addRoomListener(IVoiceRoomListener listener) {
		if (! listeners.containsKey(listener.getName())) {
			log.debug("adding room listener")
			listeners.put(listener.getName(), listener)			
		}
	}
	
	public void removeRoomListener(IVoiceRoomListener listener) {
		log.debug("removing room listener")
		listeners.remove(listener)		
	}
	
	def joined(participant, name, muted, talking){
		Map p = new HashMap()
		p.put('participant', participant)
		p.put('name', name)
		p.put('muted', muted)
		p.put('talking', talking)
		participants.put(participant, p)
		
		for (Iterator iter = listeners.values().iterator(); iter.hasNext();) {
			log.debug("calling on listener")
			IVoiceRoomListener listener = (IVoiceRoomListener) iter.next()
			log.debug("calling joined on listener ${listener.getName()}")
			listener.joined(participant, name, muted, talking)
		}
	}
	
	def left(participant){
		Map p = (HashMap) participants.remove(participant)
		log.debug "User left $p"
		
		for (Iterator iter = listeners.values().iterator(); iter.hasNext();) {
			log.debug("calling on listener")
			IVoiceRoomListener listener = (IVoiceRoomListener) iter.next()
			log.debug("calling left on listener ${listener.getName()}")
			listener.left(participant)
		}
	}
	
	def mute(participant, mute){
		log.debug("mute: $participant $mute")
		Map p = (HashMap) participants.get(participant)
		p.put('muted', mute)
		log.debug "Muted participant $p"
		
		for (Iterator iter = listeners.values().iterator(); iter.hasNext();) {
			log.debug("calling on listener")
			IVoiceRoomListener listener = (IVoiceRoomListener) iter.next()
			log.debug("calling mute on listener ${listener.getName()}")
			listener.mute(participant, mute)
		}
	}
	

	def talk(participant, talk){
		log.debug("talk: $participant $talk")
		Map p = (HashMap) participants.get(participant)
		p.put('talking', talk)
		for (Iterator iter = listeners.values().iterator(); iter.hasNext();) {
			log.debug("calling on listener")
			IVoiceRoomListener listener = (IVoiceRoomListener) iter.next()
			log.debug("calling talk on listener ${listener.getName()}")
			listener.talk(participant, talk)
		}
	}	
	
	def participants() {
		return new HashMap(participants)
	}
}
