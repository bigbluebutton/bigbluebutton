package org.bigbluebutton.core2.message.handlers.guests

import org.bigbluebutton.common2.msgs.SetGuestLobbyMessageCmdMsg
import org.bigbluebutton.core.models.{ GuestsWaiting }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.running.MeetingActor

trait SetGuestLobbyMessageMsgHdlr extends RightsManagementTrait {
  this: MeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleSetGuestLobbyMessageMsg(msg: SetGuestLobbyMessageCmdMsg): Unit = {
    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to set guest lobby message in meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      GuestsWaiting.setGuestLobbyMessage(liveMeeting.guestsWaiting, msg.body.message)
      val event = MsgBuilder.buildGuestLobbyMessageChangedEvtMsg(
        liveMeeting.props.meetingProp.intId,
        msg.header.userId,
        msg.body.message
      )
      outGW.send(event)
    }
  }
}
