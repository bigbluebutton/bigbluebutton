package org.bigbluebutton.core2.message.handlers.meeting

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.InternalEventBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.{ Roles, Users2x }
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }

trait EndMeetingPromptReqMsgHdlr {

  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter
  val eventBus: InternalEventBus

  def handleEndMeetingPromptReqMsg(msg: EndMeetingPromptReqMsg, state: MeetingState2x) = {
    for {
      u <- Users2x.findAll(liveMeeting.users2x)
    } yield {
      if (u.role == Roles.MODERATOR_ROLE) {
        val meetingId = msg.body.meetingId
        val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, u.intId)
        val envelope = BbbCoreEnvelope(EndMeetingPromptEvtMsg.NAME, routing)
        val body = EndMeetingPromptEvtMsgBody(meetingId)
        val header = BbbClientMsgHeader(EndMeetingPromptEvtMsg.NAME, meetingId, u.intId)
        val event = EndMeetingPromptEvtMsg(header, body)
        BbbCommonEnvCoreMsg(envelope, event)
      }
    }
  }
}
