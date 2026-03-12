package org.bigbluebutton.core2.message.handlers.guests

import org.bigbluebutton.common2.msgs.SetGuestPolicyCmdMsg
import org.bigbluebutton.core.db.NotificationDAO
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
    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId) || liveMeeting.props.meetingProp.isBreakout) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to set guest policy in meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      val newPolicy = msg.body.policy.toUpperCase()
      if (GuestPolicyType.policyTypes.contains(newPolicy)) {
        val oldPolicy = liveMeeting.guestsWaiting.getGuestPolicy().policy
        val policy = GuestPolicy(newPolicy, msg.body.setBy)
        GuestsWaiting.setGuestPolicy(
          liveMeeting.props.meetingProp.intId,
          liveMeeting.guestsWaiting,
          policy
        )
        val event = MsgBuilder.buildGuestPolicyChangedEvtMsg(
          liveMeeting.props.meetingProp.intId, msg.header.userId, newPolicy, msg.body.setBy
        )
        outGW.send(event)

        if (oldPolicy != newPolicy) {
          val policyLabelKey: Option[String] = newPolicy match {
            case GuestPolicyType.ASK_MODERATOR      => Some("app.guest-policy.button.askModerator")
            case GuestPolicyType.ALWAYS_ACCEPT      => Some("app.guest-policy.button.alwaysAccept")
            case GuestPolicyType.ALWAYS_ACCEPT_AUTH => Some("app.guest-policy.button.alwaysAcceptAuth")
            case GuestPolicyType.ALWAYS_DENY        => Some("app.guest-policy.button.alwaysDeny")
            case _                                  => None
          }
          policyLabelKey.foreach { labelKey =>
            val notifyEvent = MsgBuilder.buildNotifyAllInMeetingEvtMsg(
              liveMeeting.props.meetingProp.intId,
              "info",
              "guest_policy",
              "app.guest-policy.feedbackMessage",
              "Label for guest policy change notification",
              Map("policy" -> labelKey)
            )
            outGW.send(notifyEvent)
            NotificationDAO.insert(notifyEvent)
          }
        }
      }
    }
  }

}
