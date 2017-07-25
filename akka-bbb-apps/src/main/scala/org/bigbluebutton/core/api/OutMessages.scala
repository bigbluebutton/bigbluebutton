package org.bigbluebutton.core.api

import org.bigbluebutton.core.apps._
import org.bigbluebutton.core.models._

case class RecordingStatusChanged(meetingID: String, recorded: Boolean, userId: String, recording: Boolean) extends IOutMessage
case class GetRecordingStatusReply(meetingID: String, recorded: Boolean, userId: String, recording: Boolean) extends IOutMessage
case class MeetingCreated(meetingID: String, externalMeetingID: String, parentMeetingID: String, recorded: Boolean, name: String,
                          voiceBridge: String, duration: Int, moderatorPass: String, viewerPass: String, createTime: Long, createDate: String, isBreakout: Boolean) extends IOutMessage
case class MeetingMuted(meetingID: String, recorded: Boolean, meetingMuted: Boolean) extends IOutMessage
case class MeetingEnding(meetingID: String) extends IOutMessage
case class MeetingEnded(meetingID: String, recorded: Boolean, voiceBridge: String) extends IOutMessage
case class MeetingState(meetingID: String, recorded: Boolean, userId: String, permissions: Permissions, meetingMuted: Boolean) extends IOutMessage
case class MeetingHasEnded(meetingID: String, userId: String) extends IOutMessage
case class MeetingDestroyed(meetingID: String) extends IOutMessage
case class DisconnectAllUsers(meetingID: String) extends IOutMessage
case class InactivityWarning(meetingID: String, duration: Long) extends IOutMessage
case class MeetingIsActive(meetingID: String) extends IOutMessage
case class DisconnectUser(meetingID: String, userId: String) extends IOutMessage
case class KeepAliveMessageReply(aliveID: String) extends IOutMessage
case class PubSubPong(system: String, timestamp: Long) extends IOutMessage
case object IsAliveMessage extends IOutMessage

// No idea what part this is for
case class GetAllMeetingsReply(meetings: Array[MeetingInfo]) extends IOutMessage

// DeskShare
case class DeskShareStartRTMPBroadcast(conferenceName: String, streamPath: String) extends IOutMessage
case class DeskShareStopRTMPBroadcast(conferenceName: String, streamPath: String) extends IOutMessage
case class DeskShareNotifyViewersRTMP(meetingID: String, streamPath: String, videoWidth: Int, videoHeight: Int, broadcasting: Boolean) extends IOutMessage
case class DeskShareNotifyASingleViewer(meetingID: String, userID: String, streamPath: String, videoWidth: Int, videoHeight: Int, broadcasting: Boolean) extends IOutMessage
case class DeskShareHangUp(meetingID: String, fsConferenceName: String) extends IOutMessage

//Transcode
case class StopMeetingTranscoders(meetingID: String) extends IOutMessage

// Value Objects
case class MeetingVO(id: String, recorded: Boolean)
