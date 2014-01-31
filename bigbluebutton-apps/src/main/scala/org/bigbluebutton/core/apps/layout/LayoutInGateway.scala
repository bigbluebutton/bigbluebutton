package org.bigbluebutton.core.apps.layout

import org.bigbluebutton.core.BigBlueButtonGateway
import org.bigbluebutton.core.api._

class LayoutInGateway(bbbGW: BigBlueButtonGateway) {
	def getCurrentLayout(meetingID: String, requesterID: String) {
	  bbbGW.accept(new GetCurrentLayoutRequest(meetingID, requesterID))
	}
	
	def setLayout(meetingID: String, requesterID: String, layoutID: String) {
	  bbbGW.accept(new SetLayoutRequest(meetingID, requesterID, layoutID))
	}
	
	def lockLayout(meetingID: String, requesterID: String, layoutID: String) {
	  bbbGW.accept(new LockLayoutRequest(meetingID, requesterID, layoutID))
	}
	
	def unlockLayout(meetingID: String, requesterID: String) {
	  bbbGW.accept(new UnlockLayoutRequest(meetingID, requesterID))
	}
}