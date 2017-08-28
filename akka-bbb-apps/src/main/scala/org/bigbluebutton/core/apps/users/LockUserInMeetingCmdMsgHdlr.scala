package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait LockUserInMeetingCmdMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleLockUserInMeetingCmdMsg(msg: LockUserInMeetingCmdMsg) {

    def build(meetingId: String, userId: String, lockedBy: String, locked: Boolean): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
      val envelope = BbbCoreEnvelope(UserLockedInMeetingEvtMsg.NAME, routing)
      val body = UserLockedInMeetingEvtMsgBody(userId, locked, lockedBy)
      val header = BbbClientMsgHeader(UserLockedInMeetingEvtMsg.NAME, meetingId, userId)
      val event = UserLockedInMeetingEvtMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    for {
      uvo <- Users2x.setUserLocked(liveMeeting.users2x, msg.body.userId, msg.body.lock)
    } yield {
      log.info("Lock user.  meetingId=" + props.meetingProp.intId + " userId=" + uvo.intId + " locked=" + uvo.locked)
      val event = build(props.meetingProp.intId, uvo.intId, msg.body.lockedBy, uvo.locked)
      outGW.send(event)
    }
  }
}
