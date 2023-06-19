package org.bigbluebutton.common2.msgs

case class BbbCoreVoiceConfHeader(name: String, voiceConf: String) extends BbbCoreHeader

trait VoiceStandardMsg extends BbbCoreMsg {
  def header: BbbCoreVoiceConfHeader
}

/**
 * Sent from FS that RTMP stream has started.
 */
object ScreenshareRtmpBroadcastStartedVoiceConfEvtMsg { val NAME = "ScreenshareRtmpBroadcastStartedVoiceConfEvtMsg" }
case class ScreenshareRtmpBroadcastStartedVoiceConfEvtMsg(
    header: BbbCoreVoiceConfHeader,
    body:   ScreenshareRtmpBroadcastStartedVoiceConfEvtMsgBody
)
  extends VoiceStandardMsg
case class ScreenshareRtmpBroadcastStartedVoiceConfEvtMsgBody(voiceConf: String, screenshareConf: String,
                                                              stream: String, vidWidth: Int, vidHeight: Int,
                                                              timestamp: String, hasAudio: Boolean, contentType: String)

/**
 * Sent to clients to notify them of an RTMP stream starting.
 */
object ScreenshareRtmpBroadcastStartedEvtMsg { val NAME = "ScreenshareRtmpBroadcastStartedEvtMsg" }
case class ScreenshareRtmpBroadcastStartedEvtMsg(
    header: BbbClientMsgHeader,
    body:   ScreenshareRtmpBroadcastStartedEvtMsgBody
)
  extends BbbCoreMsg
case class ScreenshareRtmpBroadcastStartedEvtMsgBody(voiceConf: String, screenshareConf: String,
                                                     stream: String, vidWidth: Int, vidHeight: Int,
                                                     timestamp: String, hasAudio: Boolean, contentType: String)

/**
 * Sync screenshare state with bbb-html5
 */
object SyncGetScreenshareInfoRespMsg { val NAME = "SyncGetScreenshareInfoRespMsg" }
case class SyncGetScreenshareInfoRespMsg(
    header: BbbClientMsgHeader,
    body:   SyncGetScreenshareInfoRespMsgBody
) extends BbbCoreMsg
case class SyncGetScreenshareInfoRespMsgBody(
    isBroadcasting:  Boolean,
    voiceConf:       String,
    screenshareConf: String,
    stream:          String,
    vidWidth:        Int,
    vidHeight:       Int,
    timestamp:       String,
    hasAudio:        Boolean,
    contentType:     String
)

/**
 * Send by FS that RTMP stream has stopped.
 */
object ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsg { val NAME = "ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsg" }
case class ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsg(
    header: BbbCoreVoiceConfHeader,
    body:   ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsgBody
) extends VoiceStandardMsg
case class ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsgBody(voiceConf: String, screenshareConf: String,
                                                              stream: String, vidWidth: Int, vidHeight: Int,
                                                              timestamp: String)

/**
 * Sent to clients to notify them of an RTMP stream stopping.
 */
object ScreenshareRtmpBroadcastStoppedEvtMsg { val NAME = "ScreenshareRtmpBroadcastStoppedEvtMsg" }
case class ScreenshareRtmpBroadcastStoppedEvtMsg(
    header: BbbClientMsgHeader,
    body:   ScreenshareRtmpBroadcastStoppedEvtMsgBody
)
  extends BbbCoreMsg
case class ScreenshareRtmpBroadcastStoppedEvtMsgBody(voiceConf: String, screenshareConf: String,
                                                     stream: String, vidWidth: Int, vidHeight: Int,
                                                     timestamp: String)

/* Sent by bbb-webrtc-sfu to ask permission for broadcasting a screen stream
 */
object GetScreenBroadcastPermissionReqMsg { val NAME = "GetScreenBroadcastPermissionReqMsg" }
case class GetScreenBroadcastPermissionReqMsg(
    header: BbbClientMsgHeader,
    body:   GetScreenBroadcastPermissionReqMsgBody
) extends StandardMsg
case class GetScreenBroadcastPermissionReqMsgBody(
    meetingId:    String,
    voiceConf:    String,
    userId:       String,
    sfuSessionId: String
)

/* Sent to bbb-webrtc-sfu to grant or deny screen sharing permission
 */
object GetScreenBroadcastPermissionRespMsg { val NAME = "GetScreenBroadcastPermissionRespMsg" }
case class GetScreenBroadcastPermissionRespMsg(
    header: BbbClientMsgHeader,
    body:   GetScreenBroadcastPermissionRespMsgBody
) extends StandardMsg
case class GetScreenBroadcastPermissionRespMsgBody(
    meetingId:    String,
    voiceConf:    String,
    userId:       String,
    sfuSessionId: String,
    allowed:      Boolean
)

/* Sent by bbb-webrtc-sfu to ask permission for subscring to a broadcasted
 * screen stream
 */
object GetScreenSubscribePermissionReqMsg { val NAME = "GetScreenSubscribePermissionReqMsg" }
case class GetScreenSubscribePermissionReqMsg(
    header: BbbClientMsgHeader,
    body:   GetScreenSubscribePermissionReqMsgBody
) extends StandardMsg
case class GetScreenSubscribePermissionReqMsgBody(
    meetingId:    String,
    voiceConf:    String,
    userId:       String,
    streamId:     String,
    sfuSessionId: String
)

/* Sent to bbb-webrtc-sfu to grant or deny a screen sharing subscribe request
 */
object GetScreenSubscribePermissionRespMsg { val NAME = "GetScreenSubscribePermissionRespMsg" }
case class GetScreenSubscribePermissionRespMsg(
    header: BbbClientMsgHeader,
    body:   GetScreenSubscribePermissionRespMsgBody
) extends StandardMsg
case class GetScreenSubscribePermissionRespMsgBody(
    meetingId:    String,
    voiceConf:    String,
    userId:       String,
    streamId:     String,
    sfuSessionId: String,
    allowed:      Boolean
)

/**
 * Sent to bbb-webrtc-sfu to tear down screen stream #streamId
 */
object ScreenBroadcastStopSysMsg { val NAME = "ScreenBroadcastStopSysMsg" }
case class ScreenBroadcastStopSysMsg(
    header: BbbCoreBaseHeader,
    body:   ScreenBroadcastStopSysMsgBody
) extends BbbCoreMsg
case class ScreenBroadcastStopSysMsgBody(
    meetingId: String,
    voiceConf: String,
    streamId:  String
)

/**
 * Sent to FS to eject all users from the voice conference.
 */
object EjectAllFromVoiceConfMsg { val NAME = "EjectAllFromVoiceConfMsg" }
case class EjectAllFromVoiceConfMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   EjectAllFromVoiceConfMsgBody
) extends BbbCoreMsg
case class EjectAllFromVoiceConfMsgBody(voiceConf: String)

/**
 * Sent by client to eject user from voice conference.
 */
object EjectUserFromVoiceCmdMsg { val NAME = "EjectUserFromVoiceCmdMsg" }
case class EjectUserFromVoiceCmdMsg(
    header: BbbClientMsgHeader,
    body:   EjectUserFromVoiceCmdMsgBody
) extends StandardMsg
case class EjectUserFromVoiceCmdMsgBody(userId: String, ejectedBy: String, banUser: Boolean)

/**
 * Sent by client to mute all users except presenters in the voice conference.
 */
object MuteAllExceptPresentersCmdMsg { val NAME = "MuteAllExceptPresentersCmdMsg" }
case class MuteAllExceptPresentersCmdMsg(
    header: BbbClientMsgHeader,
    body:   MuteAllExceptPresentersCmdMsgBody
) extends StandardMsg
case class MuteAllExceptPresentersCmdMsgBody(mutedBy: String, mute: Boolean)

/**
 * Sent by client to determine current meeting mute state.
 */
object IsMeetingMutedReqMsg { val NAME = "IsMeetingMutedReqMsg" }
case class IsMeetingMutedReqMsg(
    header: BbbClientMsgHeader,
    body:   IsMeetingMutedReqMsgBody
) extends StandardMsg
case class IsMeetingMutedReqMsgBody()

object IsMeetingMutedRespMsg { val NAME = "IsMeetingMutedRespMsg" }
case class IsMeetingMutedRespMsg(
    header: BbbClientMsgHeader,
    body:   IsMeetingMutedRespMsgBody
) extends BbbCoreMsg
case class IsMeetingMutedRespMsgBody(muted: Boolean)

/**
 * Sent by client to mute user in the voice conference.
 */
object MuteUserCmdMsg { val NAME = "MuteUserCmdMsg" }
case class MuteUserCmdMsg(
    header: BbbClientMsgHeader,
    body:   MuteUserCmdMsgBody
) extends StandardMsg
case class MuteUserCmdMsgBody(userId: String, mutedBy: String, mute: Boolean)

/**
 * Sent to FS to get the users in the voice conference.
 */
object GetUsersInVoiceConfSysMsg { val NAME = "GetUsersInVoiceConfSysMsg" }
case class GetUsersInVoiceConfSysMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   GetUsersInVoiceConfSysMsgBody
) extends BbbCoreMsg
case class GetUsersInVoiceConfSysMsgBody(voiceConf: String)

/**
 * Sent to FS to eject user from voice conference.
 */
object EjectUserFromVoiceConfSysMsg { val NAME = "EjectUserFromVoiceConfSysMsg" }
case class EjectUserFromVoiceConfSysMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   EjectUserFromVoiceConfSysMsgBody
) extends BbbCoreMsg
case class EjectUserFromVoiceConfSysMsgBody(voiceConf: String, voiceUserId: String)

/**
 * Send to FS to mute user in the voice conference.
 */
object MuteUserInVoiceConfSysMsg { val NAME = "MuteUserInVoiceConfSysMsg" }
case class MuteUserInVoiceConfSysMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   MuteUserInVoiceConfSysMsgBody
) extends BbbCoreMsg
case class MuteUserInVoiceConfSysMsgBody(voiceConf: String, voiceUserId: String, mute: Boolean)

/**
 * Sent by client to mute all users in the meeting.
 */
object MuteMeetingCmdMsg { val NAME = "MuteMeetingCmdMsg" }
case class MuteMeetingCmdMsg(
    header: BbbClientMsgHeader,
    body:   MuteMeetingCmdMsgBody
) extends StandardMsg
case class MuteMeetingCmdMsgBody(mutedBy: String, mute: Boolean)

/**
 * Send to all clients that meeting is muted.
 */
object MeetingMutedEvtMsg { val NAME = "MeetingMutedEvtMsg" }
case class MeetingMutedEvtMsg(
    header: BbbClientMsgHeader,
    body:   MeetingMutedEvtMsgBody
) extends BbbCoreMsg
case class MeetingMutedEvtMsgBody(muted: Boolean, mutedBy: String)

/**
 * Send to FS to deaf user in the voice conference.
 */
object DeafUserInVoiceConfSysMsg { val NAME = "DeafUserInVoiceConfSysMsg" }
case class DeafUserInVoiceConfSysMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   DeafUserInVoiceConfSysMsgBody
) extends BbbCoreMsg
case class DeafUserInVoiceConfSysMsgBody(voiceConf: String, voiceUserId: String, deaf: Boolean)

/**
 * Send to FS to hold user in the voice conference.
 */
object HoldUserInVoiceConfSysMsg { val NAME = "HoldUserInVoiceConfSysMsg" }
case class HoldUserInVoiceConfSysMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   HoldUserInVoiceConfSysMsgBody
) extends BbbCoreMsg
case class HoldUserInVoiceConfSysMsgBody(voiceConf: String, voiceUserId: String, hold: Boolean)

/**
 * Send to FS to play sound in the voice conference, or specific user
 */
object PlaySoundInVoiceConfSysMsg { val NAME = "PlaySoundInVoiceConfSysMsg" }
case class PlaySoundInVoiceConfSysMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   PlaySoundInVoiceConfSysMsgBody
) extends BbbCoreMsg
case class PlaySoundInVoiceConfSysMsgBody(voiceConf: String, voiceUserId: String, soundPath: String)

/**
 * Send to FS to stop current sound in the voice conference, or specific user
 */
object StopSoundInVoiceConfSysMsg { val NAME = "StopSoundInVoiceConfSysMsg" }
case class StopSoundInVoiceConfSysMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   StopSoundInVoiceConfSysMsgBody
) extends BbbCoreMsg
case class StopSoundInVoiceConfSysMsgBody(voiceConf: String, voiceUserId: String)

/**
 * Received from FS that voice is being recorded.
 */
object RecordingStartedVoiceConfEvtMsg { val NAME = "RecordingStartedVoiceConfEvtMsg" }
case class RecordingStartedVoiceConfEvtMsg(
    header: BbbCoreVoiceConfHeader,
    body:   RecordingStartedVoiceConfEvtMsgBody
) extends VoiceStandardMsg
case class RecordingStartedVoiceConfEvtMsgBody(voiceConf: String, stream: String, recording: Boolean, timestamp: String)

/**
 * Sent to FS to start recording voice conference.
 */
object StartRecordingVoiceConfSysMsg { val NAME = "StartRecordingVoiceConfSysMsg" }
case class StartRecordingVoiceConfSysMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   StartRecordingVoiceConfSysMsgBody
) extends BbbCoreMsg
case class StartRecordingVoiceConfSysMsgBody(voiceConf: String, meetingId: String, stream: String)

/**
 * Sent to FS to stop recording voice conference.
 */
object StopRecordingVoiceConfSysMsg { val NAME = "StopRecordingVoiceConfSysMsg" }
case class StopRecordingVoiceConfSysMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   StopRecordingVoiceConfSysMsgBody
) extends BbbCoreMsg
case class StopRecordingVoiceConfSysMsgBody(voiceConf: String, meetingId: String, stream: String)

/**
 * Sent to FS to transfer user to another voice conference.
 */
object TransferUserToVoiceConfSysMsg { val NAME = "TransferUserToVoiceConfSysMsg" }
case class TransferUserToVoiceConfSysMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   TransferUserToVoiceConfSysMsgBody
) extends BbbCoreMsg
case class TransferUserToVoiceConfSysMsgBody(fromVoiceConf: String, toVoiceConf: String, voiceUserId: String)

/**
 * Sent to FS to check if voice conference is running and recording.
 */
object CheckRunningAndRecordingToVoiceConfSysMsg { val NAME = "CheckRunningAndRecordingToVoiceConfSysMsg" }
case class CheckRunningAndRecordingToVoiceConfSysMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   CheckRunningAndRecordingToVoiceConfSysMsgBody
) extends BbbCoreMsg
case class CheckRunningAndRecordingToVoiceConfSysMsgBody(voiceConf: String, meetingId: String)

/**
 * Received from FS to check if voice conference is running and recording.
 */
object CheckRunningAndRecordingVoiceConfEvtMsg { val NAME = "CheckRunningAndRecordingVoiceConfEvtMsg" }
case class CheckRunningAndRecordingVoiceConfEvtMsg(
    header: BbbCoreVoiceConfHeader,
    body:   CheckRunningAndRecordingVoiceConfEvtMsgBody
) extends VoiceStandardMsg
case class CheckRunningAndRecordingVoiceConfEvtMsgBody(
    voiceConf:      String,
    isRunning:      Boolean,
    isRecording:    Boolean,
    confRecordings: Vector[ConfVoiceRecording]
)

/**
 * Sent to FS to get status of users in voice conference.
 */
object GetUsersStatusToVoiceConfSysMsg { val NAME = "GetUsersStatusToVoiceConfSysMsg" }
case class GetUsersStatusToVoiceConfSysMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   GetUsersStatusToVoiceConfSysMsgBody
) extends BbbCoreMsg
case class GetUsersStatusToVoiceConfSysMsgBody(voiceConf: String, meetingId: String)

/**
 * Received from FS about user status voice conference.
 */
object UserStatusVoiceConfEvtMsg { val NAME = "UserStatusVoiceConfEvtMsg" }
case class UserStatusVoiceConfEvtMsg(
    header: BbbCoreVoiceConfHeader,
    body:   UserStatusVoiceConfEvtMsgBody
) extends VoiceStandardMsg
case class UserStatusVoiceConfEvtMsgBody(voiceConf: String, confUsers: Vector[ConfVoiceUser],
                                         confRecordings: Vector[ConfVoiceRecording])
case class ConfVoiceUser(voiceUserId: String, intId: String,
                         callerIdName: String, callerIdNum: String, muted: Boolean,
                         talking: Boolean, callingWith: String,
                         calledInto: String // freeswitch, kms
                         )
case class ConfVoiceRecording(recordPath: String, recordStartTime: Long)

/**
 * Received from FS that user joined voice conference.
 */
object UserJoinedVoiceConfEvtMsg { val NAME = "UserJoinedVoiceConfEvtMsg" }
case class UserJoinedVoiceConfEvtMsg(
    header: BbbCoreVoiceConfHeader,
    body:   UserJoinedVoiceConfEvtMsgBody
) extends VoiceStandardMsg
case class UserJoinedVoiceConfEvtMsgBody(voiceConf: String, voiceUserId: String, intId: String,
                                         callerIdName: String, callerIdNum: String, muted: Boolean,
                                         talking: Boolean, callingWith: String)

/**
 * Sent to client that a user has joined the voice conference.
 */
object UserJoinedVoiceConfToClientEvtMsg { val NAME = "UserJoinedVoiceConfToClientEvtMsg" }
case class UserJoinedVoiceConfToClientEvtMsg(header: BbbClientMsgHeader, body: UserJoinedVoiceConfToClientEvtMsgBody) extends BbbCoreMsg
case class UserJoinedVoiceConfToClientEvtMsgBody(voiceConf: String, intId: String, voiceUserId: String, callerName: String,
                                                 callerNum: String, color: String, muted: Boolean,
                                                 talking: Boolean, callingWith: String, listenOnly: Boolean)

/**
 * Received from FS about the conference is running (created, destroyed).
 */
object VoiceConfRunningEvtMsg { val NAME = "VoiceConfRunningEvtMsg" }
case class VoiceConfRunningEvtMsg(
    header: BbbCoreVoiceConfHeader,
    body:   VoiceConfRunningEvtMsgBody
) extends VoiceStandardMsg
case class VoiceConfRunningEvtMsgBody(voiceConf: String, running: Boolean)

/**
 * Received from FS that user has left the voice conference.
 */
object UserLeftVoiceConfEvtMsg { val NAME = "UserLeftVoiceConfEvtMsg" }
case class UserLeftVoiceConfEvtMsg(
    header: BbbCoreVoiceConfHeader,
    body:   UserLeftVoiceConfEvtMsgBody
) extends VoiceStandardMsg
case class UserLeftVoiceConfEvtMsgBody(voiceConf: String, voiceUserId: String)

/**
 * Sent to client that user has left the voice conference.
 */
object UserLeftVoiceConfToClientEvtMsg { val NAME = "UserLeftVoiceConfToClientEvtMsg" }
case class UserLeftVoiceConfToClientEvtMsg(header: BbbClientMsgHeader, body: UserLeftVoiceConfToClientEvtMsgBody) extends BbbCoreMsg
case class UserLeftVoiceConfToClientEvtMsgBody(voiceConf: String, intId: String, voiceUserId: String)

/**
 * Sent to client that user has been muted in the voice conference.
 */
object UserMutedVoiceEvtMsg { val NAME = "UserMutedVoiceEvtMsg" }
case class UserMutedVoiceEvtMsg(header: BbbClientMsgHeader, body: UserMutedVoiceEvtMsgBody) extends BbbCoreMsg
case class UserMutedVoiceEvtMsgBody(voiceConf: String, intId: String, voiceUserId: String, muted: Boolean)

/**
 * Received from FS that user has been muted in voice conference.
 */
object UserMutedInVoiceConfEvtMsg { val NAME = "UserMutedInVoiceConfEvtMsg" }
case class UserMutedInVoiceConfEvtMsg(
    header: BbbCoreVoiceConfHeader,
    body:   UserMutedInVoiceConfEvtMsgBody
) extends VoiceStandardMsg
case class UserMutedInVoiceConfEvtMsgBody(voiceConf: String, voiceUserId: String, muted: Boolean)

/**
 * Sent to client that user is talking in voice conference.
 */

object UserTalkingVoiceEvtMsg { val NAME = "UserTalkingVoiceEvtMsg" }
case class UserTalkingVoiceEvtMsg(header: BbbClientMsgHeader, body: UserTalkingVoiceEvtMsgBody) extends BbbCoreMsg
case class UserTalkingVoiceEvtMsgBody(voiceConf: String, intId: String, voiceUserId: String, talking: Boolean)

/**
 * Received from FS that user is talking in voice conference.
 */
object UserTalkingInVoiceConfEvtMsg { val NAME = "UserTalkingInVoiceConfEvtMsg" }
case class UserTalkingInVoiceConfEvtMsg(
    header: BbbCoreVoiceConfHeader,
    body:   UserTalkingInVoiceConfEvtMsgBody
) extends VoiceStandardMsg
case class UserTalkingInVoiceConfEvtMsgBody(voiceConf: String, voiceUserId: String, talking: Boolean)

/**
 * Sent to clients that voice conf is being recorded.
 */
object VoiceRecordingStartedEvtMsg { val NAME = "VoiceRecordingStartedEvtMsg" }
case class VoiceRecordingStartedEvtMsg(
    header: BbbClientMsgHeader,
    body:   VoiceRecordingStartedEvtMsgBody
) extends BbbCoreMsg
case class VoiceRecordingStartedEvtMsgBody(meetingId: String, stream: String, timestamp: String, voiceConf: String)

/**
 * Sent to clients that voice conf is no longer being recorded.
 */
object VoiceRecordingStoppedEvtMsg { val NAME = "VoiceRecordingStoppedEvtMsg" }
case class VoiceRecordingStoppedEvtMsg(
    header: BbbClientMsgHeader,
    body:   VoiceRecordingStoppedEvtMsgBody
) extends BbbCoreMsg
case class VoiceRecordingStoppedEvtMsgBody(meetingId: String, stream: String, timestamp: String, voiceConf: String)

/**
 * Sent from bbb-voice when a user connects to "global audio"
 */
object UserConnectedToGlobalAudioMsg { val NAME = "UserConnectedToGlobalAudioMsg" }
case class UserConnectedToGlobalAudioMsg(
    header: BbbCoreVoiceConfHeader,
    body:   UserConnectedToGlobalAudioMsgBody
) extends VoiceStandardMsg
case class UserConnectedToGlobalAudioMsgBody(userId: String, name: String)

/**
 * Sent from bbb-voice when a user disconnects from "global audio"
 */
object UserDisconnectedFromGlobalAudioMsg { val NAME = "UserDisconnectedFromGlobalAudioMsg" }
case class UserDisconnectedFromGlobalAudioMsg(
    header: BbbCoreVoiceConfHeader,
    body:   UserDisconnectedFromGlobalAudioMsgBody
) extends VoiceStandardMsg
case class UserDisconnectedFromGlobalAudioMsgBody(userId: String, name: String)

/**
 * Sync voice users with html5 client
 */
object SyncGetVoiceUsersRespMsg { val NAME = "SyncGetVoiceUsersRespMsg" }
case class SyncGetVoiceUsersRespMsg(header: BbbClientMsgHeader, body: SyncGetVoiceUsersRespMsgBody) extends BbbCoreMsg
case class SyncGetVoiceUsersRespMsgBody(voiceUsers: Vector[VoiceConfUser])

/**
 * Received from FS that a user has become a floor holder
 */
object AudioFloorChangedVoiceConfEvtMsg { val NAME = "AudioFloorChangedVoiceConfEvtMsg" }
case class AudioFloorChangedVoiceConfEvtMsg(
    header: BbbCoreVoiceConfHeader,
    body:   AudioFloorChangedVoiceConfEvtMsgBody
) extends VoiceStandardMsg
case class AudioFloorChangedVoiceConfEvtMsgBody(voiceConf: String, voiceUserId: String, oldVoiceUserId: String, floorTimestamp: String)

/**
 * Sent to a client that an user has become a floor holder
 */

object AudioFloorChangedEvtMsg { val NAME = "AudioFloorChangedEvtMsg" }
case class AudioFloorChangedEvtMsg(header: BbbClientMsgHeader, body: AudioFloorChangedEvtMsgBody) extends BbbCoreMsg
case class AudioFloorChangedEvtMsgBody(voiceConf: String, intId: String, voiceUserId: String, floor: Boolean, lastFloorTime: String)

/**
 * Received from FS call state events.
 */
object VoiceConfCallStateEvtMsg { val NAME = "VoiceConfCallStateEvtMsg" }
case class VoiceConfCallStateEvtMsg(
    header: BbbCoreVoiceConfHeader,
    body:   VoiceConfCallStateEvtMsgBody
) extends VoiceStandardMsg
case class VoiceConfCallStateEvtMsgBody(
    voiceConf:        String,
    callSession:      String,
    clientSession:    String,
    userId:           String,
    callerName:       String,
    callState:        String,
    origCallerIdName: String,
    origCalledDest:   String
)

/**
 * Sent to interested parties call state events.
 */
object VoiceCallStateEvtMsg { val NAME = "VoiceCallStateEvtMsg" }
case class VoiceCallStateEvtMsg(
    header: BbbClientMsgHeader,
    body:   VoiceCallStateEvtMsgBody
) extends BbbCoreMsg
case class VoiceCallStateEvtMsgBody(
    meetingId:     String,
    voiceConf:     String,
    clientSession: String,
    userId:        String,
    callerName:    String,
    callState:     String
)

/* Sent by bbb-webrtc-sfu to ask permission for adding a listener to the global
 * audio bridge
 */
object GetGlobalAudioPermissionReqMsg { val NAME = "GetGlobalAudioPermissionReqMsg" }
case class GetGlobalAudioPermissionReqMsg(
    header: BbbClientMsgHeader,
    body:   GetGlobalAudioPermissionReqMsgBody
) extends StandardMsg
case class GetGlobalAudioPermissionReqMsgBody(
    meetingId:    String,
    voiceConf:    String,
    userId:       String,
    sfuSessionId: String
)

object GetGlobalAudioPermissionRespMsg { val NAME = "GetGlobalAudioPermissionRespMsg" }
case class GetGlobalAudioPermissionRespMsg(
    header: BbbClientMsgHeader,
    body:   GetGlobalAudioPermissionRespMsgBody
) extends StandardMsg
case class GetGlobalAudioPermissionRespMsgBody(
    meetingId:    String,
    voiceConf:    String,
    userId:       String,
    sfuSessionId: String,
    allowed:      Boolean
)

/* Sent by bbb-webrtc-sfu to ask permission for a new microphone/full audio
 * connection
 *   - callerIdNum: the session's callerId as assembled by the requester
 *   - sfuSessionId: the UUID for this request's session in bbb-webrtc-sfu.
 *     Used for response matching.
 */
object GetMicrophonePermissionReqMsg { val NAME = "GetMicrophonePermissionReqMsg" }
case class GetMicrophonePermissionReqMsg(
    header: BbbClientMsgHeader,
    body:   GetMicrophonePermissionReqMsgBody
) extends StandardMsg
case class GetMicrophonePermissionReqMsgBody(
    meetingId:    String,
    voiceConf:    String,
    userId:       String,
    callerIdNum:  String,
    sfuSessionId: String
)

/* Sent to bbb-webrtc-sfu as a response to GetMicrophonePermissionReqMsg
 *   - sfuSessionId: the UUID for this request's session in bbb-webrtc-sfu.
 *     Used for response matching.
 *   - allowed: whether session creation should be allowed.
 */
object GetMicrophonePermissionRespMsg { val NAME = "GetMicrophonePermissionRespMsg" }
case class GetMicrophonePermissionRespMsg(
    header: BbbClientMsgHeader,
    body:   GetMicrophonePermissionRespMsgBody
) extends StandardMsg
case class GetMicrophonePermissionRespMsgBody(
    meetingId:    String,
    voiceConf:    String,
    userId:       String,
    sfuSessionId: String,
    allowed:      Boolean
)
