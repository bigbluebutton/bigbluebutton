package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }

trait ClearAllUsersReactionCmdMsgHdlr extends RightsManagementTrait {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleClearAllUsersReactionCmdMsg(msg: ClearAllUsersReactionCmdMsg) {
    val isUserModerator = !permissionFailed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL,
      liveMeeting.users2x,
      msg.header.userId
    )

    if (isUserModerator) {
      for {
        user <- Users2x.findAll(liveMeeting.users2x)
      } yield {
        //Don't clear away and RaiseHand
        Users2x.setReactionEmoji(liveMeeting.users2x, user.intId, "none")
      }
      sendClearedAllUsersReactionEvtMsg(outGW, liveMeeting.props.meetingProp.intId, msg.header.userId)
    } else {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to clear users reactions."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    }
  }

  def sendClearedAllUsersReactionEvtMsg(outGW: OutMsgRouter, meetingId: String, userId: String): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(ClearedAllUsersReactionEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(ClearedAllUsersReactionEvtMsg.NAME, meetingId, userId)
    val body = ClearedAllUsersReactionEvtMsgBody()
    val event = ClearedAllUsersReactionEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    outGW.send(msgEvent)
  }
}
