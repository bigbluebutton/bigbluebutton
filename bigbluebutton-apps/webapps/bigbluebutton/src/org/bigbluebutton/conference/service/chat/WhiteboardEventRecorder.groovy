
package org.bigbluebutton.conference.service.whiteboard

import java.util.Map
import org.bigbluebutton.conference.service.archive.record.IEventRecorder
import org.bigbluebutton.conference.service.archive.record.IRecorder
import org.bigbluebutton.conference.service.whiteboard.IWhiteboardRoomListenerimport org.bigbluebutton.conference.Participant
import org.red5.server.api.so.ISharedObject
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory
import groovy.xml.MarkupBuilder

public class WhiteboardEventRecorder implements IEventRecorder, IWhiteboardRoomListener {
	private static Logger log = Red5LoggerFactory.getLogger( WhiteboardEventRecorder.class, "bigbluebutton" )
	
	IRecorder recorder
	private ISharedObject so
	def name = 'WHITEBOARD'
	
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
	
	public WhiteboardEventRecorder(ISharedObject so) {
		this.so = so 
	}
	
	def newWhiteboardMessage(msg) {
		log.debug("WhiteboardEventRecorder::newWhiteboardMessage ... msg=" + msg)
		log.debug("so=" + so.getClass().getName())
		so.sendMessage("newWhiteboardMessage", [msg])
		
		def writer = new StringWriter()
		def xml = new MarkupBuilder(writer)
		xml.event(name:'newWhiteboardMessage', date:new Date().time, application:name) {
			message(msg)
		}
		recorder.recordXmlEvent(writer.toString())
	}

}
