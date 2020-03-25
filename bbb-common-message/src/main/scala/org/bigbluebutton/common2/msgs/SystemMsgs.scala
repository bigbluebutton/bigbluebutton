package org.bigbluebutton.common2.msgs

import org.bigbluebutton.common2.domain.DefaultProps

/** Request Messages **/
object CreateMeetingReqMsg { val NAME = "CreateMeetingReqMsg" }
case class CreateMeetingReqMsg(
    header: BbbCoreBaseHeader,
    body:   CreateMeetingReqMsgBody
) extends BbbCoreMsg
case class CreateMeetingReqMsgBody(props: DefaultProps)

/**
 * Sent by bbb-web
 */
object DestroyMeetingSysCmdMsg { val NAME = "DestroyMeetingSysCmdMsg" }
case class DestroyMeetingSysCmdMsg(
    header: BbbCoreBaseHeader,
    body:   DestroyMeetingSysCmdMsgBody
) extends BbbCoreMsg
case class DestroyMeetingSysCmdMsgBody(meetingId: String)

/**
 * Sent by bbb-web
 */
object EndMeetingSysCmdMsg { val NAME = "EndMeetingSysCmdMsg" }
case class EndMeetingSysCmdMsg(
    header: BbbClientMsgHeader,
    body:   EndMeetingSysCmdMsgBody
) extends StandardMsg
case class EndMeetingSysCmdMsgBody(meetingId: String)

object GetAllMeetingsReqMsg { val NAME = "GetAllMeetingsReqMsg" }
case class GetAllMeetingsReqMsg(
    header: BbbCoreBaseHeader,
    body:   GetAllMeetingsReqMsgBody
) extends BbbCoreMsg
case class GetAllMeetingsReqMsgBody(requesterId: String)

object PubSubPingSysReqMsg { val NAME = "PubSubPingSysReqMsg" }
case class PubSubPingSysReqMsg(
    header: BbbCoreBaseHeader,
    body:   PubSubPingSysReqMsgBody
) extends BbbCoreMsg
case class PubSubPingSysReqMsgBody(system: String, timestamp: Long)

/** Response Messages **/
object MeetingCreatedEvtMsg { val NAME = "MeetingCreatedEvtMsg" }
case class MeetingCreatedEvtMsg(
    header: BbbCoreBaseHeader,
    body:   MeetingCreatedEvtBody
) extends BbbCoreMsg
case class MeetingCreatedEvtBody(props: DefaultProps)

/**
 * Sent from akka-apps to bbb-web to inform about end of meeting
 */
object MeetingEndedEvtMsg { val NAME = "MeetingEndedEvtMsg" }
case class MeetingEndedEvtMsg(
    header: BbbCoreBaseHeader,
    body:   MeetingEndedEvtMsgBody
) extends BbbCoreMsg
case class MeetingEndedEvtMsgBody(meetingId: String)

/**
 * Sent from akka-apps to clients to inform them of end of meeting
 */
object MeetingEndingEvtMsg { val NAME = "MeetingEndingEvtMsg" }
case class MeetingEndingEvtMsg(
    header: BbbClientMsgHeader,
    body:   MeetingEndingEvtMsgBody
) extends BbbCoreMsg
case class MeetingEndingEvtMsgBody(meetingId: String, reason: String)

/**
 * Sent to bbb-web
 */
object MeetingDestroyedEvtMsg { val NAME = "MeetingDestroyedEvtMsg" }
case class MeetingDestroyedEvtMsg(
    header: BbbCoreBaseHeader,
    body:   MeetingDestroyedEvtMsgBody
) extends BbbCoreMsg
case class MeetingDestroyedEvtMsgBody(meetingId: String)

/**
 * System server side message to eject user from meeting.
 */
object EjectUserFromMeetingSysMsg { val NAME = "EjectUserFromMeetingSysMsg" }
case class EjectUserFromMeetingSysMsg(header: BbbClientMsgHeader, body: EjectUserFromMeetingSysMsgBody) extends StandardMsg
case class EjectUserFromMeetingSysMsgBody(userId: String, ejectedBy: String)

object DisconnectAllClientsSysMsg { val NAME = "DisconnectAllClientsSysMsg" }
case class DisconnectAllClientsSysMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   DisconnectAllClientsSysMsgBody
) extends BbbCoreMsg
case class DisconnectAllClientsSysMsgBody(meetingId: String, reason: String)

object DisconnectClientSysMsg { val NAME = "DisconnectClientSysMsg" }
case class DisconnectClientSysMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   DisconnectClientSysMsgBody
) extends BbbCoreMsg
case class DisconnectClientSysMsgBody(meetingId: String, userId: String, ejectedBy: String, reason: String)

object EndAndKickAllSysMsg { val NAME = "EndAndKickAllSysMsg" }
case class EndAndKickAllSysMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   EndAndKickAllSysMsgBody
) extends BbbCoreMsg
case class EndAndKickAllSysMsgBody(meetingId: String)

object RecordStatusResetSysMsg { val NAME = "RecordStatusResetSysMsg" }
case class RecordStatusResetSysMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   RecordStatusResetSysMsgBody
) extends BbbCoreMsg
case class RecordStatusResetSysMsgBody(recording: Boolean, setBy: String)

object SyncGetMeetingInfoRespMsg { val NAME = "SyncGetMeetingInfoRespMsg" }
case class SyncGetMeetingInfoRespMsg(
    header: BbbCoreBaseHeader,
    body:   SyncGetMeetingInfoRespMsgBody
) extends BbbCoreMsg
case class SyncGetMeetingInfoRespMsgBody(props: DefaultProps)

object PubSubPongSysRespMsg { val NAME = "PubSubPongSysRespMsg" }
case class PubSubPongSysRespMsg(
    header: BbbCoreBaseHeader,
    body:   PubSubPongSysRespMsgBody
) extends BbbCoreMsg
case class PubSubPongSysRespMsgBody(system: String, timestamp: Long)

object MeetingTimeRemainingUpdateEvtMsg { val NAME = "MeetingTimeRemainingUpdateEvtMsg" }
case class MeetingTimeRemainingUpdateEvtMsg(
    header: BbbClientMsgHeader,
    body:   MeetingTimeRemainingUpdateEvtMsgBody
) extends BbbCoreMsg
case class MeetingTimeRemainingUpdateEvtMsgBody(timeLeftInSec: Long)

object MeetingInactivityWarningEvtMsg { val NAME = "MeetingInactivityWarningEvtMsg" }
case class MeetingInactivityWarningEvtMsg(
    header: BbbClientMsgHeader,
    body:   MeetingInactivityWarningEvtMsgBody
) extends BbbCoreMsg
case class MeetingInactivityWarningEvtMsgBody(timeLeftInSec: Long)

object MeetingIsActiveEvtMsg { val NAME = "MeetingIsActiveEvtMsg" }
case class MeetingIsActiveEvtMsg(
    header: BbbClientMsgHeader,
    body:   MeetingIsActiveEvtMsgBody
) extends BbbCoreMsg
case class MeetingIsActiveEvtMsgBody(meetingId: String)

object CheckAlivePingSysMsg { val NAME = "CheckAlivePingSysMsg" }
case class CheckAlivePingSysMsg(
    header: BbbCoreBaseHeader,
    body:   CheckAlivePingSysMsgBody
) extends BbbCoreMsg
case class CheckAlivePingSysMsgBody(system: String, timestamp: Long)

object CheckAlivePongSysMsg { val NAME = "CheckAlivePongSysMsg" }
case class CheckAlivePongSysMsg(
    header: BbbCoreBaseHeader,
    body:   CheckAlivePongSysMsgBody
) extends BbbCoreMsg
case class CheckAlivePongSysMsgBody(system: String, timestamp: Long)

object RecordingChapterBreakSysMsg { val NAME = "RecordingChapterBreakSysMsg" }
case class RecordingChapterBreakSysMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   RecordingChapterBreakSysMsgBody
) extends BbbCoreMsg
case class RecordingChapterBreakSysMsgBody(meetingId: String, timestamp: Long)

object ValidateConnAuthTokenSysMsg { val NAME = "ValidateConnAuthTokenSysMsg" }
case class ValidateConnAuthTokenSysMsg(
    header: BbbCoreBaseHeader,
    body:   ValidateConnAuthTokenSysMsgBody
) extends BbbCoreMsg
case class ValidateConnAuthTokenSysMsgBody(meetingId: String, userId: String, authToken: String,
                                           connId: String, app: String)

object ValidateConnAuthTokenSysRespMsg { val NAME = "ValidateConnAuthTokenSysRespMsg" }
case class ValidateConnAuthTokenSysRespMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   ValidateConnAuthTokenSysRespMsgBody
) extends BbbCoreMsg
case class ValidateConnAuthTokenSysRespMsgBody(meetingId: String, userId: String,
                                               connId: String, authzed: Boolean, app: String)

object PublishedRecordingSysMsg { val NAME = "PublishedRecordingSysMsg" }
case class PublishedRecordingSysMsg(header: BbbCoreBaseHeader, body: PublishedRecordingSysMsgBody) extends BbbCoreMsg
case class PublishedRecordingSysMsgBody(recordId: String)

object UnpublishedRecordingSysMsg { val NAME = "UnpublishedRecordingSysMsg" }
case class UnpublishedRecordingSysMsg(header: BbbCoreBaseHeader, body: UnpublishedRecordingSysMsgBody) extends BbbCoreMsg
case class UnpublishedRecordingSysMsgBody(recordId: String)

object DeletedRecordingSysMsg { val NAME = "DeletedRecordingSysMsg" }
case class DeletedRecordingSysMsg(header: BbbCoreBaseHeader, body: DeletedRecordingSysMsgBody) extends BbbCoreMsg
case class DeletedRecordingSysMsgBody(recordId: String)
