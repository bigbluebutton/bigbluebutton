package org.bigbluebutton.core.apps.polls

import org.bigbluebutton.common2.domain.SimplePollOutVO
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.Polls
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait StartCustomPollReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleStartCustomPollReqMsg(msg: StartCustomPollReqMsg): Unit = {

    def broadcastEvent(msg: StartCustomPollReqMsg, poll: SimplePollOutVO): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(PollStartedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(PollStartedEvtMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val body = PollStartedEvtMsgBody(msg.header.userId, poll.id, poll)
      val event = PollStartedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    for {
      pvo <- Polls.handleStartCustomPollReqMsg(msg.header.userId, msg.body.pollId, msg.body.pollType, msg.body.answers, liveMeeting)
    } yield {
      broadcastEvent(msg, pvo)
    }
  }
}
