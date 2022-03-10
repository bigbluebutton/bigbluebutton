package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.core.api.EjectUserFromBreakoutInternalMsg
import org.bigbluebutton.core.apps.users.UsersApp
import org.bigbluebutton.core.models.{ RegisteredUsers }
import org.bigbluebutton.core.running.{ LiveMeeting, MeetingActor, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.Sender

trait EjectUserFromBreakoutInternalMsgHdlr {
  this: MeetingActor =>

  val liveMeeting: LiveMeeting

  val outGW: OutMsgRouter

  def handleEjectUserFromBreakoutInternalMsgHdlr(msg: EjectUserFromBreakoutInternalMsg) = {

    for {
      registeredUser <- RegisteredUsers.findAllWithExternUserId(msg.extUserId, liveMeeting.registeredUsers)
    } yield {
      UsersApp.ejectUserFromMeeting(
        outGW,
        liveMeeting,
        registeredUser.id,
        msg.ejectedBy,
        msg.reason,
        msg.reasonCode,
        msg.ban
      )
      // send a system message to force disconnection
      Sender.sendDisconnectClientSysMsg(msg.breakoutId, registeredUser.id, msg.ejectedBy, msg.reasonCode, outGW)

      log.info("Eject user {} id={} in breakoutId {}", registeredUser.name, registeredUser.id, msg.breakoutId)
    }

  }
}
