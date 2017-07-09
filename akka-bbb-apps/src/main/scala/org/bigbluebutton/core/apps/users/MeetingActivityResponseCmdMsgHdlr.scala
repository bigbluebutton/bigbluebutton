package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting }

trait MeetingActivityResponseCmdMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMessageGateway

  def handleMeetingActivityResponseCmdMsg(msg: MeetingActivityResponseCmdMsg) {
    def buildMeetingIsActiveEvtMsg(meetingId: String): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, "not-used")
      val envelope = BbbCoreEnvelope(MeetingIsActiveEvtMsg.NAME, routing)
      val body = MeetingIsActiveEvtMsgBody(meetingId)
      val header = BbbClientMsgHeader(MeetingIsActiveEvtMsg.NAME, meetingId, "not-used")
      val event = MeetingIsActiveEvtMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    log.info("User endorsed that meeting {} is active", liveMeeting.props.meetingProp.intId)
    val event = buildMeetingIsActiveEvtMsg(liveMeeting.props.meetingProp.intId)
    outGW.send(event)
  }
}
