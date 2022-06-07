package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ EjectReasonCode, SystemUser }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.Sender

trait EjectDuplicateUserReqMsgHdlr {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleEjectDuplicateUserReqMsg(msg: EjectDuplicateUserReqMsg) {
    val meetingId = liveMeeting.props.meetingProp.intId
    val userId = msg.body.intUserId
    val ejectedBy = SystemUser.ID

    val reason = "user ejected because of duplicate external userid"
    UsersApp.ejectUserFromMeeting(outGW, liveMeeting, userId, ejectedBy, reason, EjectReasonCode.DUPLICATE_USER, ban = false)

    // send a system message to force disconnection
    Sender.sendDisconnectClientSysMsg(meetingId, userId, ejectedBy, EjectReasonCode.DUPLICATE_USER, outGW)
  }

}
