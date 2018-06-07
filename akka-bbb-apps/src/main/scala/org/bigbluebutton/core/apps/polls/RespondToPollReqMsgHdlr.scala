package org.bigbluebutton.core.apps.polls

import org.bigbluebutton.common2.domain.SimplePollResultOutVO
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.Polls
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.models.Users2x

trait RespondToPollReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleRespondToPollReqMsg(msg: RespondToPollReqMsg): Unit = {
    log.debug("Received RespondToPollReqMsg {}", RespondToPollReqMsg)

    def broadcastPollUpdatedEvent(msg: RespondToPollReqMsg, pollId: String, poll: SimplePollResultOutVO): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(PollUpdatedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(PollUpdatedEvtMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val body = PollUpdatedEvtMsgBody(pollId, poll)
      val event = PollUpdatedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    def broadcastUserRespondedToPollRecordMsg(msg: RespondToPollReqMsg, pollId: String, answerId: Int): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(UserRespondedToPollRecordMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserRespondedToPollRecordMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val body = UserRespondedToPollRecordMsgBody(pollId, answerId)
      val event = UserRespondedToPollRecordMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    def broadcastUserRespondedToPollRespMsg(msg: RespondToPollReqMsg, pollId: String, answerId: Int, sendToId: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, props.meetingProp.intId, sendToId)
      val envelope = BbbCoreEnvelope(UserRespondedToPollRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserRespondedToPollRespMsg.NAME, props.meetingProp.intId, sendToId)

      val body = UserRespondedToPollRespMsgBody(pollId, msg.header.userId, answerId)
      val event = UserRespondedToPollRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    for {
      (pollId: String, updatedPoll: SimplePollResultOutVO) <- Polls.handleRespondToPollReqMsg(msg.header.userId, msg.body.pollId,
        msg.body.questionId, msg.body.answerId, liveMeeting)
    } yield {
      broadcastPollUpdatedEvent(msg, pollId, updatedPoll)
      broadcastUserRespondedToPollRecordMsg(msg, pollId, msg.body.answerId)

      for {
        presenter <- Users2x.findPresenter(liveMeeting.users2x)
      } yield {
        broadcastUserRespondedToPollRespMsg(msg, pollId, msg.body.answerId, presenter.intId)
      }
    }
  }
}
