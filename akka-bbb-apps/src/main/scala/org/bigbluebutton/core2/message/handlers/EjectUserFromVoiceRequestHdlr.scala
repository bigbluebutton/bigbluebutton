package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{ EjectUserFromVoiceRequest, EjectVoiceUser }
import org.bigbluebutton.core.models.VoiceUsers
import org.bigbluebutton.core.running.MeetingActor

trait EjectUserFromVoiceRequestHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleEjectUserRequest(msg: EjectUserFromVoiceRequest) {
    log.info("Received eject user request. meetingId=" + msg.meetingID + " userId=" + msg.userId)

    for {
      u <- VoiceUsers.findWithIntId(liveMeeting.voiceUsers, msg.userId)
    } yield {
      log.info("Ejecting user from voice.  meetingId=" + props.meetingProp.intId + " userId=" + u.intId)
      outGW.send(new EjectVoiceUser(props.meetingProp.intId, props.recordProp.record, msg.ejectedBy, u.intId,
        props.voiceProp.voiceConf, u.voiceUserId))
    }
  }
}
