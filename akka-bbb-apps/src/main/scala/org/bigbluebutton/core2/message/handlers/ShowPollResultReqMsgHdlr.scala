package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.messages._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.Polls
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.common2.domain.SimplePollResultOutVO
import org.bigbluebutton.common2.messages.polls.{ PollShowResultEvtMsg, PollShowResultEvtMsgBody, ShowPollResultReqMsg }

trait ShowPollResultReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleShowPollResultReqMsg(msg: ShowPollResultReqMsg): Unit = {

    def broadcastEvent(msg: ShowPollResultReqMsg, result: SimplePollResultOutVO): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(PollShowResultEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(PollShowResultEvtMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val body = PollShowResultEvtMsgBody(msg.header.userId, msg.body.pollId, result)
      val event = PollShowResultEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    for {
      result <- Polls.handleShowPollResultReqMsg(msg.header.userId, msg.body.pollId, liveMeeting)
    } yield {
      broadcastEvent(msg, result)
    }
  }
}
