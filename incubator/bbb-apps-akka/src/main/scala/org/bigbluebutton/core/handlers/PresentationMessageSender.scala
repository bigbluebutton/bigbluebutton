package org.bigbluebutton.core.handlers

import org.bigbluebutton.core.LiveMeeting
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.domain._

trait PresentationMessageSender {
  this: LiveMeeting =>
  val outGW: OutMessageGateway

  def sendClearPresentation(meetingId: IntMeetingId, recorded: Recorded): Unit = {
    outGW.send(new ClearPresentationOutMsg(meetingId, recorded))
  }

  def sendRemovePresentation(meetingId: IntMeetingId, recorded: Recorded, presentationId: PresentationId): Unit = {
    outGW.send(new RemovePresentationOutMsg(meetingId, recorded, presentationId))
  }

  def sendGetPresentationInfo(): Unit = {
  }
  def sendGetPresentationInfo(meetingId: IntMeetingId, recorded: Recorded, userId: IntUserId,
    presentationInfo: CurrentPresentationInfo, replyTo: ReplyTo): Unit = {
    outGW.send(new GetPresentationInfoOutMsg(meetingId, recorded, userId, presentationInfo, replyTo))
  }
}