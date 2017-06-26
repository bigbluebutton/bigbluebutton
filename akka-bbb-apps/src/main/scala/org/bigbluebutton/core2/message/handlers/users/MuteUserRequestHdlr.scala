package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{ MuteUserRequest, MuteVoiceUser }
import org.bigbluebutton.core.models.{ Users, Users2x, VoiceUsers }
import org.bigbluebutton.core.running.MeetingActor

trait MuteUserRequestHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleMuteUserRequest(msg: MuteUserRequest) {
    log.info("Received mute user request. meetingId=" + props.meetingProp.intId + " userId=" + msg.userID + " mute=" + msg.mute)
    for {
      u <- VoiceUsers.findWithIntId(liveMeeting.voiceUsers, msg.userID)
    } yield {
      log.info("Send mute user request. meetingId=" + props.meetingProp.intId + " userId=" + u.intId + " user=" + u)
      outGW.send(new MuteVoiceUser(props.meetingProp.intId, props.recordProp.record,
        msg.requesterID, u.intId, props.voiceProp.voiceConf, u.voiceUserId, msg.mute))
    }
  }
}
