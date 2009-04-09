
package org.bigbluebutton.conference.service.presentation

import java.util.Map
import org.bigbluebutton.conference.service.archive.record.IEventRecorder
import org.bigbluebutton.conference.service.archive.record.IRecorderimport org.red5.server.api.so.ISharedObject
import org.bigbluebutton.conference.Participant
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory
import groovy.xml.MarkupBuilder

public class PresentationEventRecorder implements IEventRecorder, IPresentationRoomListener {
	private static Logger log = Red5LoggerFactory.getLogger( PresentationEventRecorder.class, "bigbluebutton" )
	
	IRecorder recorder
	private ISharedObject so
	def APP_NAME = 'PRESENTATION'
	
	def acceptRecorder(IRecorder recorder){
		log.debug("Accepting IRecorder")
		this.recorder = recorder
	}
	
	def getName() {
		return APP_NAME
	}
	
	def recordEvent(Map event){
		recorder.recordEvent(event)
	}
	
	public PresentationEventRecorder(ISharedObject so) {
		this.so = so 
	}
	
	def sendUpdateMessage = {message ->
		Map <String, Object> update = new HashMap<String, Object>();

		switch (message['code']) {
			case 'SUCCESS':
			case 'UPDATE':
			case 'FAILED':
				update.put('returnCode', message['code'])
				update.put("message", message['message'])
				break
			case 'EXTRACT':
			case 'CONVERT':
				update.put('returnCode', message['code'])
				update.put("totalSlides", message['totalSlides'])
				update.put("completedSlides", message['completedSlides'])
				break		
		}

		so.setAttribute("updateMessage", update)
	}
	
	def assignPresenter = {userid, name, assignedBy ->	
		log.debug("calling assignPresenterCallback $userid, $name $assignedBy")
		so.sendMessage("assignPresenterCallback", [userid, name, assignedBy])	
			
		def writer = new StringWriter()
		def xml = new MarkupBuilder(writer)
		xml.event(name:'assignPresenter', date:new Date().time, application:APP_NAME) {
			presenter(userid:userid, name:name, assignedBy:assignedBy)
		}
		recorder.recordXmlEvent(writer.toString())
	}
	
	def gotoSlide = {slide ->
		log.debug("calling gotoSlideCallback $slide")
		so.sendMessage("gotoSlideCallback", [slide])	
		
		def writer = new StringWriter()
		def xml = new MarkupBuilder(writer)
		xml.event(name:'gotoSlide', date:new Date().time, application:APP_NAME, slide:slide)
		recorder.recordXmlEvent(writer.toString())
	}
	
	def sharePresentation = {presentationName, share ->
		log.debug("calling sharePresentationCallback $presentationName $share")
	
		so.sendMessage("sharePresentationCallback", [presentationName, share])	
		
		def writer = new StringWriter()
		def xml = new MarkupBuilder(writer)
		xml.event(name:'sharePresentation', date:new Date().time, application:APP_NAME) {
			presentation(name:presentationName, share:share)
		}
		recorder.recordXmlEvent(writer.toString())
	}
}
