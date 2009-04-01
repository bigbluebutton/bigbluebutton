
package org.bigbluebutton.conference.service.presentation

import java.util.Map
import org.bigbluebutton.conference.service.archive.record.IEventRecorder
import org.bigbluebutton.conference.service.archive.record.IRecorderimport org.red5.server.api.so.ISharedObject
import org.bigbluebutton.conference.Participant
import org.slf4j.Logger
import org.slf4j.LoggerFactory

public class PresentationEventRecorder implements IEventRecorder, IPresentationRoomListener {
	protected static Logger log = LoggerFactory.getLogger( PresentationEventRecorder.class )
	
	IRecorder recorder
	private ISharedObject so
	def name = 'PRESENTATION'
	
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
			
		Map event = new HashMap()
		event.put("date", new Date().time)
		event.put("application", name)
		event.put("event", "assignPresenter")
		event.put("userid", userid)
		event.put("name", name)
		event.put("assignedBy", assignedBy)
		recordEvent(event)	
	}
	
	def gotoSlide = {slide ->
		log.debug("calling gotoSlideCallback $slide")
	
		so.sendMessage("gotoSlideCallback", [slide])	
		
		Map event = new HashMap()
		event.put("date", new Date().time)
		event.put("application", name)
		event.put("event", "gotoSlide")
		event.put("slide", slide)
		recordEvent(event)
	}
	
	def sharePresentation = {presentationName, share ->
		log.debug("calling sharePresentationCallback $presentationName $share")
	
		so.sendMessage("sharePresentationCallback", [presentationName, share])	
		
		Map event = new HashMap()
		event.put("date", new Date().time)
		event.put("application", name)
		event.put("event", "sharePresentation")
		event.put("presentationName", presentationName)
		event.put("share", share)
		recordEvent(event)
	}
}
