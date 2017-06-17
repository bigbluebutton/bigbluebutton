package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.messages.MessageBody.PollStartedEvtMsgBody
import org.bigbluebutton.common2.messages._
import org.bigbluebutton.common2.domain.SimplePollOutVO
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.Polls
import org.bigbluebutton.core.running.MeetingActor

trait StartPollReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleStartPollReqMsg(msg: StartPollReqMsg): Unit = {

    def broadcastEvent(msg: StartPollReqMsg, poll: SimplePollOutVO): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(PollStartedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(PollStartedEvtMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val body = PollStartedEvtMsgBody(msg.header.userId, poll.id, poll)
      val event = PollStartedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    for {
      pvo <- Polls.handleStartPollReqMsg(msg.header.userId, msg.body.pollId, msg.body.pollType, liveMeeting)
    } yield {
      broadcastEvent(msg, pvo)
    }
  }
}
