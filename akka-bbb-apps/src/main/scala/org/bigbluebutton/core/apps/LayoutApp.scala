package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._

import scala.collection.mutable.ArrayBuffer
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.UserVO
import org.bigbluebutton.core.running.{ MeetingActor, MeetingStateModel }

trait LayoutApp {
  this: MeetingActor =>

  val outGW: OutMessageGateway
  val state: MeetingStateModel

  def handleGetCurrentLayoutRequest(msg: GetCurrentLayoutRequest) {
    outGW.send(new GetCurrentLayoutReply(msg.meetingID, state.mProps.recorded, msg.requesterID,
      state.layoutModel.getCurrentLayout(), state.meetingModel.getPermissions().lockedLayout, state.layoutModel.getLayoutSetter()))
  }

  def handleLockLayoutRequest(msg: LockLayoutRequest) {
    state.layoutModel.applyToViewersOnly(msg.viewersOnly)
    lockLayout(msg.lock)

    outGW.send(new LockLayoutEvent(msg.meetingID, state.mProps.recorded, msg.setById, msg.lock, affectedUsers))

    msg.layout foreach { l =>
      state.layoutModel.setCurrentLayout(l)
      broadcastSyncLayout(msg.meetingID, msg.setById)
    }
  }

  private def broadcastSyncLayout(meetingId: String, setById: String) {
    outGW.send(new BroadcastLayoutEvent(meetingId, state.mProps.recorded, setById,
      state.layoutModel.getCurrentLayout(), state.meetingModel.getPermissions().lockedLayout, state.layoutModel.getLayoutSetter(), affectedUsers))
  }

  def handleBroadcastLayoutRequest(msg: BroadcastLayoutRequest) {
    state.layoutModel.setCurrentLayout(msg.layout)
    broadcastSyncLayout(msg.meetingID, msg.requesterID)
  }

  def handleLockLayout(lock: Boolean, setById: String) {
    outGW.send(new LockLayoutEvent(state.mProps.meetingID, state.mProps.recorded, setById, lock, affectedUsers))

    broadcastSyncLayout(state.mProps.meetingID, setById)
  }

  def affectedUsers(): Vector[UserVO] = {
    if (state.layoutModel.doesLayoutApplyToViewersOnly()) {
      val au = ArrayBuffer[UserVO]()
      state.users.toVector foreach { u =>
        if (!u.presenter && u.role != Role.MODERATOR) {
          au += u
        }
      }
      au.toVector
    } else {
      state.users.toVector
    }

  }

}
