package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs.MuteUserCmdMsg
import org.bigbluebutton.core.models.VoiceUsers
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait MuteUserCmdMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleMuteUserCmdMsg(msg: MuteUserCmdMsg) {
    log.info("Received mute user request. meetingId=" + props.meetingProp.intId + " userId="
      + msg.body.userId)
    for {
      u <- VoiceUsers.findWithIntId(liveMeeting.voiceUsers, msg.body.userId)
    } yield {
      if (u.muted != msg.body.mute) {
        log.info("Send mute user request. meetingId=" + props.meetingProp.intId + " userId=" + u.intId + " user=" + u)
        val event = MsgBuilder.buildMuteUserInVoiceConfSysMsg(props.meetingProp.intId, props.voiceProp.voiceConf,
          u.voiceUserId, msg.body.mute)
        outGW.send(event)
      }
    }
  }
}
