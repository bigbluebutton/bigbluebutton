package org.bigbluebutton.core.ingw

import org.bigbluebutton.core.{ MeetingProperties, OutMessageGateway }
import org.bigbluebutton.core.api.CreateMeeting
import org.bigbluebutton.core.bus.{ BigBlueButtonEvent, IncomingEventBus }
import org.bigbluebutton.messages.CreateMeetingRequest

trait CreateMeetingRequestHdlr {

  val eventBus: IncomingEventBus
  val red5DeskShareIP: String
  val red5DeskShareApp: String

  def handle(msg: CreateMeetingRequest): Unit = {
    val mProps = new MeetingProperties(
      msg.payload.id, msg.payload.externalId, msg.payload.parentId, msg.payload.name,
      msg.payload.record, msg.payload.voiceConfId, msg.payload.voiceConfId + "-DESKSHARE", // WebRTC Desktop conference id
      msg.payload.durationInMinutes, msg.payload.autoStartRecording, msg.payload.allowStartStopRecording,
      msg.payload.webcamsOnlyForModerator, msg.payload.moderatorPassword, msg.payload.viewerPassword,
      msg.payload.createTime, msg.payload.createDate, red5DeskShareIP, red5DeskShareApp,
      msg.payload.isBreakout, msg.payload.sequence)

    eventBus.publish(BigBlueButtonEvent("meeting-manager", new CreateMeeting(msg.payload.id, mProps)))
  }
}
