package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.messages.MessageBody.GetCurrentPollRespMsgBody
import org.bigbluebutton.common2.messages._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.Polls
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.common2.domain.PollVO

trait GetCurrentPollReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleGetCurrentPollReqMsg(msg: GetCurrentPollReqMsg): Unit = {

    def broadcastEvent(msg: GetCurrentPollReqMsg, hasPoll: Boolean, pvo: PollVO): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(GetCurrentPollRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(GetCurrentPollRespMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val body = GetCurrentPollRespMsgBody(msg.header.userId, pvo.id, hasPoll, pvo)
      val event = GetCurrentPollRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    val (hasPoll, optionPollVO) = Polls.handleGetCurrentPollReqMsg(msg.header.userId, liveMeeting)
    for {
      pollVO <- optionPollVO
    } yield {
      broadcastEvent(msg, hasPoll, pollVO)
    }
  }
}
