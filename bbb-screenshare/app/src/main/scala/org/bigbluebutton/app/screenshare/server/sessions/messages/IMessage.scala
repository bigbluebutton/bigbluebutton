package org.bigbluebutton.app.screenshare.server.sessions.messages

case class StartShareRequestMessage(meetingId: String, userId: String, record: Boolean)

case class StartShareRequestReplyMessage(token: String)

case class PauseShareRequestMessage(meetingId: String, userId: String, streamId: String)

case class RestartShareRequestMessage(meetingId: String, userId: String)

case class StopShareRequestMessage(meetingId: String, streamId: String)

case class StreamStartedMessage(meetingId: String, streamId: String, url: String)

case class StreamStoppedMessage(meetingId: String, streamId: String)

case class SharingStartedMessage(meetingId: String, streamId: String, width: Int, height: Int)

case class SharingStoppedMessage(meetingId: String, streamId: String)

case class IsStreamRecorded(meetingId: String, streamId: String)

case class IsStreamRecordedReply(record: Boolean)

case class GetSharingStatus(meetingId: String, streamId: String)

case class GetSharingStatusReply(status: String)

case class UpdateShareStatus(meetingId: String, streamId: String, sequence: Int)

case class IsScreenSharing(meetingId: String)

case class IsScreenSharingReply(sharing: Boolean, streamId: String, 
                                  width: Int, height: Int, url: String)

case class ScreenShareInfoRequest(meetingId: String, token: String)

case class ScreenShareInfoRequestReply(meetingId: String, streamId: String)

case class UserDisconnected(meetingId: String, userId: String)