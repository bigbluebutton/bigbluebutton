package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.MeetingActor
import scala.collection.mutable.ArrayBuffer

trait LayoutApp {
  this: MeetingActor =>

  val outGW: MessageOutGateway

  val layoutModel = new LayoutModel()

  def handleGetCurrentLayoutRequest(msg: GetCurrentLayoutRequest) {
    outGW.send(new GetCurrentLayoutReply(msg.meetingID, recorded, msg.requesterID,
      layoutModel.getCurrentLayout(), permissions.lockedLayout, layoutModel.getLayoutSetter()))
  }

  def handleLockLayoutRequest(msg: LockLayoutRequest) {
    layoutModel.applyToViewersOnly(msg.viewersOnly)
    lockLayout(msg.lock)

    outGW.send(new LockLayoutEvent(msg.meetingID, recorded, msg.setById, msg.lock, affectedUsers))

    msg.layout foreach { l =>
      layoutModel.setCurrentLayout(l)
      broadcastSyncLayout(msg.meetingID, msg.setById)
    }
  }

  private def broadcastSyncLayout(meetingId: String, setById: String) {
    outGW.send(new BroadcastLayoutEvent(meetingId, recorded, setById,
      layoutModel.getCurrentLayout(), permissions.lockedLayout, layoutModel.getLayoutSetter(), affectedUsers))
  }

  def handleBroadcastLayoutRequest(msg: BroadcastLayoutRequest) {
    layoutModel.setCurrentLayout(msg.layout)
    broadcastSyncLayout(msg.meetingID, msg.requesterID)
  }

  def handleLockLayout(lock: Boolean, setById: String) {
    outGW.send(new LockLayoutEvent(meetingID, recorded, setById, lock, affectedUsers))

    broadcastSyncLayout(meetingID, setById)
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
