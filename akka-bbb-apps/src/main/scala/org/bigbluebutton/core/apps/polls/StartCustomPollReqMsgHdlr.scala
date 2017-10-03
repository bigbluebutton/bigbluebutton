package org.bigbluebutton.core.apps.polls

import org.bigbluebutton.common2.domain.SimplePollOutVO
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.models.Polls
import org.bigbluebutton.core.running.{ LiveMeeting }

trait StartCustomPollReqMsgHdlr {
  this: PollApp2x =>

  def handle(msg: StartCustomPollReqMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    def broadcastEvent(msg: StartCustomPollReqMsg, poll: SimplePollOutVO): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(PollStartedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(PollStartedEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = PollStartedEvtMsgBody(msg.header.userId, poll.id, poll)
      val event = PollStartedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    for {
      pvo <- Polls.handleStartCustomPollReqMsg(msg.header.userId, msg.body.pollId, msg.body.pollType, msg.body.answers, liveMeeting)
    } yield {
      broadcastEvent(msg, pvo)
    }
  }
}
