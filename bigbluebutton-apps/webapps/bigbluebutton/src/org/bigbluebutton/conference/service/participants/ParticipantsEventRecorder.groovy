
package org.bigbluebutton.conference.service.participants

import java.util.Map
import org.bigbluebutton.conference.service.archive.record.IEventRecorder
import org.bigbluebutton.conference.service.archive.record.IRecorder
import org.bigbluebutton.conference.IRoomListenerimport org.red5.server.api.so.ISharedObject
import org.bigbluebutton.conference.Participant
import org.slf4j.Logger
import org.slf4j.LoggerFactory

public class ParticipantsEventRecorder implements IEventRecorder, IRoomListener {
	protected static Logger log = LoggerFactory.getLogger( ParticipantsEventRecorder.class )
	
	IRecorder recorder
	private ISharedObject so
	def name = 'PARTICIPANT'
	
	def acceptRecorder(IRecorder recorder){
		log.debug("Accepting IRecorder")
		this.recorder = recorder
	}
	
	def getName() {
		return name
	}
	
	def recordEvent(Map event){
		recorder.recordEvent(event)
	}
	
	public ParticipantsEventRecorder(ISharedObject so) {
		this.so = so 
	}
	
	public void participantStatusChange(Long userid, String status, Object value){
		log.debug("A participant's status has changed ${userid} $status $value.")
		so.sendMessage("participantStatusChange", [userid, status, value])
		
		Map event = new HashMap()
		event.put("date", new Date().time)
		event.put("application", name)
		event.put("event", "participantStatusChange")
		event.put("userid", userid)
		event.put("status", status)
		event.put("value", value)
		recordEvent(event)
	}
	
	public void participantJoined(Participant p) {
		log.debug("A participant has joined ${p.userid}.")
		List args = new ArrayList()
		args.add(p.toMap())
		log.debug("Sending participantJoined ${p.userid} to client.")
		so.sendMessage("participantJoined", args)
		
		Map event = new HashMap()
		event.put("date", new Date().time)
		event.put("application", name)
		event.put("event", "participantJoined")
		event.put("user", p.toMap())
		log.debug("Recording participantJoined ${p.userid}.")
		recordEvent(event)
	}
	
	public void participantLeft(Long userid) {		
		List args = new ArrayList()
		args.add(userid)
		so.sendMessage("participantLeft", args)
		
		Map event = new HashMap()
		event.put("date", new Date().time)
		event.put("application", name)
		event.put("event", "participantLeft")
		event.put("userid", userid)
		recordEvent(event)
	}
}
