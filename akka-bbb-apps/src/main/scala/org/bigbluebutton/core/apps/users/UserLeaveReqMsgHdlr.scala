package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.domain.{ MeetingExpiryTracker, MeetingState2x }
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.util.TimeUtil
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait UserLeaveReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleUserLeaveReqMsg(msg: UserLeaveReqMsg, state: MeetingState2x): MeetingState2x = {
    for {
      u <- Users2x.remove(liveMeeting.users2x, msg.body.userId)
    } yield {
      log.info("User left meeting. meetingId=" + props.meetingProp.intId + " userId=" + u.intId + " user=" + u)

      captionApp2x.handleUserLeavingMsg(msg.body.userId)
      stopAutoStartedRecording()

      // send a user left event for the clients to update
      val userLeftMeetingEvent = MsgBuilder.buildUserLeftMeetingEvtMsg(liveMeeting.props.meetingProp.intId, u.intId)
      outGW.send(userLeftMeetingEvent)
      log.info("User left meetingId=" + liveMeeting.props.meetingProp.intId + " userId=" + msg.body.userId)

    }

    if (Users2x.numUsers(liveMeeting.users2x) == 0) {
      MeetingExpiryTracker.setLastUserLeftOn(state, TimeUtil.timeNowInSeconds())
    } else {
      state
    }
  }

}
