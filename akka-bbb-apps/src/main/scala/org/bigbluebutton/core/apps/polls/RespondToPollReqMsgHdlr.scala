package org.bigbluebutton.core.apps.polls

import org.bigbluebutton.common2.domain.SimplePollResultOutVO
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.Polls
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait RespondToPollReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleRespondToPollReqMsg(msg: RespondToPollReqMsg): Unit = {
    log.debug("Received RespondToPollReqMsg {}", RespondToPollReqMsg)

    def broadcastEvent(msg: RespondToPollReqMsg, stoppedPollId: String, presenterId: String, poll: SimplePollResultOutVO): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(UserRespondedToPollEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserRespondedToPollEvtMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val body = UserRespondedToPollEvtMsgBody(presenterId, stoppedPollId, poll)
      val event = UserRespondedToPollEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    for {
      (curPresenterId: String, pollId: String, updatedPoll: SimplePollResultOutVO) <- Polls.handleRespondToPollReqMsg(msg.header.userId, msg.body.pollId,
        msg.body.questionId, msg.body.answerId, liveMeeting)
    } yield {
      broadcastEvent(msg, pollId, curPresenterId, updatedPoll)
    }
  }
}
