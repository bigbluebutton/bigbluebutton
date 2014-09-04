package org.bigbluebutton.core.apps.video

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.MeetingActor

trait VideoApp {
	this : MeetingActor =>

	val outGW: MessageOutGateway

	def handleGetStreamPath(msg: GetStreamPath) {
		// TODO: Request stream path from bbbWeb here
		val streamPath = msg.defaultPath
		outGW.send(new GetStreamPathReply(msg.meetingID, msg.requesterID, msg.streamName, streamPath))
	}
}
