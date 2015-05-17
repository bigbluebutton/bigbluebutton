package org.bigbluebutton.core.apps.video.red5

import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService
import org.bigbluebutton.core.api._
import org.bigbluebutton.conference.meeting.messaging.red5.DirectClientMessage
import com.google.gson.Gson
import org.bigbluebutton.conference.meeting.messaging.red5.BroadcastClientMessage

class VideoClientMessageSender(service: ConnectionInvokerService) extends OutMessageListener2 {

	def handleMessage(msg: IOutMessage) {
		msg match {
			case msg:GetStreamPathReply               => handleGetStreamPathReply(msg)
			case _ => // do nothing
		}
	}

	private def handleGetStreamPathReply(msg: GetStreamPathReply) {
		// Build JSON
		val args = new java.util.HashMap[String, Object]()
		args.put("streamName", msg.streamName);
		args.put("streamPath", msg.streamPath);

		val message = new java.util.HashMap[String, Object]() 
		val gson = new Gson();
		message.put("msg", gson.toJson(args))

		var m = new DirectClientMessage(msg.meetingID, msg.requesterID, "getStreamPathReply", message);
		service.sendMessage(m);
	}
}
