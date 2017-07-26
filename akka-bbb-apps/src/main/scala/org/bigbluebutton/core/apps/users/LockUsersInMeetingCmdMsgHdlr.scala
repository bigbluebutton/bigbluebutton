package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait LockUsersInMeetingCmdMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleLockUsersInMeetingCmdMsg(msg: LockUsersInMeetingCmdMsg) {

    def build(meetingId: String, userId: String, lockedBy: String, locked: Boolean): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
      val envelope = BbbCoreEnvelope(UserLockedInMeetingEvtMsg.NAME, routing)
      val body = UserLockedInMeetingEvtMsgBody(userId, locked, lockedBy)
      val header = BbbClientMsgHeader(UserLockedInMeetingEvtMsg.NAME, meetingId, userId)
      val event = UserLockedInMeetingEvtMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    val usersToLock = Users2x.findAll(liveMeeting.users2x).filter(u => !msg.body.except.toSet(u))
    usersToLock foreach { utl =>
      for {
        uvo <- Users2x.setUserLocked(liveMeeting.users2x, utl.intId, msg.body.lock)
      } yield {
        log.info("Lock user.  meetingId=" + props.meetingProp.intId + " userId=" + uvo.intId + " locked=" + uvo.locked)
        val event = build(props.meetingProp.intId, uvo.intId, msg.body.lockedBy, uvo.locked)
        outGW.send(event)
      }
    }

  }
}
