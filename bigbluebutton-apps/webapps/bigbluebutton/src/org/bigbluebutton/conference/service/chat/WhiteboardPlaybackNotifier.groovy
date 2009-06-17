
package org.bigbluebutton.conference.service.whiteboard

import java.util.Map
import org.bigbluebutton.conference.service.archive.playback.IPlaybackNotifier
import org.red5.server.api.so.ISharedObjectimport org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory

public class WhiteboardPlaybackNotifier implements IPlaybackNotifier{
	private static Logger log = Red5LoggerFactory.getLogger( WhiteboardPlaybackNotifier.class, "bigbluebutton" )
	
	private ISharedObject so
	def name = 'WHITEBOARD'
	
	public WhiteboardPlaybackNotifier(ISharedObject so) {
		this.so = so
	}
	
	def sendMessage(Map event){
		log.debug("Playback whiteboard message...")
		def message = event['message']
		so.sendMessage("newWhiteboardMessage", [message])
	}
	
	def notifierName(){
		return name
	}
}
