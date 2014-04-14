package org.bigbluebutton.core.apps.layout

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.MeetingActor

trait LayoutApp {
  this : MeetingActor =>
  
  val outGW: MessageOutGateway
  
	private var _locked:Boolean = false;
	private var _setByUserID:String = "system";
	private var _currentLayoutID = "";
	    
    def handleGetCurrentLayoutRequest(msg: GetCurrentLayoutRequest) {
      outGW.send(new GetCurrentLayoutReply(msg.meetingID, recorded, msg.requesterID, _currentLayoutID, _locked, _setByUserID))
    }
    
    def handleSetLayoutRequest(msg: SetLayoutRequest) {
      _currentLayoutID = msg.layoutID
      outGW.send(new SetLayoutEvent(msg.meetingID, recorded, msg.requesterID, _currentLayoutID, _locked, _setByUserID))
    }
    
    def handleLockLayoutRequest(msg: LockLayoutRequest) {
      _locked = true
      _currentLayoutID = msg.layoutID
      outGW.send(new LockLayoutEvent(msg.meetingID, recorded, msg.requesterID, _currentLayoutID, _locked, _setByUserID))
    }
    
    def handleUnlockLayoutRequest(msg: UnlockLayoutRequest) {
      _locked = false
      outGW.send(new UnlockLayoutEvent(msg.meetingID, recorded, msg.requesterID, _currentLayoutID, _locked, _setByUserID))
    }
}