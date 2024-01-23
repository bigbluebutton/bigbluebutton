package org.bigbluebutton.core.apps.polls

import org.bigbluebutton.common2.domain.SimplePollResultOutVO
import org.bigbluebutton.common2.msgs.{ BbbClientMsgHeader, BbbCommonEnvCoreMsg, BbbCoreEnvelope, MessageTypes, PollUpdatedEvtMsg, PollUpdatedEvtMsgBody, Routing, UserRespondedToPollRecordMsg, UserRespondedToPollRecordMsgBody, UserRespondedToPollRespMsg, UserRespondedToPollRespMsgBody, UserRespondedToTypedPollRespMsg, UserRespondedToTypedPollRespMsgBody }
import org.bigbluebutton.core.running.OutMsgRouter

object PollHdlrHelpers {

  def broadcastPollUpdatedEvent(outGW: OutMsgRouter, meetingId: String, userId: String, pollId: String, poll: SimplePollResultOutVO): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(PollUpdatedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(PollUpdatedEvtMsg.NAME, meetingId, userId)

    val body = PollUpdatedEvtMsgBody(pollId, poll)
    val event = PollUpdatedEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    outGW.send(msgEvent)
  }

  def broadcastUserRespondedToTypedPollRespMsg(outGW: OutMsgRouter, meetingId: String, userId: String,
                                               pollId: String, answer: String, sendToId: String): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, sendToId)
    val envelope = BbbCoreEnvelope(UserRespondedToTypedPollRespMsg.NAME, routing)
    val header = BbbClientMsgHeader(UserRespondedToTypedPollRespMsg.NAME, meetingId, sendToId)

    val body = UserRespondedToTypedPollRespMsgBody(pollId, userId, answer)
    val event = UserRespondedToTypedPollRespMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    outGW.send(msgEvent)
  }

  def broadcastUserRespondedToPollRecordMsg(outGW: OutMsgRouter, meetingId: String, userId: String,
                                            pollId: String, answerId: Int, answer: String, isSecret: Boolean): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(UserRespondedToPollRecordMsg.NAME, routing)
    val header = BbbClientMsgHeader(UserRespondedToPollRecordMsg.NAME, meetingId, userId)

    val body = UserRespondedToPollRecordMsgBody(pollId, answerId, answer, isSecret)
    val event = UserRespondedToPollRecordMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    outGW.send(msgEvent)
  }

  def broadcastUserRespondedToPollRespMsg(outGW: OutMsgRouter, meetingId: String, userId: String,
                                          pollId: String, answerIds: Seq[Int], sendToId: String): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, sendToId)
    val envelope = BbbCoreEnvelope(UserRespondedToPollRespMsg.NAME, routing)
    val header = BbbClientMsgHeader(UserRespondedToPollRespMsg.NAME, meetingId, sendToId)

    val body = UserRespondedToPollRespMsgBody(pollId, userId, answerIds)
    val event = UserRespondedToPollRespMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    outGW.send(msgEvent)
  }

}
