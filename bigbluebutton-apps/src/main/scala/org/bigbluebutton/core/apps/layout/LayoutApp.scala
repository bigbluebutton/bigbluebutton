package org.bigbluebutton.core.apps.layout

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.MeetingActor
import scala.collection.mutable.ArrayBuffer

trait LayoutApp {
  this : MeetingActor =>
  
  val outGW: MessageOutGateway
  
  private var setByUser:String = "system";
  private var currentLayout = "";
	private var layoutLocked = false
  private var viewersOnly = true
  
  def handleGetCurrentLayoutRequest(msg: GetCurrentLayoutRequest) {
    outGW.send(new GetCurrentLayoutReply(msg.meetingID, recorded, msg.requesterID, 
        currentLayout, permissions.lockedLayout, setByUser))
  }
  
	def handleLockLayoutRequest(msg: LockLayoutRequest) {
	  viewersOnly = msg.viewersOnly
	  lockLayout(msg.lock)
	  
	  outGW.send(new LockLayoutEvent(msg.meetingID, recorded, 
	      msg.setById, msg.lock, affectedUsers))
	  
	  msg.layout foreach {l =>
	    currentLayout = l
	    broadcastSyncLayout(msg.meetingID, msg.setById)
	  }	  
	}
		
	private def broadcastSyncLayout(meetingId: String, setById: String) {
	  outGW.send(new BroadcastLayoutEvent(meetingId, recorded, setById, 
	      currentLayout, permissions.lockedLayout, setByUser, affectedUsers))
	}
	
  def handleBroadcastLayoutRequest(msg: BroadcastLayoutRequest) {
    currentLayout = msg.layout
    broadcastSyncLayout(msg.meetingID, msg.requesterID)
  }
   
  def handleLockLayout(lock: Boolean, setById: String) {
	  outGW.send(new LockLayoutEvent(meetingID, recorded, setById, lock, affectedUsers))
	  
	  broadcastSyncLayout(meetingID, setById)     
  }
  
  def affectedUsers():Array[UserVO] = {
    if (viewersOnly) {
      val au = ArrayBuffer[UserVO]()   
	    users.getUsers foreach {u =>
	      if (! u.presenter && u.role != Role.MODERATOR) {
	        au += u
	      }
	    }
	    au.toArray       
    } else {
      users.getUsers
    }

  }
    
}
