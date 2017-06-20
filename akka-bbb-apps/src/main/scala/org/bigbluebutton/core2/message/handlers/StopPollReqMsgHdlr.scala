package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.messages.MessageBody.PollStoppedEvtMsgBody
import org.bigbluebutton.common2.messages._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.Polls
import org.bigbluebutton.core.running.MeetingActor

trait StopPollReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleStopPollReqMsg(msg: StopPollReqMsg): Unit = {

    def broadcastEvent(msg: StopPollReqMsg, stoppedPollId: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(PollStoppedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(PollStoppedEvtMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val body = PollStoppedEvtMsgBody(msg.header.userId, stoppedPollId)
      val event = PollStoppedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    for {
      stoppedPollId <- Polls.handleStopPollReqMsg(msg.header.userId, liveMeeting)
    } yield {
      broadcastEvent(msg, stoppedPollId)
    }
  }
}
