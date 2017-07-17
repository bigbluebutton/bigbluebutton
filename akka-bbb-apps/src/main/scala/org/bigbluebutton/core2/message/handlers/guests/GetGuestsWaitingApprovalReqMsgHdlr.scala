package org.bigbluebutton.core2.message.handlers.guests

import org.bigbluebutton.common2.msgs.GetGuestsWaitingApprovalReqMsg
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.GuestsWaiting
import org.bigbluebutton.core.running.{ BaseMeetingActor, HandlerHelpers, LiveMeeting }
import org.bigbluebutton.core2.message.senders.{ MsgBuilder, Sender }

trait GetGuestsWaitingApprovalReqMsgHdlr extends HandlerHelpers {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMessageGateway

  def handleGetGuestsWaitingApprovalReqMsg(msg: GetGuestsWaitingApprovalReqMsg): Unit = {
    val guests = GuestsWaiting.findAll(liveMeeting.guestsWaiting)
    val event = MsgBuilder.buildGetGuestsWaitingApprovalRespMsg(
      liveMeeting.props.meetingProp.intId,
      msg.body.requesterId,
      guests
    )

    Sender.send(outGW, event)

  }

}
