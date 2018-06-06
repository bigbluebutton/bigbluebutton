package org.bigbluebutton.common2.msgs


case class BbbCoreVoiceConfHeader(name: String, voiceConf: String) extends BbbCoreHeader

trait VoiceStandardMsg extends BbbCoreMsg {
  def header: BbbCoreVoiceConfHeader
}

  object ScreenshareHangUpVoiceConfMsg { val NAME = "ScreenshareHangUpVoiceConfMsg" }
  case class ScreenshareHangUpVoiceConfMsg(header: BbbCoreHeaderWithMeetingId,
                                         body: ScreenshareHangUpVoiceConfMsgBody) extends BbbCoreMsg
  case class ScreenshareHangUpVoiceConfMsgBody(voiceConf: String, screenshareConf: String, timestamp: String)

/**
  * Sent from FS that RTMP stream has started.
  */
  object ScreenshareRtmpBroadcastStartedVoiceConfEvtMsg { val NAME = "ScreenshareRtmpBroadcastStartedVoiceConfEvtMsg"}
  case class ScreenshareRtmpBroadcastStartedVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                                          body: ScreenshareRtmpBroadcastStartedVoiceConfEvtMsgBody)
    extends VoiceStandardMsg
  case class ScreenshareRtmpBroadcastStartedVoiceConfEvtMsgBody(voiceConf: String, screenshareConf: String,
                                                              stream: String, vidWidth: Int, vidHeight: Int,
                                                              timestamp: String)

/**
  * Sent to clients to notify them of an RTMP stream starting.
  */
object ScreenshareRtmpBroadcastStartedEvtMsg { val NAME = "ScreenshareRtmpBroadcastStartedEvtMsg"}
case class ScreenshareRtmpBroadcastStartedEvtMsg(header: BbbClientMsgHeader,
                                                        body: ScreenshareRtmpBroadcastStartedEvtMsgBody)
  extends BbbCoreMsg
case class ScreenshareRtmpBroadcastStartedEvtMsgBody(voiceConf: String, screenshareConf: String,
                                                            stream: String, vidWidth: Int, vidHeight: Int,
                                                            timestamp: String)

/**
  * Send by FS that RTMP stream has stopped.
  */
  object ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsg { val NAME = "ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsg"}
  case class ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                                          body: ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsgBody) extends VoiceStandardMsg
  case class ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsgBody(voiceConf: String, screenshareConf: String,
                                                              stream: String, vidWidth: Int, vidHeight: Int,
                                                              timestamp: String)

/**
  * Sent to clients to notify them of an RTMP stream stopping.
  */
object ScreenshareRtmpBroadcastStoppedEvtMsg { val NAME = "ScreenshareRtmpBroadcastStoppedEvtMsg"}
case class ScreenshareRtmpBroadcastStoppedEvtMsg(header: BbbClientMsgHeader,
                                                 body: ScreenshareRtmpBroadcastStoppedEvtMsgBody)
  extends BbbCoreMsg
case class ScreenshareRtmpBroadcastStoppedEvtMsgBody(voiceConf: String, screenshareConf: String,
                                                     stream: String, vidWidth: Int, vidHeight: Int,
                                                     timestamp: String)

/**
  * Sent by FS that screenshare has started.
  */
  object ScreenshareStartedVoiceConfEvtMsg { val NAME = "ScreenshareStartedVoiceConfEvtMsg" }
  case class ScreenshareStartedVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                             body: ScreenshareStartedVoiceConfEvtMsgBody) extends VoiceStandardMsg
  case class ScreenshareStartedVoiceConfEvtMsgBody(voiceConf: String, screenshareConf: String,
                                                 callerIdNum: String, callerIdName: String)

/**
  * Sent to FS to broadcast ans RTMP stream to Red5.
  */
  object ScreenshareStartRtmpBroadcastVoiceConfMsg { val NAME = "ScreenshareStartRtmpBroadcastVoiceConfMsg" }
  case class ScreenshareStartRtmpBroadcastVoiceConfMsg(header: BbbCoreHeaderWithMeetingId,
                                                     body: ScreenshareStartRtmpBroadcastVoiceConfMsgBody) extends BbbCoreMsg
  case class ScreenshareStartRtmpBroadcastVoiceConfMsgBody(voiceConf: String, screenshareConf: String, url: String, timestamp: String)

/**
  * Sent by FS that screenshare has stopped.
  */
  object ScreenshareStoppedVoiceConfEvtMsg { val NAME = "ScreenshareStoppedVoiceConfEvtMsg"}
  case class ScreenshareStoppedVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                             body: ScreenshareStoppedVoiceConfEvtMsgBody) extends VoiceStandardMsg
  case class ScreenshareStoppedVoiceConfEvtMsgBody(voiceConf: String, screenshareConf: String,
                                                 callerIdNum: String, callerIdName: String)

/**
  * Sent to FS to stop broadcasting RTMP stream to Red5.
  */
  object ScreenshareStopRtmpBroadcastVoiceConfMsg { val NAME = "ScreenshareStopRtmpBroadcastVoiceConfMsg" }
  case class ScreenshareStopRtmpBroadcastVoiceConfMsg(header: BbbCoreHeaderWithMeetingId,
                                                    body: ScreenshareStopRtmpBroadcastVoiceConfMsgBody) extends BbbCoreMsg
  case class ScreenshareStopRtmpBroadcastVoiceConfMsgBody(voiceConf: String, screenshareConf: String, url: String, timestamp: String)

/**
  * Sent to FS to eject all users from the voice conference.
  */
  object EjectAllFromVoiceConfMsg { val NAME = "EjectAllFromVoiceConfMsg" }
  case class EjectAllFromVoiceConfMsg(header: BbbCoreHeaderWithMeetingId,
                                      body: EjectAllFromVoiceConfMsgBody) extends BbbCoreMsg
  case class EjectAllFromVoiceConfMsgBody(voiceConf: String)

/**
  * Sent by client to eject user from voice conference.
  */
object EjectUserFromVoiceCmdMsg { val NAME = "EjectUserFromVoiceCmdMsg"}
case class EjectUserFromVoiceCmdMsg(header: BbbClientMsgHeader,
                                     body: EjectUserFromVoiceCmdMsgBody) extends StandardMsg
case class EjectUserFromVoiceCmdMsgBody(userId: String, ejectedBy: String)


/**
  * Sent by client to mute all users except presenters in the voice conference.
  */
object MuteAllExceptPresentersCmdMsg { val NAME = "MuteAllExceptPresentersCmdMsg"}
case class MuteAllExceptPresentersCmdMsg(header: BbbClientMsgHeader,
                          body: MuteAllExceptPresentersCmdMsgBody) extends StandardMsg
case class MuteAllExceptPresentersCmdMsgBody(mutedBy: String, mute: Boolean)

/**
  * Sent by client to determine current meeting mute state.
  */
object IsMeetingMutedReqMsg { val NAME = "IsMeetingMutedReqMsg"}
case class IsMeetingMutedReqMsg(header: BbbClientMsgHeader,
                                         body: IsMeetingMutedReqMsgBody) extends StandardMsg
case class IsMeetingMutedReqMsgBody()

object IsMeetingMutedRespMsg { val NAME = "IsMeetingMutedRespMsg"}
case class IsMeetingMutedRespMsg(header: BbbClientMsgHeader,
                                body: IsMeetingMutedRespMsgBody) extends BbbCoreMsg
case class IsMeetingMutedRespMsgBody(muted: Boolean)

/**
  * Sent by client to mute user in the voice conference.
  */
object MuteUserCmdMsg { val NAME = "MuteUserCmdMsg"}
case class MuteUserCmdMsg(header: BbbClientMsgHeader,
                                    body: MuteUserCmdMsgBody) extends StandardMsg
case class MuteUserCmdMsgBody(userId: String, mutedBy: String, mute: Boolean)

/**
  * Sent to FS to get the users in the voice conference.
  */
object GetUsersInVoiceConfSysMsg { val NAME = "GetUsersInVoiceConfSysMsg"}
case class GetUsersInVoiceConfSysMsg(header: BbbCoreHeaderWithMeetingId,
                                        body: GetUsersInVoiceConfSysMsgBody) extends BbbCoreMsg
case class GetUsersInVoiceConfSysMsgBody(voiceConf: String)

/**
  * Sent to FS to eject user from voice conference.
  */
  object EjectUserFromVoiceConfSysMsg { val NAME = "EjectUserFromVoiceConfSysMsg"}
  case class EjectUserFromVoiceConfSysMsg(header: BbbCoreHeaderWithMeetingId,
                                       body: EjectUserFromVoiceConfSysMsgBody) extends BbbCoreMsg
  case class EjectUserFromVoiceConfSysMsgBody(voiceConf: String, voiceUserId: String)

/**
  * Send to FS to mute user in the voice conference.
  */
  object MuteUserInVoiceConfSysMsg { val NAME = "MuteUserInVoiceConfSysMsg" }
  case class MuteUserInVoiceConfSysMsg(header: BbbCoreHeaderWithMeetingId,
                                    body: MuteUserInVoiceConfSysMsgBody) extends BbbCoreMsg
  case class MuteUserInVoiceConfSysMsgBody(voiceConf: String, voiceUserId: String, mute: Boolean)

/**
  * Sent by client to mute all users in the meeting.
  */
object MuteMeetingCmdMsg { val NAME = "MuteMeetingCmdMsg" }
case class MuteMeetingCmdMsg(header: BbbClientMsgHeader,
                                  body: MuteMeetingCmdMsgBody) extends StandardMsg
case class MuteMeetingCmdMsgBody(mutedBy: String, mute: Boolean)

/**
  * Send to all clients that meeting is muted.
  */
object MeetingMutedEvtMsg { val NAME = "MeetingMutedEvtMsg" }
case class MeetingMutedEvtMsg(header: BbbClientMsgHeader,
                             body: MeetingMutedEvtMsgBody) extends BbbCoreMsg
case class MeetingMutedEvtMsgBody(muted: Boolean, mutedBy: String)



/**
  * Received from FS that voice is being recorded.
  */
  object RecordingStartedVoiceConfEvtMsg { val NAME = "RecordingStartedVoiceConfEvtMsg" }
  case class RecordingStartedVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                             body: RecordingStartedVoiceConfEvtMsgBody) extends VoiceStandardMsg
  case class RecordingStartedVoiceConfEvtMsgBody(voiceConf: String, stream: String, recording: Boolean, timestamp: String)

/**
  * Sent to FS to start recording voice conference.
  */
  object StartRecordingVoiceConfSysMsg { val NAME = "StartRecordingVoiceConfSysMsg" }
  case class StartRecordingVoiceConfSysMsg(header: BbbCoreHeaderWithMeetingId,
                                        body: StartRecordingVoiceConfSysMsgBody) extends BbbCoreMsg
  case class StartRecordingVoiceConfSysMsgBody(voiceConf: String, meetingId: String, stream: String)

/**
  * Sent to FS to stop recording voice conference.
  */
  object StopRecordingVoiceConfSysMsg { val NAME = "StopRecordingVoiceConfSysMsg" }
  case class StopRecordingVoiceConfSysMsg(header: BbbCoreHeaderWithMeetingId,
                                       body: StopRecordingVoiceConfSysMsgBody) extends BbbCoreMsg
  case class StopRecordingVoiceConfSysMsgBody(voiceConf: String, meetingId: String, stream: String)

/**
  * Sent to FS to transfer user to another voice conference.
  */
  object TransferUserToVoiceConfSysMsg { val NAME = "TransferUserToVoiceConfSysMsg" }
  case class TransferUserToVoiceConfSysMsg(header: BbbCoreHeaderWithMeetingId,
                                        body: TransferUserToVoiceConfSysMsgBody) extends BbbCoreMsg
  case class TransferUserToVoiceConfSysMsgBody(fromVoiceConf: String, toVoiceConf: String, voiceUserId: String)

/**
  * Received from FS that user joined voice conference.
  */
  object UserJoinedVoiceConfEvtMsg { val NAME = "UserJoinedVoiceConfEvtMsg" }
  case class UserJoinedVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                       body: UserJoinedVoiceConfEvtMsgBody) extends VoiceStandardMsg
  case class UserJoinedVoiceConfEvtMsgBody(voiceConf: String, voiceUserId: String, intId: String,
                                           callerIdName: String, callerIdNum: String, muted: Boolean,
                                           talking: Boolean, callingWith: String)

/**
  * Sent to client that a user has joined the voice conference.
  */
  object UserJoinedVoiceConfToClientEvtMsg { val NAME = "UserJoinedVoiceConfToClientEvtMsg" }
  case class UserJoinedVoiceConfToClientEvtMsg(header: BbbClientMsgHeader, body: UserJoinedVoiceConfToClientEvtMsgBody) extends BbbCoreMsg
  case class UserJoinedVoiceConfToClientEvtMsgBody(voiceConf: String, intId: String, voiceUserId: String, callerName: String,
                                                   callerNum: String, muted: Boolean,
                                                   talking: Boolean, callingWith: String, listenOnly: Boolean)

/**
  * Received from FS about the conference is running (created, destroyed).
  */
object VoiceConfRunningEvtMsg { val NAME = "VoiceConfRunningEvtMsg" }
case class VoiceConfRunningEvtMsg(header: BbbCoreVoiceConfHeader,
                                     body: VoiceConfRunningEvtMsgBody) extends VoiceStandardMsg
case class VoiceConfRunningEvtMsgBody(voiceConf: String, running: Boolean)


/**
  * Received from FS that user has left the voice conference.
  */
  object UserLeftVoiceConfEvtMsg { val NAME = "UserLeftVoiceConfEvtMsg" }
  case class UserLeftVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                     body: UserLeftVoiceConfEvtMsgBody) extends VoiceStandardMsg
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
  case class UserMutedInVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                        body: UserMutedInVoiceConfEvtMsgBody) extends VoiceStandardMsg
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
  case class UserTalkingInVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                          body: UserTalkingInVoiceConfEvtMsgBody) extends VoiceStandardMsg
  case class UserTalkingInVoiceConfEvtMsgBody(voiceConf: String, voiceUserId: String, talking: Boolean)

/**
  * Sent to clients that voice conf is being recorded.
  */
object VoiceRecordingStartedEvtMsg { val NAME = "VoiceRecordingStartedEvtMsg" }
case class VoiceRecordingStartedEvtMsg(header: BbbClientMsgHeader,
                                        body: VoiceRecordingStartedEvtMsgBody) extends BbbCoreMsg
case class VoiceRecordingStartedEvtMsgBody(meetingId: String, stream: String, timestamp: String, voiceConf: String)

/**
  * Sent to clients that voice conf is no longer being recorded.
  */
object VoiceRecordingStoppedEvtMsg { val NAME = "VoiceRecordingStoppedEvtMsg" }
case class VoiceRecordingStoppedEvtMsg(header: BbbClientMsgHeader,
                                        body: VoiceRecordingStoppedEvtMsgBody) extends BbbCoreMsg
case class VoiceRecordingStoppedEvtMsgBody(meetingId: String, stream: String, timestamp: String, voiceConf: String)

/**
  * Sent from bbb-voice when a user connects to "global audio"
  */
object UserConnectedToGlobalAudioMsg { val NAME = "UserConnectedToGlobalAudioMsg" }
case class UserConnectedToGlobalAudioMsg(header: BbbCoreVoiceConfHeader,
                                         body: UserConnectedToGlobalAudioMsgBody) extends VoiceStandardMsg
case class UserConnectedToGlobalAudioMsgBody(userId: String, name: String)

 /**
  * Sent from bbb-voice when a user disconnects from "global audio"
  */
object UserDisconnectedFromGlobalAudioMsg { val NAME = "UserDisconnectedFromGlobalAudioMsg" }
case class UserDisconnectedFromGlobalAudioMsg(header: BbbCoreVoiceConfHeader,
                                              body: UserDisconnectedFromGlobalAudioMsgBody) extends VoiceStandardMsg
case class UserDisconnectedFromGlobalAudioMsgBody(userId: String, name: String)
