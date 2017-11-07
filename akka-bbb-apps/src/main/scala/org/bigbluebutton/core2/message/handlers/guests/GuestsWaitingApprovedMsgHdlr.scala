package org.bigbluebutton.core2.message.handlers.guests

import org.bigbluebutton.common2.msgs.{ GuestApprovedVO, GuestsWaitingApprovedMsg }
import org.bigbluebutton.core.apps.users.UsersApp
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.{ BaseMeetingActor, HandlerHelpers, LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait GuestsWaitingApprovedMsgHdlr extends HandlerHelpers {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleGuestsWaitingApprovedMsg(msg: GuestsWaitingApprovedMsg): Unit = {
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
