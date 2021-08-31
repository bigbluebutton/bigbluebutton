package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ Users2x, VoiceUsers }
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait ChangeUserNameCmdMsgHdlr extends RightsManagementTrait {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleChangeUserNameCmdMsg(msg: ChangeUserNameCmdMsg) {
    if (((msg.body.userId != msg.header.userId) && !permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.body.userId)) // cannot change other moderator's name
      || permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to change user name."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      // Voice users aren't contained in liveMeeting.users2x
      if (Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId).isDefined) {
        Users2x.setUserName(liveMeeting.users2x, msg.body.userId, msg.body.newUserName)
      }
      sendUserNameChangedEvtMsg(outGW, liveMeeting.props.meetingProp.intId, msg.body.userId, msg.body.newUserName)
      VoiceUsers.callerNameChanged(liveMeeting.voiceUsers, msg.body.userId, msg.body.newUserName)
    }
  }

  def sendUserNameChangedEvtMsg(outGW: OutMsgRouter, meetingId: String, userId: String, newUserName: String): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(UserNameChangedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(UserNameChangedEvtMsg.NAME, meetingId, userId)
    val body = UserNameChangedEvtMsgBody(userId, newUserName)
    val event = UserNameChangedEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    outGW.send(msgEvent)
  }
}
