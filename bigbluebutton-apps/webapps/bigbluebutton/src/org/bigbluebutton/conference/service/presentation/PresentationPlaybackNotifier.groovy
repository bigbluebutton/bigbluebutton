
package org.bigbluebutton.conference.service.presentation

import java.util.Map
import org.bigbluebutton.conference.service.archive.playback.IPlaybackNotifier
import org.red5.server.api.so.ISharedObjectimport org.slf4j.Logger
import org.slf4j.LoggerFactory

public class PresentationPlaybackNotifier implements IPlaybackNotifier{
	protected static Logger log = LoggerFactory.getLogger( PresentationPlaybackNotifier.class )
	
	private ISharedObject so
	def name = 'PRESENTATION'
	
	public PresentationPlaybackNotifier(ISharedObject so) {
		this.so = so
	}
	
	def sendMessage(Map event){
		log.debug("Playback presentation message...")

		switch (event['event']) {
			case 'assignPresenter' :
				def userid = event['userid']
				def name = event['name']
				def assignedBy = event['assignedBy']
				so.sendMessage("assignPresenterCallback", [userid, name, assignedBy])				
				break
			case 'gotoSlide':
				def slide = event['slide']
				so.sendMessage("gotoSlideCallback", [slide] )
				break	
			case 'sharePresentation':
				def presentationName = event["presentationName"]
				def share  = event["share"]
				so.sendMessage("sharePresentationCallback", [presentationName, share] )
				break
		}
	}
	
	def notifierName(){
		return name
	}
}
