package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs.UserLeaveReqMsg
import org.bigbluebutton.core.domain.MeetingState2x
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
      stopRecordingIfAutoStart2x(outGW, liveMeeting, state)

      // send a user left event for the clients to update
      val userLeftMeetingEvent = MsgBuilder.buildUserLeftMeetingEvtMsg(liveMeeting.props.meetingProp.intId, u.intId)
      outGW.send(userLeftMeetingEvent)

      if (u.presenter) {
        automaticallyAssignPresenter(outGW, liveMeeting)

        // request screenshare to end
        screenshareApp2x.handleScreenshareStoppedVoiceConfEvtMsg(liveMeeting.props.voiceProp.voiceConf, liveMeeting.props.screenshareProps.screenshareConf)

        // request ongoing poll to end
        handleStopPollReqMsg(u.intId)
      }
    }

    if (liveMeeting.props.meetingProp.isBreakout) {
      updateParentMeetingWithUsers()
    }

    if (Users2x.numUsers(liveMeeting.users2x) == 0) {
      val tracker = state.expiryTracker.setLastUserLeftOn(TimeUtil.timeNowInMs())
      state.update(tracker)
    } else {
      state
    }
  }

}
