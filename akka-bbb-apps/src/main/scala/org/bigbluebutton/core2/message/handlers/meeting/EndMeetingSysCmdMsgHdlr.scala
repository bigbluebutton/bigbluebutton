package org.bigbluebutton.core2.message.handlers.meeting

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting }
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait EndMeetingSysCmdMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMessageGateway

  def handleEndMeeting(msg: EndMeetingSysCmdMsg) {
    // Broadcast users the meeting will end
    outGW.send(MsgBuilder.buildMeetingEndingEvtMsg(liveMeeting.props.meetingProp.intId))

    MeetingStatus2x.meetingHasEnded(liveMeeting.status)

    // Sent from akka-apps to bbb-web to inform about end of meeting
    outGW.send(MsgBuilder.buildMeetingEndedEvtMsg(liveMeeting.props.meetingProp.intId))
  }

}
