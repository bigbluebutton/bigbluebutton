package org.bigbluebutton.core.api

import org.bigbluebutton.common2.msgs.BreakoutUserVO
import org.bigbluebutton.core.domain.{ BreakoutUser, BreakoutVoiceUser }
import spray.json.JsObject
case class InMessageHeader(name: String)
case class InHeaderAndJsonPayload(header: InMessageHeader, payload: JsObject)
case class MessageProcessException(message: String) extends Exception(message)

trait InMessage

//////////////////////////////////////////////////////////////////////////////
// System
/////////////////////////////////////////////////////////////////////////////

case class PubSubPing(system: String, timestamp: Long) extends InMessage
case class IsMeetingActorAliveMessage(meetingId: String) extends InMessage
case class KeepAliveMessage(aliveID: String) extends InMessage

//////////////////////////////////////////////////////////////////////////////
// Internal Messages
/////////////////////////////////////////////////////////////////////////////

case class MonitorNumberOfUsersInternalMsg(meetingID: String) extends InMessage

/**
 * Audit message sent to meeting to trigger updating clients of meeting time remaining.
 * @param meetingId
 */
case class SendTimeRemainingAuditInternalMsg(meetingId: String) extends InMessage

case class SendRecordingTimerInternalMsg(meetingId: String) extends InMessage

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
case class EndBreakoutRoomInternalMsg(parentId: String, breakoutId: String) extends InMessage

//////////////////////////////////////////////////////////////////////////////
// Meeting
/////////////////////////////////////////////////////////////////////////////
case class StartMeeting(meetingID: String) extends InMessage
case class EndMeeting(meetingId: String) extends InMessage
case class LockSetting(meetingID: String, locked: Boolean, settings: Map[String, Boolean]) extends InMessage
case class UpdateMeetingExpireMonitor(meetingID: String, hasUser: Boolean) extends InMessage

//////////////////////////////////////////////////////////////////////////////////
// Users
/////////////////////////////////////////////////////////////////////////////////

case class SetRecordingStatus(meetingID: String, userId: String, recording: Boolean) extends InMessage
case class GetRecordingStatus(meetingID: String, userId: String) extends InMessage
case class ActivityResponse(meetingID: String) extends InMessage

// No idea what part this is for
case class GetAllMeetingsRequest(meetingID: String /** Not used. Just to satisfy trait **/ ) extends InMessage

// DeskShare
case class DeskShareStartedRequest(conferenceName: String, callerId: String, callerIdName: String) extends InMessage
case class DeskShareStoppedRequest(conferenceName: String, callerId: String, callerIdName: String) extends InMessage
case class DeskShareRTMPBroadcastStartedRequest(conferenceName: String, streamname: String, videoWidth: Int, videoHeight: Int, timestamp: String) extends InMessage
case class DeskShareRTMPBroadcastStoppedRequest(conferenceName: String, streamname: String, videoWidth: Int, videoHeight: Int, timestamp: String) extends InMessage
case class DeskShareGetDeskShareInfoRequest(conferenceName: String, requesterID: String, replyTo: String) extends InMessage
