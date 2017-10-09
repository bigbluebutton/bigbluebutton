package org.bigbluebutton.core.apps.polls

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.models.Polls
import org.bigbluebutton.core.running.LiveMeeting

trait StopPollReqMsgHdlr {
  this: PollApp2x =>

  def broadcastPollStoppedEvtMsg(requesterId: String, stoppedPollId: String, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, requesterId)
    val envelope = BbbCoreEnvelope(PollStoppedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(PollStoppedEvtMsg.NAME, liveMeeting.props.meetingProp.intId, requesterId)

    val body = PollStoppedEvtMsgBody(requesterId, stoppedPollId)
    val event = PollStoppedEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    bus.outGW.send(msgEvent)
  }

  def handle(msg: StopPollReqMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    for {
      stoppedPollId <- Polls.handleStopPollReqMsg(msg.header.userId, liveMeeting)
    } yield {
      broadcastPollStoppedEvtMsg(msg.header.userId, stoppedPollId, liveMeeting, bus)
    }
  }

  def stopPoll(requesterId: String, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    for {
      stoppedPollId <- Polls.handleStopPollReqMsg(requesterId, liveMeeting)
    } yield {
      broadcastPollStoppedEvtMsg(requesterId, stoppedPollId, liveMeeting, bus)
    }
  }

}
