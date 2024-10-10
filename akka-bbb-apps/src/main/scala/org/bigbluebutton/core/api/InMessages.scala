package org.bigbluebutton.core.api

import org.bigbluebutton.core.apps.users.UserEstablishedGraphqlConnectionInternalMsgHdlr
import org.bigbluebutton.core.domain.{ BreakoutUser, BreakoutVoiceUser }
import spray.json.JsObject
case class InMessageHeader(name: String)
case class InHeaderAndJsonPayload(header: InMessageHeader, payload: JsObject)
case class MessageProcessException(message: String) extends Exception(message)

trait InMessage

//////////////////////////////////////////////////////////////////////////////
// System
/////////////////////////////////////////////////////////////////////////////

case class IsMeetingActorAliveMessage(meetingId: String) extends InMessage

//////////////////////////////////////////////////////////////////////////////
// Internal Messages
/////////////////////////////////////////////////////////////////////////////

case class MonitorNumberOfUsersInternalMsg(meetingID: String) extends InMessage

/**
 * Audit message sent to meeting to trigger updating clients of meeting time remaining.
 * @param meetingId
 */
case class MonitorGuestWaitPresenceInternalMsg(meetingId: String) extends InMessage

case class ExtendMeetingDuration(meetingId: String, userId: String) extends InMessage
case class DestroyMeetingInternalMsg(meetingId: String) extends InMessage

/**
 * Sent by breakout room to parent meeting the breakout had ended.
 * @param meetingId
 */
case class BreakoutRoomEndedInternalMsg(meetingId: String) extends InMessage

/**
 * Sent by breakout room to parent meeting that breakout room has been created.
 * @param parentId
 * @param breakoutId
 */
case class BreakoutRoomCreatedInternalMsg(parentId: String, breakoutId: String) extends InMessage

/**
 * Audit message to trigger breakout room to update parent meeting of list of users.
 * @param parentId
 * @param breakoutId
 */
case class SendBreakoutUsersAuditInternalMsg(parentId: String, breakoutId: String) extends InMessage

/**
 * Send by breakout room to parent meeting with list of users in breakout room.
 * @param parentId
 * @param breakoutId
 * @param users
 */
case class BreakoutRoomUsersUpdateInternalMsg(parentId: String, breakoutId: String,
                                              users:      Vector[BreakoutUser],
                                              voiceUsers: Vector[BreakoutVoiceUser]) extends InMessage

/**
 * Sent by parent meeting to breakout room to end breakout room.
 * @param parentId
 * @param breakoutId
 */
case class EndBreakoutRoomInternalMsg(parentId: String, breakoutId: String, reason: String) extends InMessage

/**
 * Sent by parent meeting to breakout room to update time.
 * @param parentId
 * @param breakoutId
 * @param durationInSeconds
 */
case class UpdateBreakoutRoomTimeInternalMsg(parentId: String, breakoutId: String, durationInSeconds: Int) extends InMessage

/**
 * Sent by parent meeting to breakout room to extend time.
 * @param parentId
 * @param breakoutId
 * @param senderName
 * @param msg
 */
case class SendMessageToBreakoutRoomInternalMsg(parentId: String, breakoutId: String, senderName: String, msg: String) extends InMessage

/**
 * Sent by parent meeting to breakout room to eject user.
 * @param parentId
 * @param breakoutId
 * @param extUserId
 * @param ejectedBy
 * @param reason
 * @param reasonCode
 * @param ban
 */
case class EjectUserFromBreakoutInternalMsg(parentId: String, breakoutId: String, extUserId: String, ejectedBy: String, reason: String, reasonCode: String, ban: Boolean) extends InMessage

/**
 * Sent by parent meeting to breakout room to import annotated slides.
 * @param userId
 * @param parentMeetingId
 * @param filename
 * @param allPages
 */
case class CapturePresentationReqInternalMsg(userId: String, parentMeetingId: String, filename: String, allPages: Boolean = true) extends InMessage

/**
 * Sent to the same meeting to force a new presenter to the Pod
 * @param presenterId
 */
case class SetPresenterInDefaultPodInternalMsg(presenterId: String) extends InMessage

/**
 * Sent by GraphqlActionsActor to inform MeetingActor that user disconnected
 * @param userId
 */
case class UserClosedAllGraphqlConnectionsInternalMsg(userId: String) extends InMessage

/**
 * Sent by GraphqlActionsActor to inform MeetingActor that user came back from disconnection
 * @param userId
 */
case class UserEstablishedGraphqlConnectionInternalMsg(userId: String, clientType: String, isMobile: Boolean) extends InMessage

/**
 * API endpoint /userInfo to provide User Session Variables messages
 */
case class GetUserApiMsg(sessionToken: String)
case class UserInfosApiMsg(infos: Map[String, Any])

trait ApiResponse
case class ApiResponseSuccess(msg: String, any: Any = null) extends ApiResponse
case class ApiResponseFailure(msg: String, msgId: String, any: Any = null) extends ApiResponse