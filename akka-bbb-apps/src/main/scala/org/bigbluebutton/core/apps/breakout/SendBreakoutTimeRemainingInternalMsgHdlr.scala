package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.core.api.SendBreakoutTimeRemainingInternalMsg
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait SendBreakoutTimeRemainingInternalMsgHdlr {
  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleSendBreakoutTimeRemainingInternalMsg(msg: SendBreakoutTimeRemainingInternalMsg): Unit = {
    val event = MsgBuilder.buildMeetingTimeRemainingUpdateEvtMsg(liveMeeting.props.meetingProp.intId, msg.timeLeftInSec.toInt)
    outGW.send(event)
  }
}
