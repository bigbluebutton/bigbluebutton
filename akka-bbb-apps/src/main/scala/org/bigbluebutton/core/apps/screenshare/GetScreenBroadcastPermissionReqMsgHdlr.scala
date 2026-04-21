package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.models.{ Users2x, Roles }
import org.bigbluebutton.core.apps.PermissionCheck
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait GetScreenBroadcastPermissionReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleGetScreenBroadcastPermissionReqMsg(msg: GetScreenBroadcastPermissionReqMsg) {
    var allowed = false

    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId)
    } yield {
      // Guests are never allowed to broadcast screenshare.
      if (!user.authed) {
        val meetingId = liveMeeting.props.meetingProp.intId
        val reason = "Guests may not share the screen."
        PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
      } else if (liveMeeting.props.meetingProp.intId == msg.body.meetingId
        && liveMeeting.props.voiceProp.voiceConf == msg.body.voiceConf) {
        // Viewers that are locked and disableMultiScreenshare is active are denied.
        val permissions = MeetingStatus2x.getPermissions(liveMeeting.status)
        val isLockedViewer = user.role == Roles.VIEWER_ROLE && user.locked
        if (isLockedViewer && permissions.disableMultiScreenshare) {
          val meetingId = liveMeeting.props.meetingProp.intId
          val reason = "Screen sharing is disabled for locked viewers."
          PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
        } else {
          allowed = true
        }
      }
    }

    val event = MsgBuilder.buildGetScreenBroadcastPermissionRespMsg(
      liveMeeting.props.meetingProp.intId,
      liveMeeting.props.voiceProp.voiceConf,
      msg.body.userId,
      msg.body.sfuSessionId,
      allowed
    )
    outGW.send(event)
  }
}
