package org.bigbluebutton.core.apps.polls

import org.bigbluebutton.common2.domain.SimplePollResultOutVO
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.models.Polls
import org.bigbluebutton.core.running.{ LiveMeeting }
import org.bigbluebutton.core.models.Users2x

trait RespondToTypedPollReqMsgHdlr {
  this: PollApp2x =>

  def handle(msg: RespondToTypedPollReqMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastPollUpdatedEvent(msg: RespondToTypedPollReqMsg, pollId: String, poll: SimplePollResultOutVO): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(PollUpdatedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(PollUpdatedEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = PollUpdatedEvtMsgBody(pollId, poll)
      val event = PollUpdatedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    def broadcastUserRespondedToTypedPollRespMsg(msg: RespondToTypedPollReqMsg, pollId: String, answer: String, sendToId: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, sendToId)
      val envelope = BbbCoreEnvelope(UserRespondedToTypedPollRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserRespondedToTypedPollRespMsg.NAME, liveMeeting.props.meetingProp.intId, sendToId)

      val body = UserRespondedToTypedPollRespMsgBody(pollId, msg.header.userId, answer)
      val event = UserRespondedToTypedPollRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (Polls.isResponsePollType(msg.body.pollId, liveMeeting.polls) &&
      Polls.checkUserResponded(msg.body.pollId, msg.header.userId, liveMeeting.polls) == false &&
      Polls.checkUserAddedQuestion(msg.body.pollId, msg.header.userId, liveMeeting.polls) == false) {
      for {
        (pollId: String, updatedPoll: SimplePollResultOutVO) <- Polls.handleRespondToTypedPollReqMsg(msg.header.userId, msg.body.pollId,
          msg.body.questionId, msg.body.answer, liveMeeting)
      } yield {
        broadcastPollUpdatedEvent(msg, pollId, updatedPoll)

        for {
          presenter <- Users2x.findPresenter(liveMeeting.users2x)
        } yield {
          broadcastUserRespondedToTypedPollRespMsg(msg, pollId, msg.body.answer, presenter.intId)
        }
      }
    } else {
      log.info("Ignoring typed answer from user {} once user already added an answer to this poll {} in meeting {}", msg.header.userId, msg.body.pollId, msg.header.meetingId)
    }
  }
}
