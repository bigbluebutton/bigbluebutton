package org.bigbluebutton.core2.message.handlers.pads

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait AddPadSysMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleAddPadSysMsg(msg: AddPadSysMsg) {
    val padId = msg.body.padId
    val readOnlyId = msg.body.readOnlyId
    val meetingId = liveMeeting.props.meetingProp.intId

    log.info(s"Handling add padId=${padId} and readOnlyId=${readOnlyId} for meetingId=${meetingId}")

    outGW.send(MsgBuilder.buildAddPadEvtMsg(meetingId, padId, readOnlyId))
  }
}
