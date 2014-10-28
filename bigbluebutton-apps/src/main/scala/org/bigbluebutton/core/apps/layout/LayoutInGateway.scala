package org.bigbluebutton.core.apps.layout

import org.bigbluebutton.core.BigBlueButtonGateway
import org.bigbluebutton.core.api._

class LayoutInGateway(bbbGW: BigBlueButtonGateway) {
  
  def getCurrentLayout(meetingID: String, requesterID: String) {
    bbbGW.accept(new GetCurrentLayoutRequest(meetingID, requesterID))
  }
	
	def broadcastLayout(meetingID: String, requesterID: String, layout: String) {
	  bbbGW.accept(new BroadcastLayoutRequest(meetingID, requesterID, layout))
	}
	
	def lockLayout(meetingID: String, setById: String, 
	               lock: Boolean, viewersOnly: Boolean,
                 layout: Option[String]) {
	  bbbGW.accept(new LockLayoutRequest(meetingID, setById, lock, viewersOnly, layout))
	}
}