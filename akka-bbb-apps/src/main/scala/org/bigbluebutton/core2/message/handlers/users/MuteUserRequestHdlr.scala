package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{MuteUserRequest, MuteVoiceUser}
import org.bigbluebutton.core.models.Users
import org.bigbluebutton.core.running.MeetingActor

trait MuteUserRequestHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleMuteUserRequest(msg: MuteUserRequest) {
    log.info("Received mute user request. meetingId=" + props.meetingProp.intId + " userId=" + msg.userID + " mute=" + msg.mute)
    for {
      u <- Users.findWithId(msg.userID, liveMeeting.users)
    } yield {
      log.info("Send mute user request. meetingId=" + props.meetingProp.intId + " userId=" + u.id + " user=" + u)
      outGW.send(new MuteVoiceUser(props.meetingProp.intId, props.recordProp.record,
        msg.requesterID, u.id, props.voiceProp.voiceConf, u.voiceUser.userId, msg.mute))
    }
  }
}
