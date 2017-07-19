package org.bigbluebutton.core2.message.handlers.guests

import org.bigbluebutton.common2.msgs.GetGuestPolicyReqMsg
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting }

trait GetGuestPolicyReqMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMessageGateway

  def handleGetGuestPolicyReqMsg(msg: GetGuestPolicyReqMsg): Unit = {

  }
}
