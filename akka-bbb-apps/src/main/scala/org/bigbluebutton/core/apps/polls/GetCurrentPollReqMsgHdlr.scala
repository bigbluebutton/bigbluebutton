package org.bigbluebutton.core.apps.polls

import org.bigbluebutton.common2.domain.PollVO
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.Polls
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait GetCurrentPollReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleGetCurrentPollReqMsg(msgIn: GetCurrentPollReqMsg): Unit = {

    def broadcastEvent(msg: GetCurrentPollReqMsg, hasPoll: Boolean, pvo: Option[PollVO]): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(GetCurrentPollRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(GetCurrentPollRespMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val body = GetCurrentPollRespMsgBody(msg.header.userId, hasPoll, pvo)
      val event = GetCurrentPollRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    val pollVO = Polls.handleGetCurrentPollReqMsg(msgIn.header.userId, liveMeeting)

    pollVO match {
      case Some(poll) => {
        broadcastEvent(msgIn, true, pollVO)
      }
      case None => {
        broadcastEvent(msgIn, false, None)
      }
    }
  }
}
