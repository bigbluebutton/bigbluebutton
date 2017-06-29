package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{ EjectUserFromVoiceRequest, EjectVoiceUser }
import org.bigbluebutton.core.models.Users1x
import org.bigbluebutton.core.running.MeetingActor

trait EjectUserFromVoiceRequestHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleEjectUserRequest(msg: EjectUserFromVoiceRequest) {
    log.info("Received eject user request. meetingId=" + msg.meetingID + " userId=" + msg.userId)

    for {
      u <- Users1x.findWithId(msg.userId, liveMeeting.users)
    } yield {
      if (u.voiceUser.joined) {
        log.info("Ejecting user from voice.  meetingId=" + props.meetingProp.intId + " userId=" + u.id)
        outGW.send(new EjectVoiceUser(props.meetingProp.intId, props.recordProp.record, msg.ejectedBy, u.id,
          props.voiceProp.voiceConf, u.voiceUser.userId))
      }
    }
  }
}
