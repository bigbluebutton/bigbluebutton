package org.bigbluebutton.core.apps

import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.message.handlers.guests.{ GetGuestPolicyReqMsgHdlr, GetGuestsWaitingApprovalReqMsgHdlr, GuestsWaitingApprovedMsgHdlr, SetGuestPolicyMsgHdlr }

trait GuestsApp extends GetGuestsWaitingApprovalReqMsgHdlr
  with GuestsWaitingApprovedMsgHdlr
  with SetGuestPolicyMsgHdlr
  with GetGuestPolicyReqMsgHdlr {

  this: MeetingActor =>

}
