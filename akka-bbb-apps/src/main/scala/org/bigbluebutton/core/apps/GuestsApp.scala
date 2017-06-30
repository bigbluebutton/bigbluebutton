package org.bigbluebutton.core.apps

import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.message.handlers.guests.{ GetGuestsWaitingApprovalReqMsgHdlr, GuestsWaitingApprovedMsgHdlr, SetGuestPolicyMsgHdlr }

trait GuestsApp extends GetGuestsWaitingApprovalReqMsgHdlr
    with GuestsWaitingApprovedMsgHdlr
    with SetGuestPolicyMsgHdlr {

  this: MeetingActor =>

}
