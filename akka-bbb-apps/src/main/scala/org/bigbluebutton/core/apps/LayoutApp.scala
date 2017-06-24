package org.bigbluebutton.core.apps

import scala.collection.mutable.ArrayBuffer

import org.bigbluebutton.common2.domain.UserVO
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.models.{ Roles, Users }
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core.models.Layouts

trait LayoutApp {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleGetCurrentLayoutRequest(msg: GetCurrentLayoutRequest) {
    outGW.send(new GetCurrentLayoutReply(msg.meetingID, props.recordProp.record, msg.requesterID,
      Layouts.getCurrentLayout(),
      MeetingStatus2x.getPermissions(liveMeeting.status).lockedLayout,
      Layouts.getLayoutSetter()))
  }

  def handleLockLayoutRequest(msg: LockLayoutRequest) {
    Layouts.applyToViewersOnly(msg.viewersOnly)
    liveMeeting.lockLayout(msg.lock)

    outGW.send(new LockLayoutEvent(msg.meetingID, props.recordProp.record, msg.setById, msg.lock, affectedUsers))

    msg.layout foreach { l =>
      Layouts.setCurrentLayout(l)
      broadcastSyncLayout(msg.meetingID, msg.setById)
    }
  }

  private def broadcastSyncLayout(meetingId: String, setById: String) {
    outGW.send(new BroadcastLayoutEvent(meetingId, props.recordProp.record, setById,
      Layouts.getCurrentLayout(),
      MeetingStatus2x.getPermissions(liveMeeting.status).lockedLayout,
      Layouts.getLayoutSetter(), affectedUsers))
  }

  def handleBroadcastLayoutRequest(msg: BroadcastLayoutRequest) {
    Layouts.setCurrentLayout(msg.layout)
    broadcastSyncLayout(msg.meetingID, msg.requesterID)
  }

  def handleLockLayout(lock: Boolean, setById: String) {
    outGW.send(new LockLayoutEvent(props.meetingProp.intId, props.recordProp.record, setById, lock, affectedUsers))

    broadcastSyncLayout(props.meetingProp.intId, setById)
  }

  def affectedUsers(): Array[UserVO] = {
    if (Layouts.doesLayoutApplyToViewersOnly()) {
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
