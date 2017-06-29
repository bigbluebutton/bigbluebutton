package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.common2.msgs.UserJoinMeetingReqMsg
import org.bigbluebutton.core.{ OutMessageGateway }
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting, BaseMeetingActor }

trait UserJoinMeetingReqMsgHdlr extends HandlerHelpers {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMessageGateway

  def handle(msg: UserJoinMeetingReqMsg): Unit = {
    userJoinMeeting(outGW, msg.body.authToken, liveMeeting)
  }

}

