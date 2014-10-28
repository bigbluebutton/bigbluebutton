/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.deskshare.server.stream

import org.bigbluebutton.deskshare.server.sessions.SessionManagerGateway
import org.red5.server.api.Red5
import java.util.HashMap
import net.lag.logging.Logger

class DeskshareService(streamManager: StreamManager, sessionGateway: SessionManagerGateway) {
	private val log = Logger.get
 
	def checkIfStreamIsPublishing(room:String): HashMap[String, Any] = {
//		val room: String = Red5.getConnectionLocal().getScope().getName();
		log.debug("Checking if %s is streaming.", room)
		var publishing = false
		var width = 0
		var height = 0
  
		streamManager !? (3000, IsStreamPublishing(room)) match {
		  	case None => log.warning("DeskshareService: Timeout waiting for reply to IsStreamPublishing for room %s", room)
		  	case Some(rep) => {
		  		val reply = rep.asInstanceOf[StreamPublishingReply]
		  		publishing = reply.publishing
		  		width = reply.width
		  		height = reply.height
		  	}
		}
    
		val stream = new HashMap[String, Any]()
		stream.put("publishing", publishing)
		stream.put("width", width)
		stream.put("height", height)
  
		return stream;
	}
	
	def startedToViewStream(stream: String): Unit = {
		log.debug("DeskshareService: Started viewing stream for room %s", stream)
		sessionGateway.sendKeyFrame(stream)
	}
	
	def stopSharingDesktop(meetingId: String) {
	  log.debug("DeskshareService: Stop sharing for meeting [%s]", meetingId)
	  sessionGateway.stopSharingDesktop(meetingId, meetingId)
	}
}
