package org.bigbluebutton.common2.messages.voiceconf

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreHeader, BbbCoreHeaderWithMeetingId, BbbCoreMsg}

/*** Message from Akka Apps to FS Conference ***/
object EjectAllFromVoiceConfMsg { val NAME = "EjectAllFromVoiceConfMsg" }
case class EjectAllFromVoiceConfMsg(header: BbbCoreHeaderWithMeetingId,
                                   body: EjectAllFromVoiceConfMsgBody) extends BbbCoreMsg
case class EjectAllFromVoiceConfMsgBody(voiceConf: String)

object EjectUserFromVoiceConfMsg { val NAME = "EjectUserFromVoiceConfMsg"}
case class EjectUserFromVoiceConfMsg(header: BbbCoreHeaderWithMeetingId,
                                     body: EjectUserFromVoiceConfMsgBody) extends BbbCoreMsg
case class EjectUserFromVoiceConfMsgBody(voiceConf: String, voiceUserId: String)

object MuteUserInVoiceConfMsg { val NAME = "MuteUserInVoiceConfMsg" }
case class MuteUserInVoiceConfMsg(header: BbbCoreHeaderWithMeetingId,
                                  body: MuteUserInVoiceConfMsgBody) extends BbbCoreMsg
case class MuteUserInVoiceConfMsgBody(voiceConf: String, voiceUserId: String, mute: Boolean)

object TransferUserToVoiceConfMsg { val NAME = "TransferUserToVoiceConfMsg" }
case class TransferUserToVoiceConfMsg(header: BbbCoreHeaderWithMeetingId,
                                      body: TransferUserToVoiceConfMsgBody) extends BbbCoreMsg
case class TransferUserToVoiceConfMsgBody(fromVoiceConf: String, toVoiceConf: String, voiceUserId: String)

object StartRecordingVoiceConfMsg { val NAME = "StartRecordingVoiceConfMsg" }
case class StartRecordingVoiceConfMsg(header: BbbCoreHeaderWithMeetingId,
                                      body: StartRecordingVoiceConfMsgBody) extends BbbCoreMsg
case class StartRecordingVoiceConfMsgBody(voiceConf: String, meetingId: String)

object StopRecordingVoiceConfMsg { val NAME = "StopRecordingVoiceConfMsg" }
case class StopRecordingVoiceConfMsg(header: BbbCoreHeaderWithMeetingId,
                                      body: StopRecordingVoiceConfMsgBody) extends BbbCoreMsg
case class StopRecordingVoiceConfMsgBody(voiceConf: String, meetingId: String, stream: String)

object DeskshareStartRtmpBroadcastVoiceConfMsg { val NAME = "DeskshareStartRtmpBroadcastVoiceConfMsg" }
case class DeskshareStartRtmpBroadcastVoiceConfMsg(header: BbbCoreHeaderWithMeetingId,
                                          body: DeskshareStartRtmpBroadcastVoiceConfMsgBody) extends BbbCoreMsg
case class DeskshareStartRtmpBroadcastVoiceConfMsgBody(voiceConf: String, deskshareConf: String, url: String, timestamp: String)

object DeskshareStopRtmpBroadcastVoiceConfMsg { val NAME = "DeskshareStopRtmpBroadcastVoiceConfMsg" }
case class DeskshareStopRtmpBroadcastVoiceConfMsg(header: BbbCoreHeaderWithMeetingId,
                                         body: DeskshareStopRtmpBroadcastVoiceConfMsgBody) extends BbbCoreMsg
case class DeskshareStopRtmpBroadcastVoiceConfMsgBody(voiceConf: String, deskshareConf: String, url: String, timestamp: String)

object DeskshareHangUpVoiceConfMsg { val NAME = "DeskshareHangUpVoiceConfMsg" }
case class DeskshareHangUpVoiceConfMsg(header: BbbCoreHeaderWithMeetingId,
                                       body: DeskshareHangUpVoiceConfMsgBody) extends BbbCoreMsg
case class DeskshareHangUpVoiceConfMsgBody(voiceConf: String, deskshareConf: String, timestamp: String)


/*** Message from FS Conference to Akka Apps ***/
case class BbbCoreVoiceConfHeader(name: String, voiceConf: String) extends BbbCoreHeader

object RecordingStartedVoiceConfEvtMsg { val NAME = "RecordingStartedVoiceConfEvtMsg" }
case class RecordingStartedVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                            body: RecordingStartedVoiceConfEvtMsgBody) extends BbbCoreMsg
case class RecordingStartedVoiceConfEvtMsgBody(voiceConf: String, stream: String, recording: Boolean, timestamp: String)

object UserJoinedVoiceConfEvtMsg { val NAME = "UserJoinedVoiceConfEvtMsg" }
case class UserJoinedVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                     body: UserJoinedVoiceConfEvtMsgBody) extends BbbCoreMsg
case class UserJoinedVoiceConfEvtMsgBody(voiceConf: String, voiceUserId: String, intId: String,
                                         callerIdName: String, callerIdNum: String, muted: Boolean,
                                         talking: Boolean, callingWith: String)

object UserLeftVoiceConfEvtMsg { val NAME = "UserLeftVoiceConfEvtMsg" }
case class UserLeftVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                   body: UserLeftVoiceConfEvtMsgBody) extends BbbCoreMsg
case class UserLeftVoiceConfEvtMsgBody(voiceConf: String, voiceUserId: String)

object UserMutedInVoiceConfEvtMsg { val NAME = "UserMutedInVoiceConfEvtMsg" }
case class UserMutedInVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                      body: UserMutedInVoiceConfEvtMsgBody) extends BbbCoreMsg
case class UserMutedInVoiceConfEvtMsgBody(voiceConf: String, voiceUserId: String, muted: Boolean)

object UserTalkingInVoiceConfEvtMsg { val NAME = "UserTalkingInVoiceConfEvtMsg" }
case class UserTalkingInVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                        body: UserTalkingInVoiceConfEvtMsgBody) extends BbbCoreMsg
case class UserTalkingInVoiceConfEvtMsgBody(voiceConf: String, voiceUserId: String, talking: Boolean)

object DeskshareStartedVoiceConfEvtMsg { val NAME = "DeskshareStartedVoiceConfEvtMsg" }
case class DeskshareStartedVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                           body: DeskshareStartedVoiceConfEvtMsgBody) extends BbbCoreMsg
case class DeskshareStartedVoiceConfEvtMsgBody(voiceConf: String, deskshareConf: String,
                                               callerIdNum: String, callerIdName: String)

object DeskshareStoppedVoiceConfEvtMsg { val NAME = "DeskshareStoppedVoiceConfEvtMsg"}
case class DeskshareStoppedVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                           body: DeskshareStoppedVoiceConfEvtMsgBody) extends BbbCoreMsg
case class DeskshareStoppedVoiceConfEvtMsgBody(voiceConf: String, deskshareConf: String,
                                               callerIdNum: String, callerIdName: String)

object DeskshareRtmpBroadcastStartedVoiceConfEvtMsg { val NAME = "DeskshareRtmpBroadcastStartedVoiceConfEvtMsg"}
case class DeskshareRtmpBroadcastStartedVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                                        body: DeskshareRtmpBroadcastStartedVoiceConfEvtMsgBody) extends BbbCoreMsg
case class DeskshareRtmpBroadcastStartedVoiceConfEvtMsgBody(voiceConf: String, deskshareConf: String,
                                                            stream: String, vidWidth: String, vidHeight: String,
                                                            timestamp: String)

object DeskshareRtmpBroadcastStoppedVoiceConfEvtMsg { val NAME = "DeskshareRtmpBroadcastStoppedVoiceConfEvtMsg"}
case class DeskshareRtmpBroadcastStoppedVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                                        body: DeskshareRtmpBroadcastStoppedVoiceConfEvtMsgBody) extends BbbCoreMsg
case class DeskshareRtmpBroadcastStoppedVoiceConfEvtMsgBody(voiceConf: String, deskshareConf: String,
                                                            stream: String, vidWidth: String, vidHeight: String,
                                                            timestamp: String)

/*** Message going to clients from Akka Apps ***/
object UserJoinedVoiceConfToClientEvtMsg { val NAME = "UserJoinedVoiceConfToClientEvtMsg" }
case class UserJoinedVoiceConfToClientEvtMsg(header: BbbClientMsgHeader, body: UserJoinedVoiceConfToClientEvtMsgBody) extends BbbCoreMsg
case class UserJoinedVoiceConfToClientEvtMsgBody(intId: String, voiceUserId: String, callerName: String,
                                                 callerNum: String, muted: Boolean,
                                                 talking: Boolean, callingWith: String, listenOnly: Boolean)