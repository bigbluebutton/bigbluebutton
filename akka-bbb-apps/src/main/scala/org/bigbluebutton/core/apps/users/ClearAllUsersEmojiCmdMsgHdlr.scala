package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait ClearAllUsersEmojiCmdMsgHdlr extends RightsManagementTrait {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleClearAllUsersEmojiCmdMsg(msg: ClearAllUsersEmojiCmdMsg) {
    val isUserModerator = !permissionFailed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL,
      liveMeeting.users2x,
      msg.header.userId
    )

    if (isUserModerator) {
      for {
        user <- Users2x.findAll(liveMeeting.users2x)
        if user.emoji.equals("raiseHand") || user.emoji.equals("away") || user.emoji.equals("notAway")
      } yield {
        Users2x.setEmojiStatus(liveMeeting.users2x, user.intId, "none")
      }
      sendClearedAllUsersEmojiEvtMsg(outGW, liveMeeting.props.meetingProp.intId, msg.header.userId)
    } else {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to clear users reactions."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    }
  }

  def sendClearedAllUsersEmojiEvtMsg(outGW: OutMsgRouter, meetingId: String, userId: String): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(ClearedAllUsersEmojiEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(ClearedAllUsersEmojiEvtMsg.NAME, meetingId, userId)
    val body = ClearedAllUsersEmojiEvtMsgBody()
    val event = ClearedAllUsersEmojiEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    outGW.send(msgEvent)
  }
}
