package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.MeetingActor
import scala.collection.mutable.ArrayBuffer

trait LayoutApp {
  this: MeetingActor =>

  val outGW: MessageOutGateway

  def handleGetCurrentLayoutRequest(msg: GetCurrentLayoutRequest) {
    outGW.send(new GetCurrentLayoutReply(msg.meetingID, mProps.recorded, msg.requesterID,
      layoutModel.getCurrentLayout(), meetingModel.getPermissions().lockedLayout, layoutModel.getLayoutSetter()))
  }

  def handleLockLayoutRequest(msg: LockLayoutRequest) {
    layoutModel.applyToViewersOnly(msg.viewersOnly)
    lockLayout(msg.lock)

    outGW.send(new LockLayoutEvent(msg.meetingID, mProps.recorded, msg.setById, msg.lock, affectedUsers))

    msg.layout foreach { l =>
      layoutModel.setCurrentLayout(l)
      broadcastSyncLayout(msg.meetingID, msg.setById)
    }
  }

  private def broadcastSyncLayout(meetingId: String, setById: String) {
    outGW.send(new BroadcastLayoutEvent(meetingId, mProps.recorded, setById,
      layoutModel.getCurrentLayout(), meetingModel.getPermissions().lockedLayout, layoutModel.getLayoutSetter(), affectedUsers))
  }

  def handleBroadcastLayoutRequest(msg: BroadcastLayoutRequest) {
    layoutModel.setCurrentLayout(msg.layout)
    broadcastSyncLayout(msg.meetingID, msg.requesterID)
  }

  def handleLockLayout(lock: Boolean, setById: String) {
    outGW.send(new LockLayoutEvent(mProps.meetingID, mProps.recorded, setById, lock, affectedUsers))

    broadcastSyncLayout(mProps.meetingID, setById)
  }

  def affectedUsers(): Array[UserVO] = {
    if (layoutModel.doesLayoutApplyToViewersOnly()) {
      val au = ArrayBuffer[UserVO]()
      users.getUsers foreach { u =>
        if (!u.presenter && u.role != Role.MODERATOR) {
          au += u
        }
      }
      au.toArray
    } else {
      users.getUsers
    }

  }

}
