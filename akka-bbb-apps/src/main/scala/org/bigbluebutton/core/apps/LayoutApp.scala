package org.bigbluebutton.core.apps

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.MeetingStatus2x

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

    //outGW.send(new LockLayoutEvent(msg.meetingID, props.recordProp.record, msg.setById, msg.lock, affectedUsers))

    msg.layout foreach { l =>
      Layouts.setCurrentLayout(l)
      broadcastSyncLayout(msg.meetingID, msg.setById)
    }
  }

  private def broadcastSyncLayout(meetingId: String, setById: String) {
    //outGW.send(new BroadcastLayoutEvent(meetingId, props.recordProp.record, setById,
    //  Layouts.getCurrentLayout(),
    //  MeetingStatus2x.getPermissions(liveMeeting.status).lockedLayout,
    //  Layouts.getLayoutSetter(), affectedUsers))
  }

  def handleBroadcastLayoutRequest(msg: BroadcastLayoutRequest) {
    Layouts.setCurrentLayout(msg.layout)
    broadcastSyncLayout(msg.meetingID, msg.requesterID)
  }

  def handleLockLayout(lock: Boolean, setById: String) {
    // outGW.send(new LockLayoutEvent(props.meetingProp.intId, props.recordProp.record, setById, lock, affectedUsers))

    broadcastSyncLayout(props.meetingProp.intId, setById)
  }

  def affectedUsers(): Vector[String] = {
    if (Layouts.doesLayoutApplyToViewersOnly()) {
      val users = Users2x.findAll(liveMeeting.users2x) filter { u =>
        (!u.presenter && u.role != Roles.MODERATOR_ROLE)
      }
      users.map(u => u.intId)
    } else {
      Users2x.findAll(liveMeeting.users2x).map(u => u.intId)
    }
  }

}
