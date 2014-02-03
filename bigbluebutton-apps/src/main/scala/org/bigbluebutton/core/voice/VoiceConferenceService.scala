package org.bigbluebutton.core.voice

import org.bigbluebutton.core.api._

class VoiceConferenceService extends OutMessageListener2 {

  def handleMessage(msg: IOutMessage) {
	  msg match {
	    case msg: MeetingCreated => handleMeetingCreated(msg)
	  }
  }
  
  private def handleMeetingCreated(msg: MeetingCreated) {
    
  }
}