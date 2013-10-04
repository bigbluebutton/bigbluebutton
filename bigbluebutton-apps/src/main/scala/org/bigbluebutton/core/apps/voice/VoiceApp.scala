package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.core.api.InMessage
import org.bigbluebutton.core.api.MessageOutGateway

class VoiceApp(meetingID: String, recorded: Boolean, outGW: MessageOutGateway) {
    def handleMessage(msg: InMessage):Unit = {
	    msg match {

	      case _ => // do nothing
	    }
    }
}