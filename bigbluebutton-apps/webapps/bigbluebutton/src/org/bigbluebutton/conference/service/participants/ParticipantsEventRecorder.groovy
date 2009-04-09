
package org.bigbluebutton.conference.service.participants

import java.util.Map
import org.bigbluebutton.conference.service.archive.record.IEventRecorder
import org.bigbluebutton.conference.service.archive.record.IRecorder
import org.bigbluebutton.conference.IRoomListenerimport org.red5.server.api.so.ISharedObject
import org.bigbluebutton.conference.Participant
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory
import groovy.xml.MarkupBuilder

public class ParticipantsEventRecorder implements IEventRecorder, IRoomListener {
	private static Logger log = Red5LoggerFactory.getLogger( ParticipantsEventRecorder.class, "bigbluebutton" )
	
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
		
		def writer = new StringWriter()
		def xml = new MarkupBuilder(writer)
		xml.event(name:'participantStatusChange', date:new Date().time, application:name) {
			participant(id:userid, status:status, value:value)
		}

		recorder.recordXmlEvent(writer.toString())
	}
	
	public void participantJoined(Participant p) {
		log.debug("A participant has joined ${p.userid}.")
		List args = new ArrayList()
		args.add(p.toMap())
		log.debug("Sending participantJoined ${p.userid} to client.")
		so.sendMessage("participantJoined", args)
		
		def writer = new StringWriter()
		def xml = new MarkupBuilder(writer)
		xml.event(name:'participantJoined', date:new Date().time, application:name) {
			participant(id:p.userid, name:p.name, role:p.role) {
				statuses() {
					for (key in p.status.keySet()) {
						status(name:key, value:p.status.get(key))
					}
				}
			}
		}
		recorder.recordXmlEvent(writer.toString())
	}
	
	public void participantLeft(Long userid) {		
		List args = new ArrayList()
		args.add(userid)
		so.sendMessage("participantLeft", args)
		
		def writer = new StringWriter()
		def xml = new MarkupBuilder(writer)
		xml.event(name:'participantLeft', date:new Date().time, application:name) {
			participant(id:userid)
		}
		recorder.recordXmlEvent(writer.toString())
	}
}
