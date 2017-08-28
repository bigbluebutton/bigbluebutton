package org.bigbluebutton.core.apps.polls

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.Polls
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait HidePollResultReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleHidePollResultReqMsg(msg: HidePollResultReqMsg): Unit = {

    def broadcastEvent(msg: HidePollResultReqMsg, hiddenPollId: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(PollHideResultEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(PollHideResultEvtMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val body = PollHideResultEvtMsgBody(msg.header.userId, hiddenPollId)
      val event = PollHideResultEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    for {
      hiddenPollId <- Polls.handleHidePollResultReqMsg(msg.header.userId, msg.body.pollId, liveMeeting)
    } yield {
      broadcastEvent(msg, hiddenPollId)
    }
  }
}
