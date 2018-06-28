package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs.UserJoinMeetingReqMsg
import org.bigbluebutton.core.apps.breakout.BreakoutHdlrHelpers
import org.bigbluebutton.core.models.VoiceUsers
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{ BaseMeetingActor, HandlerHelpers, LiveMeeting, OutMsgRouter }

trait UserJoinMeetingReqMsgHdlr extends HandlerHelpers with BreakoutHdlrHelpers {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleUserJoinMeetingReqMsg(msg: UserJoinMeetingReqMsg, state: MeetingState2x): MeetingState2x = {
    val newState = userJoinMeeting(outGW, msg.body.authToken, msg.body.clientType, liveMeeting, state)

    if (liveMeeting.props.meetingProp.isBreakout) {
      updateParentMeetingWithUsers()
    }

    // fresh user joined (not due to reconnection). Clear (pop) the cached voice user
    VoiceUsers.recoverVoiceUser(liveMeeting.voiceUsers, msg.body.userId)

    newState
  }

}

