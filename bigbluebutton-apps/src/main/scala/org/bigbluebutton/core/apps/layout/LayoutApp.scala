package org.bigbluebutton.core.apps.layout

import org.bigbluebutton.core.api.InMessage
import org.bigbluebutton.core.api.MessageOutGateway
import org.bigbluebutton.core.apps.layout.messages._

class LayoutApp(meetingID: String, recorded: Boolean, outGW: MessageOutGateway) {
  import org.bigbluebutton.core.apps.layout.messages._
  
	private var _locked:Boolean = false;
	private var _setByUserID:String = "system";
	private var _currentLayoutID = "";
	
    def handleMessage(msg: InMessage):Unit = {
	    msg match {
	      case getCurrentLayoutRequest:GetCurrentLayoutRequest => handleGetCurrentLayoutRequest(getCurrentLayoutRequest)
	      case setLayoutRequest:SetLayoutRequest => handleSetLayoutRequest(setLayoutRequest)
	      case lockLayoutRequest:LockLayoutRequest => handleLockLayoutRequest(lockLayoutRequest)
	      case unlockLayoutRequest:UnlockLayoutRequest => handleUnlockLayoutRequest(unlockLayoutRequest)
	      case _ => // do nothing
	    }
    }
    
    private def handleGetCurrentLayoutRequest(msg: GetCurrentLayoutRequest) {
      outGW.send(new GetCurrentLayoutReply(msg.meetingID, recorded, msg.requesterID, _currentLayoutID, _locked, _setByUserID))
    }
    
    private def handleSetLayoutRequest(msg: SetLayoutRequest) {
      _currentLayoutID = msg.layoutID
      outGW.send(new SetLayoutEvent(msg.meetingID, recorded, msg.requesterID, _currentLayoutID, _locked, _setByUserID))
    }
    
    private def handleLockLayoutRequest(msg: LockLayoutRequest) {
      _locked = true
      _currentLayoutID = msg.layoutID
      outGW.send(new LockLayoutEvent(msg.meetingID, recorded, msg.requesterID, _currentLayoutID, _locked, _setByUserID))
    }
    
    private def handleUnlockLayoutRequest(msg: UnlockLayoutRequest) {
      _locked = false
      outGW.send(new UnlockLayoutEvent(msg.meetingID, recorded, msg.requesterID, _currentLayoutID, _locked, _setByUserID))
    }
}