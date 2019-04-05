package org.bigbluebutton.core2.message.handlers.guests

import org.bigbluebutton.common2.msgs.SetGuestPolicyCmdMsg
import org.bigbluebutton.core.models.{ GuestPolicy, GuestPolicyType, GuestsWaiting }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.running.MeetingActor

trait SetGuestPolicyMsgHdlr extends RightsManagementTrait {
  this: MeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleSetGuestPolicyMsg(msg: SetGuestPolicyCmdMsg): Unit = {
    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to set guest policy in meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      val newPolicy = msg.body.policy.toUpperCase()
      if (GuestPolicyType.policyTypes.contains(newPolicy)) {
        val policy = GuestPolicy(newPolicy, msg.body.setBy)
        GuestsWaiting.setGuestPolicy(liveMeeting.guestsWaiting, policy)
        val event = MsgBuilder.buildGuestPolicyChangedEvtMsg(
          liveMeeting.props.meetingProp.intId, msg.header.userId, newPolicy, msg.body.setBy
        )
        outGW.send(event)
      }
    }
  }

}
