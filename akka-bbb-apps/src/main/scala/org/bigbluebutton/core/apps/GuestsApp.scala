package org.bigbluebutton.core.apps

import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.message.handlers.guests._

trait GuestsApp extends GuestsWaitingApprovedMsgHdlr
  with SetGuestPolicyMsgHdlr
  with SetGuestLobbyMessageMsgHdlr
  with SetPrivateGuestLobbyMessageCmdMsgHdlr {

  this: MeetingActor =>

}
