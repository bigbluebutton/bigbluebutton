package org.bigbluebutton.core.apps.users

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.msgs.MuteUserCmdMsg
import org.bigbluebutton.core.apps.PermissionCheck
import org.bigbluebutton.core.models.VoiceUsers
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait MuteUserCmdMsgHdlrDefault {
  def handleMuteUserCmdMsg(msg: MuteUserCmdMsg): Unit = {
    println("**************** MuteUserCmdMsgHdlrDefault ")
  }
}

trait MuteUserCmdMsgHdlrPermCheck extends MuteUserCmdMsgHdlrDefault with SystemConfiguration {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  override def handleMuteUserCmdMsg(msg: MuteUserCmdMsg): Unit = {
    println("**************** MuteUserCmdMsgHdlrPermCheck ")

    val isAllowed = PermissionCheck.isAllowed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.body.mutedBy
    )

    if (applyPermissionCheck && !isAllowed) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to mute user in meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.body.mutedBy, reason, outGW)
    } else {
      super.handleMuteUserCmdMsg(msg)
    }
  }
}

trait MuteUserCmdMsgHdlr extends MuteUserCmdMsgHdlrDefault {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  override def handleMuteUserCmdMsg(msg: MuteUserCmdMsg) {
    println("**************** MuteUserCmdMsgHdlr ")

    val meetingId = liveMeeting.props.meetingProp.intId
    val voiceConf = liveMeeting.props.voiceProp.voiceConf

    log.info("Received mute user request. meetingId=" + meetingId + " userId="
      + msg.body.userId)
    for {
      u <- VoiceUsers.findWithIntId(liveMeeting.voiceUsers, msg.body.userId)
    } yield {
      log.info("Send mute user request. meetingId=" + meetingId + " userId=" + u.intId + " user=" + u)
      val event = MsgBuilder.buildMuteUserInVoiceConfSysMsg(meetingId, voiceConf,
        u.voiceUserId, !u.muted)
      outGW.send(event)
    }
  }
}
