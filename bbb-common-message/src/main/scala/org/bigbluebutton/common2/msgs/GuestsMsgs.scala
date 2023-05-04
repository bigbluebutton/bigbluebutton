package org.bigbluebutton.common2.msgs

/**
 * Message sent by client to get list of guests waiting for approval.
 */
object GetGuestsWaitingApprovalReqMsg { val NAME = "GetGuestsWaitingApprovalReqMsg" }
case class GetGuestsWaitingApprovalReqMsg(
    header: BbbClientMsgHeader,
    body:   GetGuestsWaitingApprovalReqMsgBody
) extends StandardMsg
case class GetGuestsWaitingApprovalReqMsgBody(requesterId: String)

/**
 * Message sent to client in response to request for list of guests waiting for approval.
 */
object GetGuestsWaitingApprovalRespMsg { val NAME = "GetGuestsWaitingApprovalRespMsg" }
case class GetGuestsWaitingApprovalRespMsg(
    header: BbbClientMsgHeader,
    body:   GetGuestsWaitingApprovalRespMsgBody
) extends BbbCoreMsg
case class GetGuestsWaitingApprovalRespMsgBody(guests: Vector[GuestWaitingVO])
case class GuestWaitingVO(intId: String, name: String, role: String, guest: Boolean, avatar: String, color: String, authenticated: Boolean, registeredOn: Long)

/**
 * Message sent to client for list of guest waiting for approval. This is sent when
 * a user joins the meeting and need to be approved before being put into the meeting.
 */
object GuestsWaitingForApprovalEvtMsg { val NAME = "GuestsWaitingForApprovalEvtMsg" }
case class GuestsWaitingForApprovalEvtMsg(
    header: BbbClientMsgHeader,
    body:   GuestsWaitingForApprovalEvtMsgBody
) extends BbbCoreMsg
case class GuestsWaitingForApprovalEvtMsgBody(guests: Vector[GuestWaitingVO])

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
 * Message sent to all clients that a guest has been approved to get into the meeting.
 */
object GuestsWaitingApprovedEvtMsg { val NAME = "GuestsWaitingApprovedEvtMsg" }
case class GuestsWaitingApprovedEvtMsg(
    header: BbbClientMsgHeader,
    body:   GuestsWaitingApprovedEvtMsgBody
) extends BbbCoreMsg
case class GuestsWaitingApprovedEvtMsgBody(guests: Vector[GuestApprovedVO], approvedBy: String)

/**
 * Message sent directly to a guest that he has been approved and can proceed to join the meeting.
 */
object GuestApprovedEvtMsg { val NAME = "GuestApprovedEvtMsg" }
case class GuestApprovedEvtMsg(
    header: BbbClientMsgHeader,
    body:   GuestApprovedEvtMsgBody
) extends BbbCoreMsg
case class GuestApprovedEvtMsgBody(status: String, approvedBy: String)

/**
 * Message from bbb-web when it detects a guest stopped polling for his status.
 */
object GuestWaitingLeftMsg { val NAME = "GuestWaitingLeftMsg" }
case class GuestWaitingLeftMsg(
    header: BbbClientMsgHeader,
    body:   GuestWaitingLeftMsgBody
) extends StandardMsg
case class GuestWaitingLeftMsgBody(userId: String)

/**
 * Message sent to all clients that a guest left the waiting page.
 */
object GuestWaitingLeftEvtMsg { val NAME = "GuestWaitingLeftEvtMsg" }
case class GuestWaitingLeftEvtMsg(
    header: BbbClientMsgHeader,
    body:   GuestWaitingLeftEvtMsgBody
) extends BbbCoreMsg
case class GuestWaitingLeftEvtMsgBody(userId: String)

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
 * Message sent from the client when a new guest user appeared or one of the guest users
 * was accepted or denied. Present waiting users change positions in queue.
 */
object UpdatePositionInWaitingQueueReqMsg { val NAME = "UpdatePositionInWaitingQueueReqMsg" }
case class UpdatePositionInWaitingQueueReqMsg(
    header: BbbClientMsgHeader,
    body:   UpdatePositionInWaitingQueueReqMsgBody
) extends StandardMsg
case class UpdatePositionInWaitingQueueReqMsgBody(guests: Vector[GuestWaitingUP])
case class GuestWaitingUP(intId: String, idx: String)

/**
 * Message sent to bbb-web when a new guest user appeared or one of the guest users
 * was accepted, denied or left the guest lobby. A change in the position in waiting queue is notified.
 */
object PosInWaitingQueueUpdatedRespMsg { val NAME = "PosInWaitingQueueUpdatedRespMsg" }
case class PosInWaitingQueueUpdatedRespMsg(
    header: BbbClientMsgHeader,
    body:   PosInWaitingQueueUpdatedRespMsgBody
) extends BbbCoreMsg
case class PosInWaitingQueueUpdatedRespMsgBody(guests: Vector[GuestWaitingUP])

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
 * Message sent to all clients that guest lobby message has been changed.
 */
object GuestLobbyMessageChangedEvtMsg { val NAME = "GuestLobbyMessageChangedEvtMsg" }
case class GuestLobbyMessageChangedEvtMsg(
    header: BbbClientMsgHeader,
    body:   GuestLobbyMessageChangedEvtMsgBody
) extends BbbCoreMsg
case class GuestLobbyMessageChangedEvtMsgBody(message: String)

/**
 * Message from moderator to set the guest lobby message for a specific user.
 */
object SetPrivateGuestLobbyMessageCmdMsg { val NAME = "SetPrivateGuestLobbyMessageCmdMsg" }
case class SetPrivateGuestLobbyMessageCmdMsg(
    header: BbbClientMsgHeader,
    body:   SetPrivateGuestLobbyMessageCmdMsgBody
) extends StandardMsg
case class SetPrivateGuestLobbyMessageCmdMsgBody(guestId: String, message: String)

/**
 * Message sent to a specific client that guest lobby message has been changed for him.
 */
object PrivateGuestLobbyMsgChangedEvtMsg { val NAME = "PrivateGuestLobbyMsgChangedEvtMsg" }
case class PrivateGuestLobbyMsgChangedEvtMsg(
    header: BbbClientMsgHeader,
    body:   PrivateGuestLobbyMsgChangedEvtMsgBody
) extends BbbCoreMsg
case class PrivateGuestLobbyMsgChangedEvtMsgBody(guestId: String, message: String)

/**
 * Message from user to get the guest policy.
 */
object GetGuestPolicyReqMsg { val NAME = "GetGuestPolicyReqMsg" }
case class GetGuestPolicyReqMsg(
    header: BbbClientMsgHeader,
    body:   GetGuestPolicyReqMsgBody
) extends StandardMsg
case class GetGuestPolicyReqMsgBody(requestedBy: String)

/**
 * Sent to client as response to query for guest policy.
 */
object GetGuestPolicyRespMsg { val NAME = "GetGuestPolicyRespMsg" }
case class GetGuestPolicyRespMsg(
    header: BbbClientMsgHeader,
    body:   GetGuestPolicyRespMsgBody
) extends StandardMsg
case class GetGuestPolicyRespMsgBody(policy: String)
