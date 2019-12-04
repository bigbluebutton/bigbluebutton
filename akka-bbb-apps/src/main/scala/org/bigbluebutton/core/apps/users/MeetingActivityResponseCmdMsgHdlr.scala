package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

trait MeetingActivityResponseCmdMsgHdlr {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleMeetingActivityResponseCmdMsg(
      msg:   MeetingActivityResponseCmdMsg,
      state: MeetingState2x
  ): MeetingState2x = {
    processMeetingActivityResponse(liveMeeting.props, outGW, msg)
    val tracker = state.inactivityTracker.resetWarningSentAndTimestamp()
    state.update(tracker)
  }

  def processMeetingActivityResponse(
      props: DefaultProps,
      outGW: OutMsgRouter,
      msg:   MeetingActivityResponseCmdMsg
  ): Unit = {

    def buildMeetingIsActiveEvtMsg(meetingId: String): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, "not-used")
      val envelope = BbbCoreEnvelope(MeetingIsActiveEvtMsg.NAME, routing)
      val body = MeetingIsActiveEvtMsgBody(meetingId)
      val header = BbbClientMsgHeader(MeetingIsActiveEvtMsg.NAME, meetingId, "not-used")
      val event = MeetingIsActiveEvtMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    val event = buildMeetingIsActiveEvtMsg(props.meetingProp.intId)
    outGW.send(event)

  }
}
