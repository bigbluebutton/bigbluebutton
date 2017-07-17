package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.common2.msgs.UserJoinMeetingReqMsg
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{ BaseMeetingActor, HandlerHelpers, LiveMeeting }

trait UserJoinMeetingReqMsgHdlr extends HandlerHelpers {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMessageGateway

  def handleUserJoinMeetingReqMsg(msg: UserJoinMeetingReqMsg, state: MeetingState2x): MeetingState2x = {
    userJoinMeeting(outGW, msg.body.authToken, liveMeeting, state)
  }

}

