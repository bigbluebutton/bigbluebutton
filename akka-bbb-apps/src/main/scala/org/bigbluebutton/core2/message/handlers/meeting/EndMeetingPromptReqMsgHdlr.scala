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
    val meetingId = msg.body.meetingId
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(EndMeetingPromptEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(EndMeetingPromptEvtMsg.NAME, meetingId, "not-used")
    val body = EndMeetingPromptEvtMsgBody(meetingId)
    val event = BbbCommonEnvCoreMsg(envelope, EndMeetingPromptEvtMsg(header, body))
    outGW.send(event)
  }
}
