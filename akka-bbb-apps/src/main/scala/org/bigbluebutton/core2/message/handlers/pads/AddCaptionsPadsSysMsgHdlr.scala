package org.bigbluebutton.core2.message.handlers.pads

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait AddCaptionsPadsSysMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleAddCaptionsPadsSysMsg(msg: AddCaptionsPadsSysMsg) {
    val padIds = msg.body.padIds
    val meetingId = liveMeeting.props.meetingProp.intId

    log.info(s"Handling add captions pads for meetingId=${meetingId}")

    outGW.send(MsgBuilder.buildAddCaptionsPadsEvtMsg(meetingId, padIds))
  }
}
