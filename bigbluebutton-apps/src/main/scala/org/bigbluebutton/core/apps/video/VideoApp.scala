package org.bigbluebutton.core.apps.video
// TODO: Check this imports
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.MeetingActor
import com.google.gson.Gson

trait VideoApp {
	this : MeetingActor =>

	val outGW: MessageOutGateway

	def handleGetStreamPath(msg: GetStreamPath) {
		// TODO: Request stream path from bbbWeb here
		// TODO: Make this configurable
		val streamPath = "10.0.3.213/10.0.3.225"
		outGW.send(new GetStreamPathReply(msg.meetingID, msg.requesterID, msg.streamName, streamPath))
	}
}
