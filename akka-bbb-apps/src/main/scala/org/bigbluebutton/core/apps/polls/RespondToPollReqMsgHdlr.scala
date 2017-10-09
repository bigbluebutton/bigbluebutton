package org.bigbluebutton.core.apps.polls

import org.bigbluebutton.common2.domain.SimplePollResultOutVO
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.models.Polls
import org.bigbluebutton.core.running.{ LiveMeeting }

trait RespondToPollReqMsgHdlr {
  this: PollApp2x =>

  def handle(msg: RespondToPollReqMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    log.debug("Received RespondToPollReqMsg {}", RespondToPollReqMsg)

    def broadcastEvent(msg: RespondToPollReqMsg, stoppedPollId: String, presenterId: String, poll: SimplePollResultOutVO): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(UserRespondedToPollEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserRespondedToPollEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = UserRespondedToPollEvtMsgBody(presenterId, stoppedPollId, poll)
      val event = UserRespondedToPollEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    for {
      (curPresenterId: String, pollId: String, updatedPoll: SimplePollResultOutVO) <- Polls.handleRespondToPollReqMsg(msg.header.userId, msg.body.pollId,
        msg.body.questionId, msg.body.answerId, liveMeeting)
    } yield {
      broadcastEvent(msg, pollId, curPresenterId, updatedPoll)
    }
  }
}
