package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._

import scala.collection.mutable.ArrayBuffer
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.{ Roles, UserVO, Users }
import org.bigbluebutton.core.running.{ MeetingActor }

trait LayoutApp {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleGetCurrentLayoutRequest(msg: GetCurrentLayoutRequest) {
    outGW.send(new GetCurrentLayoutReply(msg.meetingID, mProps.recorded, msg.requesterID,
      liveMeeting.layoutModel.getCurrentLayout(), liveMeeting.meetingModel.getPermissions().lockedLayout, liveMeeting.layoutModel.getLayoutSetter()))
  }

  def handleLockLayoutRequest(msg: LockLayoutRequest) {
    liveMeeting.layoutModel.applyToViewersOnly(msg.viewersOnly)
    liveMeeting.lockLayout(msg.lock)

    outGW.send(new LockLayoutEvent(msg.meetingID, mProps.recorded, msg.setById, msg.lock, affectedUsers))

    msg.layout foreach { l =>
      liveMeeting.layoutModel.setCurrentLayout(l)
      broadcastSyncLayout(msg.meetingID, msg.setById)
    }
  }

  private def broadcastSyncLayout(meetingId: String, setById: String) {
    outGW.send(new BroadcastLayoutEvent(meetingId, mProps.recorded, setById,
      liveMeeting.layoutModel.getCurrentLayout(), liveMeeting.meetingModel.getPermissions().lockedLayout, liveMeeting.layoutModel.getLayoutSetter(), affectedUsers))
  }

  def handleBroadcastLayoutRequest(msg: BroadcastLayoutRequest) {
    liveMeeting.layoutModel.setCurrentLayout(msg.layout)
    broadcastSyncLayout(msg.meetingID, msg.requesterID)
  }

  def handleLockLayout(lock: Boolean, setById: String) {
    outGW.send(new LockLayoutEvent(mProps.meetingID, mProps.recorded, setById, lock, affectedUsers))

    broadcastSyncLayout(mProps.meetingID, setById)
  }

  def affectedUsers(): Array[UserVO] = {
    if (liveMeeting.layoutModel.doesLayoutApplyToViewersOnly()) {
      val au = ArrayBuffer[UserVO]()
      Users.getUsers(liveMeeting.users) foreach { u =>
        if (!u.presenter && u.role != Roles.MODERATOR_ROLE) {
          au += u
        }
      }
      au.toArray
    } else {
      Users.getUsers(liveMeeting.users).toArray
    }

  }

}
