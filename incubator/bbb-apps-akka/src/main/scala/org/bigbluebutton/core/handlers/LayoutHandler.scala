package org.bigbluebutton.core.handlers

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.domain.{ Role, UserVO, IntUserId, IntMeetingId }
import scala.collection.mutable.ArrayBuffer
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.LiveMeeting

trait LayoutHandler {
  this: LiveMeeting =>

  val outGW: OutMessageGateway

  def handleGetCurrentLayoutRequest(msg: GetCurrentLayoutRequest) {
    outGW.send(new GetCurrentLayoutReply(msg.meetingId, props.recorded, msg.requesterId,
      layoutModel.getCurrentLayout(), meeting.getPermissions.lockedLayout, layoutModel.getLayoutSetter()))
  }

  def handleLockLayoutRequest(msg: LockLayoutRequest) {
    layoutModel.applyToViewersOnly(msg.viewersOnly)
    lockLayout(msg.lock)

    outGW.send(new LockLayoutEvent(msg.meetingId, props.recorded, msg.setById, msg.lock, affectedUsers))

    msg.layout foreach { l =>
      layoutModel.setCurrentLayout(l)
      broadcastSyncLayout(msg.meetingId, msg.setById)
    }
  }

  private def broadcastSyncLayout(meetingId: IntMeetingId, setById: IntUserId) {
    outGW.send(new BroadcastLayoutEvent(meetingId, props.recorded, setById,
      layoutModel.getCurrentLayout(), meeting.getPermissions.lockedLayout, layoutModel.getLayoutSetter(), affectedUsers))
  }

  def handleBroadcastLayoutRequest(msg: BroadcastLayoutRequest) {
    layoutModel.setCurrentLayout(msg.layout)
    broadcastSyncLayout(msg.meetingId, msg.requesterId)
  }

  def handleLockLayout(lock: Boolean, setById: IntUserId) {
    outGW.send(new LockLayoutEvent(props.id, props.recorded, setById, lock, affectedUsers))

    broadcastSyncLayout(props.id, setById)
  }

  def affectedUsers(): Array[UserVO] = {
    if (layoutModel.doesLayoutApplyToViewersOnly()) {
      val au = ArrayBuffer[UserVO]()
      meeting.getUsers foreach { u =>
        if (!u.presenter.value && !u.roles.contains(Role.MODERATOR)) {
          au += u
        }
      }
      au.toArray
    } else {
      meeting.getUsers
    }

  }

}
