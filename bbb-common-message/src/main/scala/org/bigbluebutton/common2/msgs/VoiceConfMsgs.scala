package org.bigbluebutton.common2.msgs


case class BbbCoreVoiceConfHeader(name: String, voiceConf: String) extends BbbCoreHeader

trait VoiceStandardMsg extends BbbCoreMsg {
  def header: BbbCoreVoiceConfHeader
}

  object DeskshareHangUpVoiceConfMsg { val NAME = "DeskshareHangUpVoiceConfMsg" }
  case class DeskshareHangUpVoiceConfMsg(header: BbbCoreHeaderWithMeetingId,
                                         body: DeskshareHangUpVoiceConfMsgBody) extends BbbCoreMsg
  case class DeskshareHangUpVoiceConfMsgBody(voiceConf: String, deskshareConf: String, timestamp: String)

  object DeskshareRtmpBroadcastStartedVoiceConfEvtMsg { val NAME = "DeskshareRtmpBroadcastStartedVoiceConfEvtMsg"}
  case class DeskshareRtmpBroadcastStartedVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                                          body: DeskshareRtmpBroadcastStartedVoiceConfEvtMsgBody) extends VoiceStandardMsg
  case class DeskshareRtmpBroadcastStartedVoiceConfEvtMsgBody(voiceConf: String, deskshareConf: String,
                                                              stream: String, vidWidth: Int, vidHeight: Int,
                                                              timestamp: String)

  object DeskshareRtmpBroadcastStoppedVoiceConfEvtMsg { val NAME = "DeskshareRtmpBroadcastStoppedVoiceConfEvtMsg"}
  case class DeskshareRtmpBroadcastStoppedVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                                          body: DeskshareRtmpBroadcastStoppedVoiceConfEvtMsgBody) extends VoiceStandardMsg
  case class DeskshareRtmpBroadcastStoppedVoiceConfEvtMsgBody(voiceConf: String, deskshareConf: String,
                                                              stream: String, vidWidth: Int, vidHeight: Int,
                                                              timestamp: String)

  object DeskshareStartedVoiceConfEvtMsg { val NAME = "DeskshareStartedVoiceConfEvtMsg" }
  case class DeskshareStartedVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                             body: DeskshareStartedVoiceConfEvtMsgBody) extends VoiceStandardMsg
  case class DeskshareStartedVoiceConfEvtMsgBody(voiceConf: String, deskshareConf: String,
                                                 callerIdNum: String, callerIdName: String)

  object DeskshareStartRtmpBroadcastVoiceConfMsg { val NAME = "DeskshareStartRtmpBroadcastVoiceConfMsg" }
  case class DeskshareStartRtmpBroadcastVoiceConfMsg(header: BbbCoreHeaderWithMeetingId,
                                                     body: DeskshareStartRtmpBroadcastVoiceConfMsgBody) extends BbbCoreMsg
  case class DeskshareStartRtmpBroadcastVoiceConfMsgBody(voiceConf: String, deskshareConf: String, url: String, timestamp: String)


  object DeskshareStoppedVoiceConfEvtMsg { val NAME = "DeskshareStoppedVoiceConfEvtMsg"}
  case class DeskshareStoppedVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                             body: DeskshareStoppedVoiceConfEvtMsgBody) extends VoiceStandardMsg
  case class DeskshareStoppedVoiceConfEvtMsgBody(voiceConf: String, deskshareConf: String,
                                                 callerIdNum: String, callerIdName: String)

  object DeskshareStopRtmpBroadcastVoiceConfMsg { val NAME = "DeskshareStopRtmpBroadcastVoiceConfMsg" }
  case class DeskshareStopRtmpBroadcastVoiceConfMsg(header: BbbCoreHeaderWithMeetingId,
                                                    body: DeskshareStopRtmpBroadcastVoiceConfMsgBody) extends BbbCoreMsg
  case class DeskshareStopRtmpBroadcastVoiceConfMsgBody(voiceConf: String, deskshareConf: String, url: String, timestamp: String)


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
case class MuteAllExceptPresentersCmdMsgBody(mutedBy: String)

/**
  * Sent by client to mute all users except presenters in the voice conference.
  */
object IsMeetingMutedReqMsg { val NAME = "IsMeetingMutedReqMsg"}
case class IsMeetingMutedReqMsg(header: BbbClientMsgHeader,
                                         body: IsMeetingMutedReqMsgBody) extends StandardMsg
case class IsMeetingMutedReqMsgBody(requesterId: String)

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
case class MuteUserCmdMsgBody(userId: String, mutedBy: String)

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
case class MuteMeetingCmdMsgBody(mutedBy: String)

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
  case class StartRecordingVoiceConfSysMsgBody(voiceConf: String, meetingId: String)

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
  case class UserJoinedVoiceConfToClientEvtMsgBody(intId: String, voiceUserId: String, callerName: String,
                                                   callerNum: String, muted: Boolean,
                                                   talking: Boolean, callingWith: String, listenOnly: Boolean)

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
  case class UserLeftVoiceConfToClientEvtMsgBody(intId: String, voiceUserId: String)

/**
  * Sent to client that user has been muted in the voice conference.
  */
  object UserMutedToClientEvtMsg { val NAME = "UserMutedToClientEvtMsg" }
  case class UserMutedToClientEvtMsg(header: BbbClientMsgHeader, body: UserMutedToClientEvtMsgBody) extends BbbCoreMsg
  case class UserMutedToClientEvtMsgBody(intId: String, voiceUserId: String, muted: Boolean)

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

  object UserTalkingToClientEvtMsg { val NAME = "UserTalkingToClientEvtMsg" }
  case class UserTalkingToClientEvtMsg(header: BbbClientMsgHeader, body: UserTalkingToClientEvtMsgBody) extends BbbCoreMsg
  case class UserTalkingToClientEvtMsgBody(intId: String, voiceUserId: String, talking: Boolean)

/**
  * Received from FS that user is talking in voice conference.
  */
  object UserTalkingInVoiceConfEvtMsg { val NAME = "UserTalkingInVoiceConfEvtMsg" }
  case class UserTalkingInVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                          body: UserTalkingInVoiceConfEvtMsgBody) extends VoiceStandardMsg
  case class UserTalkingInVoiceConfEvtMsgBody(voiceConf: String, voiceUserId: String, talking: Boolean)


object VoiceRecordingStartedEvtMsg { val NAME = "VoiceRecordingStartedEvtMsg" }
case class VoiceRecordingStartedEvtMsg(header: BbbCoreVoiceConfHeader,
                                        body: VoiceRecordingStartedEvtMsgBody) extends BbbCoreMsg
case class VoiceRecordingStartedEvtMsgBody(meetingId: String, stream: String, timestamp: String, voiceConf: String)

object VoiceRecordingStoppedEvtMsg { val NAME = "VoiceRecordingStoppedEvtMsg" }
case class VoiceRecordingStoppedEvtMsg(header: BbbCoreVoiceConfHeader,
                                        body: VoiceRecordingStoppedEvtMsgBody) extends BbbCoreMsg
case class VoiceRecordingStoppedEvtMsgBody(meetingId: String, stream: String, timestamp: String, voiceConf: String)


