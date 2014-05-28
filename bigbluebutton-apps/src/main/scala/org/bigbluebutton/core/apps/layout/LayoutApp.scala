package org.bigbluebutton.core.apps.layout

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.MeetingActor
import scala.collection.mutable.ArrayBuffer

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
  
  def handleLayoutLockSettings(msg: LayoutLockSettings) {
    if (msg.locked) {
      _locked = true
      _setByUserID = msg.requesterId
      outGW.send(new LockLayoutEvent(msg.meetingID, recorded, msg.requesterId, _currentLayoutID, _locked, _setByUserID, affectedUsers))      
    } else {
      _locked = false
      _setByUserID = msg.requesterId
      outGW.send(new UnlockLayoutEvent(msg.meetingID, recorded, msg.requesterId, _currentLayoutID, _locked, _setByUserID, affectedUsers))      
    } 
  }
  
  def affectedUsers():Array[UserVO] = {
    val au = ArrayBuffer[UserVO]()   
    users.getUsers foreach {u =>
        if (! u.presenter && u.role != Role.MODERATOR) {
          au += u
        }
    }
    au.toArray
  }
    
  def handleLockLayoutRequest(msg: LockLayoutRequest) {
    _locked = true
    _currentLayoutID = msg.layoutID
    outGW.send(new LockLayoutEvent(msg.meetingID, recorded, msg.requesterID, _currentLayoutID, _locked, _setByUserID, affectedUsers))
  }
    
  def handleUnlockLayoutRequest(msg: UnlockLayoutRequest) {
    _locked = false
    outGW.send(new UnlockLayoutEvent(msg.meetingID, recorded, msg.requesterID, _currentLayoutID, _locked, _setByUserID, affectedUsers))
  }
}