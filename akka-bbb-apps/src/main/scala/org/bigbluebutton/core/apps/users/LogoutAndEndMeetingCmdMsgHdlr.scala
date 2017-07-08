package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{ EndMeeting, LogoutEndMeeting }
import org.bigbluebutton.core.models.{ Roles, Users2x }
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting }
import org.bigbluebutton.core2.MeetingStatus2x

trait LogoutAndEndMeetingCmdMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMessageGateway

  def handleLogoutAndEndMeetingCmdMsg(msg: LogoutAndEndMeetingCmdMsg) {
    for {
      u <- Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId)
    } yield {
      if (u.role == Roles.MODERATOR_ROLE) {
        endMeeting()
      }
    }

    def endMeeting(): Unit = {
      def buildMeetingEndingEvtMsg(meetingId: String): BbbCommonEnvCoreMsg = {
        val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, "not-used")
        val envelope = BbbCoreEnvelope(MeetingEndingEvtMsg.NAME, routing)
        val body = MeetingEndingEvtMsgBody(meetingId)
        val header = BbbClientMsgHeader(MeetingEndingEvtMsg.NAME, meetingId, "not-used")
        val event = MeetingEndingEvtMsg(header, body)

        BbbCommonEnvCoreMsg(envelope, event)
      }

      val endingEvent = buildMeetingEndingEvtMsg(liveMeeting.props.meetingProp.intId)

      // Broadcast users the meeting will end
      outGW.send(endingEvent)

      MeetingStatus2x.meetingHasEnded(liveMeeting.status)

      def buildMeetingEndedEvtMsg(meetingId: String): BbbCommonEnvCoreMsg = {
        val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
        val envelope = BbbCoreEnvelope(MeetingEndedEvtMsg.NAME, routing)
        val body = MeetingEndedEvtMsgBody(meetingId)
        val header = BbbCoreBaseHeader(MeetingEndedEvtMsg.NAME)
        val event = MeetingEndedEvtMsg(header, body)

        BbbCommonEnvCoreMsg(envelope, event)
      }

      val endedEvnt = buildMeetingEndedEvtMsg(liveMeeting.props.meetingProp.intId)
      outGW.send(endedEvnt)
    }
  }
}
