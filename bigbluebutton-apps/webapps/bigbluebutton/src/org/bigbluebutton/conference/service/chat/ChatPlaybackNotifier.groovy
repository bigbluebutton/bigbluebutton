
package org.bigbluebutton.conference.service.chat

import java.util.Map
import org.bigbluebutton.conference.service.archive.playback.IPlaybackNotifier
import org.red5.server.api.so.ISharedObjectimport org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory

public class ChatPlaybackNotifier implements IPlaybackNotifier{
	private static Logger log = Red5LoggerFactory.getLogger( ChatPlaybackNotifier.class, "bigbluebutton" )
	
	private ISharedObject so
	def name = 'CHAT'
	
	public ChatPlaybackNotifier(ISharedObject so) {
		this.so = so
	}
	
	def sendMessage(Map event){
		log.debug("Playback chat message...")
		def message = event['message']
		so.sendMessage("newChatMessage", [message])
	}
	
	def notifierName(){
		return name
	}
}
