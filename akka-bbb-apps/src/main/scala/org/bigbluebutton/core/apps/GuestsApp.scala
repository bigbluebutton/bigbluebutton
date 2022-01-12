package org.bigbluebutton.core.apps

import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.message.handlers.guests._

trait GuestsApp extends GetGuestsWaitingApprovalReqMsgHdlr
  with GuestsWaitingApprovedMsgHdlr
  with GuestWaitingLeftMsgHdlr
  with UpdatePositionInWaitingQueueReqMsgHdlr
  with SetGuestPolicyMsgHdlr
  with SetGuestLobbyMessageMsgHdlr
  with GetGuestPolicyReqMsgHdlr {

  this: MeetingActor =>

}
