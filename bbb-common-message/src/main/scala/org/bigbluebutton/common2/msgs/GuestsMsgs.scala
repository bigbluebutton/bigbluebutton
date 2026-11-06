package org.bigbluebutton.common2.msgs

/**
 * Message from client when a guest had been approved to be accepted into the meeting.
 */
object GuestsWaitingApprovedMsg { val NAME = "GuestsWaitingApprovedMsg" }
case class GuestsWaitingApprovedMsg(
    header: BbbClientMsgHeader,
    body:   GuestsWaitingApprovedMsgBody
) extends StandardMsg
case class GuestsWaitingApprovedMsgBody(guests: Vector[GuestApprovedVO], approvedBy: String)
case class GuestApprovedVO(guest: String, status: String)

/**
 * Message sent when guests have been approved or denied. bbb-web consumes it to keep
 * the users' session guestStatus current.
 */
object GuestsWaitingApprovedEvtMsg { val NAME = "GuestsWaitingApprovedEvtMsg" }
case class GuestsWaitingApprovedEvtMsg(
    header: BbbClientMsgHeader,
    body:   GuestsWaitingApprovedEvtMsgBody
) extends BbbCoreMsg
case class GuestsWaitingApprovedEvtMsgBody(guests: Vector[GuestApprovedVO], approvedBy: String)

/**
 * Message from user to set the guest policy.
 */
object SetGuestPolicyCmdMsg { val NAME = "SetGuestPolicyCmdMsg" }
case class SetGuestPolicyCmdMsg(
    header: BbbClientMsgHeader,
    body:   SetGuestPolicyCmdMsgBody
) extends StandardMsg
case class SetGuestPolicyCmdMsgBody(policy: String, setBy: String)

/**
 * Message sent to all clients that guest policy has been changed.
 */
object GuestPolicyChangedEvtMsg { val NAME = "GuestPolicyChangedEvtMsg" }
case class GuestPolicyChangedEvtMsg(
    header: BbbClientMsgHeader,
    body:   GuestPolicyChangedEvtMsgBody
) extends BbbCoreMsg
case class GuestPolicyChangedEvtMsgBody(policy: String, setBy: String)

/**
 * Message from user to set the guest lobby message.
 */
object SetGuestLobbyMessageCmdMsg { val NAME = "SetGuestLobbyMessageCmdMsg" }
case class SetGuestLobbyMessageCmdMsg(
    header: BbbClientMsgHeader,
    body:   SetGuestLobbyMessageCmdMsgBody
) extends StandardMsg
case class SetGuestLobbyMessageCmdMsgBody(message: String)

/**
 * Message from moderator to set the guest lobby message for a specific user.
 */
object SetPrivateGuestLobbyMessageCmdMsg { val NAME = "SetPrivateGuestLobbyMessageCmdMsg" }
case class SetPrivateGuestLobbyMessageCmdMsg(
    header: BbbClientMsgHeader,
    body:   SetPrivateGuestLobbyMessageCmdMsgBody
) extends StandardMsg
case class SetPrivateGuestLobbyMessageCmdMsgBody(guestId: String, message: String)
