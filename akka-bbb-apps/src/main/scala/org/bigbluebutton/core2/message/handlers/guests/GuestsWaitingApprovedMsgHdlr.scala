package org.bigbluebutton.core2.message.handlers.guests

import org.bigbluebutton.common2.msgs.{ GuestApprovedVO, GuestsWaitingApprovedMsg }
import org.bigbluebutton.core.apps.users.UsersApp
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.{ BaseMeetingActor, HandlerHelpers, LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait GuestsWaitingApprovedMsgHdlr extends HandlerHelpers with RightsManagementTrait {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleGuestsWaitingApprovedMsg(msg: GuestsWaitingApprovedMsg): Unit = {
    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to approve or deny guests in meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      msg.body.guests foreach { g =>
        for {
          // Remove guest from waiting list
          _ <- GuestsWaiting.remove(liveMeeting.guestsWaiting, g.guest)
        } yield {
          UsersApp.approveOrRejectGuest(liveMeeting, outGW, g, msg.body.approvedBy)
        }
      }

      notifyModeratorsOfGuestsApproval(msg.body.guests, msg.body.approvedBy)
    }
  }

  def notifyModeratorsOfGuestsApproval(guests: Vector[GuestApprovedVO], approvedBy: String): Unit = {
    val mods = Users2x.findAll(liveMeeting.users2x).filter(p => p.role == Roles.MODERATOR_ROLE && p.clientType == ClientType.FLASH)
    val meetingId = liveMeeting.props.meetingProp.intId
    mods foreach { m =>
      val event = MsgBuilder.buildGuestsWaitingApprovedEvtMsg(meetingId, m.intId, guests, approvedBy)
      outGW.send(event)
    }
    // Meteor should only listen for this single message
    val event = MsgBuilder.buildGuestsWaitingApprovedEvtMsg(meetingId, "nodeJSapp", guests, approvedBy)
    outGW.send(event)
  }
}
