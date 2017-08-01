package org.bigbluebutton.core2.message.handlers.guests

import org.bigbluebutton.common2.msgs.{ GuestApprovedVO, GuestsWaitingApprovedMsg }
import org.bigbluebutton.core.models.{ GuestsWaiting, RegisteredUsers, Roles, Users2x }
import org.bigbluebutton.core.running.{ BaseMeetingActor, HandlerHelpers, LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.{ MsgBuilder }

trait GuestsWaitingApprovedMsgHdlr extends HandlerHelpers {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleGuestsWaitingApprovedMsg(msg: GuestsWaitingApprovedMsg): Unit = {
    msg.body.guests foreach { g =>
      approveOrRejectGuest(g, msg.body.approvedBy)
    }

    notifyModeratorsOfGuestsApproval(msg.body.guests, msg.body.approvedBy)
  }

  def approveOrRejectGuest(guest: GuestApprovedVO, approvedBy: String): Unit = {
    for {
      // Remove guest from waiting list
      g <- GuestsWaiting.remove(liveMeeting.guestsWaiting, guest.guest)
      u <- RegisteredUsers.findWithUserId(g.intId, liveMeeting.registeredUsers)
    } yield {
      if (guest.approved) {
        RegisteredUsers.setWaitingForApproval(liveMeeting.registeredUsers, u, false)
        // send message to user that he has been approved
      }
      val event = MsgBuilder.buildGuestApprovedEvtMsg(
        liveMeeting.props.meetingProp.intId,
        g.intId, guest.approved, approvedBy
      )

      outGW.send(event)

    }
  }

  def notifyModeratorsOfGuestsApproval(guests: Vector[GuestApprovedVO], approvedBy: String): Unit = {
    val mods = Users2x.findAll(liveMeeting.users2x).filter(p => p.role == Roles.MODERATOR_ROLE)
    mods foreach { m =>
      val event = MsgBuilder.buildGuestsWaitingApprovedEvtMsg(
        liveMeeting.props.meetingProp.intId,
        m.intId, guests, approvedBy
      )
      outGW.send(event)
    }
  }
}
