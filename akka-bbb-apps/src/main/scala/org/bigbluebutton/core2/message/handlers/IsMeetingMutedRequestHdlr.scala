package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{ IsMeetingMutedReply, IsMeetingMutedRequest }
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.MeetingStatus2x

trait IsMeetingMutedRequestHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleIsMeetingMutedRequest(msg: IsMeetingMutedRequest) {
    outGW.send(new IsMeetingMutedReply(props.meetingProp.intId, props.recordProp.record,
      msg.requesterID, MeetingStatus2x.isMeetingMuted(liveMeeting.status)))
  }
}
