package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs.UserJoinMeetingAfterReconnectReqMsg
import org.bigbluebutton.core.apps.breakout.BreakoutHdlrHelpers
import org.bigbluebutton.core.apps.voice.UserJoinedVoiceConfEvtMsgHdlr
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{ BaseMeetingActor, HandlerHelpers, LiveMeeting, OutMsgRouter }

trait UserJoinMeetingAfterReconnectReqMsgHdlr extends HandlerHelpers with BreakoutHdlrHelpers with UserJoinedVoiceConfEvtMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleUserJoinMeetingAfterReconnectReqMsg(msg: UserJoinMeetingAfterReconnectReqMsg, state: MeetingState2x): MeetingState2x = {

    val newState = userJoinMeeting(outGW, msg.body.authToken, liveMeeting, state)
    if (liveMeeting.props.meetingProp.isBreakout) {
      updateParentMeetingWithUsers()
    }

    /*
     * *
     * // recover voice user
     * for {
     * vu <- VoiceUsers.recoverVoiceUser(liveMeeting.voiceUsers, msg.body.userId)
     * } yield {
     * handleUserJoinedVoiceConfEvtMsg(liveMeeting.props.voiceProp.voiceConf, vu.intId, vu.voiceUserId, vu.callingWith, vu.callerName, vu.callerNum, vu.muted, vu.talking)
     * }
     *
     * newState
     */

    newState
  }

}

