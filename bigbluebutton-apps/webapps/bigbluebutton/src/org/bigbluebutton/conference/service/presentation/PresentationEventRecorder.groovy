
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
	private final Boolean record
	
	def APP_NAME = 'PRESENTATION'
	
	def acceptRecorder(IRecorder recorder){
		log.debug("Accepting IRecorder")
		this.recorder = recorder
	}
	
	def getName() {
		return APP_NAME
	}
	
	def recordEvent(Map event){
		if (record) {
			recorder.recordEvent(event)
		}
	}
	
	public PresentationEventRecorder(ISharedObject so, Boolean record) {
		this.so = so 
		this.record = record
	}
	
	def sendUpdateMessage = {message ->
		Map <String, Object> update = new HashMap<String, Object>();

		switch (message['code']) {
			case 'SUCCESS':
				update.put('returnCode', message['code'])
				update.put("presentationName", message['presentationName'])
				update.put("message", message['message'])
				break
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

		log.debug "Send SO message $update"
		so.setAttribute("updateMessage", update)
	}
	
	def assignPresenter = {userid, name, assignedBy ->	
		log.debug("calling assignPresenterCallback $userid, $name $assignedBy")
		so.sendMessage("assignPresenterCallback", [userid, name, assignedBy])	
		
		/* Comment out for now (ralam 4/17/2009)
		def writer = new StringWriter()
		def xml = new MarkupBuilder(writer)
		xml.event(name:'assignPresenter', date:new Date().time, application:APP_NAME) {
			presenter(userid:userid, name:name, assignedBy:assignedBy)
		}
		recorder.recordXmlEvent(writer.toString())
		*/
		
		Map event = new HashMap()
		event.put("date", new Date().time)
		event.put("application", APP_NAME)
		event.put("event", "assignPresenter")
		event.put("userid", userid)
		event.put("name", name)
		event.put("assignedBy", assignedBy)
		recordEvent(event)	
	}
	
	def gotoSlide = {slide ->
		log.debug("calling gotoSlideCallback $slide")
		so.sendMessage("gotoSlideCallback", [slide])	
		
		/* Comment out for now (ralam 4/17/2009)
		def writer = new StringWriter()
		def xml = new MarkupBuilder(writer)
		xml.event(name:'gotoSlide', date:new Date().time, application:APP_NAME, slide:slide)
		recorder.recordXmlEvent(writer.toString())
		*/
		
		Map event = new HashMap()
		event.put("date", new Date().time)
		event.put("application", APP_NAME)
		event.put("event", "gotoSlide")
		event.put("slide", slide)
		recordEvent(event)
	}
	
	def sharePresentation = {presentationName, share ->
		log.debug("calling sharePresentationCallback $presentationName $share")
	
		so.sendMessage("sharePresentationCallback", [presentationName, share])	
		
		/* Comment out for now (ralam 4/17/2009)
		def writer = new StringWriter()
		def xml = new MarkupBuilder(writer)
		xml.event(name:'sharePresentation', date:new Date().time, application:APP_NAME) {
			presentation(name:presentationName, share:share)
		}
		recorder.recordXmlEvent(writer.toString())
		*/
		
		Map event = new HashMap()
		event.put("date", new Date().time)
		event.put("application", APP_NAME)
		event.put("event", "sharePresentation")
		event.put("presentationName", presentationName)
		event.put("share", share)
		recordEvent(event)
	}
}
