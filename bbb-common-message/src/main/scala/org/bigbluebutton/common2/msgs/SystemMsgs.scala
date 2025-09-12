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
 * Sent from akka-apps to clients to inform them of notifications
 */
object NotifyAllInMeetingEvtMsg { val NAME = "NotifyAllInMeetingEvtMsg" }
case class NotifyAllInMeetingEvtMsg(
    header: BbbClientMsgHeader,
    body:   NotifyAllInMeetingEvtMsgBody
) extends BbbCoreMsg
case class NotifyAllInMeetingEvtMsgBody(meetingId: String, notificationType: String, icon: String, messageId: String, messageDescription: String, messageValues: Map[String, String])

object NotifyUserInMeetingEvtMsg { val NAME = "NotifyUserInMeetingEvtMsg" }
case class NotifyUserInMeetingEvtMsg(
    header: BbbClientMsgHeader,
    body:   NotifyUserInMeetingEvtMsgBody
) extends BbbCoreMsg
case class NotifyUserInMeetingEvtMsgBody(userId: String, meetingId: String, notificationType: String, icon: String, messageId: String, messageDescription: String, messageValues: Map[String, String])

object NotifyRoleInMeetingEvtMsg { val NAME = "NotifyRoleInMeetingEvtMsg" }
case class NotifyRoleInMeetingEvtMsg(
    header: BbbClientMsgHeader,
    body:   NotifyRoleInMeetingEvtMsgBody
) extends BbbCoreMsg
case class NotifyRoleInMeetingEvtMsgBody(role: String, meetingId: String, notificationType: String, icon: String, messageId: String, messageDescription: String, messageValues: Map[String, String])

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

object RecordStatusResetSysMsg { val NAME = "RecordStatusResetSysMsg" }
case class RecordStatusResetSysMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   RecordStatusResetSysMsgBody
) extends BbbCoreMsg
case class RecordStatusResetSysMsgBody(recording: Boolean, setBy: String)

object PubSubPongSysRespMsg { val NAME = "PubSubPongSysRespMsg" }
case class PubSubPongSysRespMsg(
    header: BbbCoreBaseHeader,
    body:   PubSubPongSysRespMsgBody
) extends BbbCoreMsg
case class PubSubPongSysRespMsgBody(system: String, timestamp: Long)

object CheckAlivePingSysMsg { val NAME = "CheckAlivePingSysMsg" }
case class CheckAlivePingSysMsg(
    header: BbbCoreBaseHeader,
    body:   CheckAlivePingSysMsgBody
) extends BbbCoreMsg
case class CheckAlivePingSysMsgBody(system: String, bbbWebTimestamp: Long, akkaAppsTimestamp: Long)

object CheckAlivePongSysMsg { val NAME = "CheckAlivePongSysMsg" }
case class CheckAlivePongSysMsg(
    header: BbbCoreBaseHeader,
    body:   CheckAlivePongSysMsgBody
) extends BbbCoreMsg
case class CheckAlivePongSysMsgBody(system: String, bbbWebTimestamp: Long, akkaAppsTimestamp: Long)

object RecordingChapterBreakSysMsg { val NAME = "RecordingChapterBreakSysMsg" }
case class RecordingChapterBreakSysMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   RecordingChapterBreakSysMsgBody
) extends BbbCoreMsg
case class RecordingChapterBreakSysMsgBody(meetingId: String, timestamp: Long)

object PublishedRecordingSysMsg { val NAME = "PublishedRecordingSysMsg" }
case class PublishedRecordingSysMsg(header: BbbCoreBaseHeader, body: PublishedRecordingSysMsgBody) extends BbbCoreMsg
case class PublishedRecordingSysMsgBody(recordId: String)

object UnpublishedRecordingSysMsg { val NAME = "UnpublishedRecordingSysMsg" }
case class UnpublishedRecordingSysMsg(header: BbbCoreBaseHeader, body: UnpublishedRecordingSysMsgBody) extends BbbCoreMsg
case class UnpublishedRecordingSysMsgBody(recordId: String)

object DeletedRecordingSysMsg { val NAME = "DeletedRecordingSysMsg" }
case class DeletedRecordingSysMsg(header: BbbCoreBaseHeader, body: DeletedRecordingSysMsgBody) extends BbbCoreMsg
case class DeletedRecordingSysMsgBody(recordId: String)

/**
 * Sent from akka-apps to graphql-middleware
 */
object CheckGraphqlMiddlewareAlivePingSysMsg { val NAME = "CheckGraphqlMiddlewareAlivePingSysMsg" }
case class CheckGraphqlMiddlewareAlivePingSysMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   CheckGraphqlMiddlewareAlivePingSysMsgBody
) extends BbbCoreMsg
case class CheckGraphqlMiddlewareAlivePingSysMsgBody(middlewareUID: String)

/**
 * Sent from graphql-middleware to akka-apps
 */
object CheckGraphqlMiddlewareAlivePongSysMsg { val NAME = "CheckGraphqlMiddlewareAlivePongSysMsg" }
case class CheckGraphqlMiddlewareAlivePongSysMsg(
    header: BbbCoreBaseHeader,
    body:   CheckGraphqlMiddlewareAlivePongSysMsgBody
) extends BbbCoreMsg
case class CheckGraphqlMiddlewareAlivePongSysMsgBody(middlewareUID: String)

/**
 * Sent from akka-apps to graphql-middleware
 */
object ForceUserGraphqlReconnectionSysMsg { val NAME = "ForceUserGraphqlReconnectionSysMsg" }
case class ForceUserGraphqlReconnectionSysMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   ForceUserGraphqlReconnectionSysMsgBody
) extends BbbCoreMsg
case class ForceUserGraphqlReconnectionSysMsgBody(meetingId: String, userId: String, sessionToken: String, reason: String)

object ForceUserGraphqlDisconnectionSysMsg { val NAME = "ForceUserGraphqlDisconnectionSysMsg" }
case class ForceUserGraphqlDisconnectionSysMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   ForceUserGraphqlDisconnectionSysMsgBody
) extends BbbCoreMsg
case class ForceUserGraphqlDisconnectionSysMsgBody(meetingId: String, userId: String, sessionToken: String, reason: String, reasonMessageId: String)

/**
 * Sent from graphql-middleware to akka-apps
 */

object UserGraphqlReconnectionForcedEvtMsg { val NAME = "UserGraphqlReconnectionForcedEvtMsg" }
case class UserGraphqlReconnectionForcedEvtMsg(
    header: BbbCoreBaseHeader,
    body:   UserGraphqlReconnectionForcedEvtMsgBody
) extends BbbCoreMsg
case class UserGraphqlReconnectionForcedEvtMsgBody(middlewareUID: String, sessionToken: String, browserConnectionId: String)

object UserGraphqlDisconnectionForcedEvtMsg { val NAME = "UserGraphqlDisconnectionForcedEvtMsg" }
case class UserGraphqlDisconnectionForcedEvtMsg(
    header: BbbCoreBaseHeader,
    body:   UserGraphqlDisconnectionForcedEvtMsgBody
) extends BbbCoreMsg
case class UserGraphqlDisconnectionForcedEvtMsgBody(middlewareUID: String, sessionToken: String, browserConnectionId: String)

object UserGraphqlConnectionEstablishedSysMsg { val NAME = "UserGraphqlConnectionEstablishedSysMsg" }
case class UserGraphqlConnectionEstablishedSysMsg(
    header: BbbCoreBaseHeader,
    body:   UserGraphqlConnectionEstablishedSysMsgBody
) extends BbbCoreMsg
case class UserGraphqlConnectionEstablishedSysMsgBody(
    middlewareUID:       String,
    sessionToken:        String,
    clientSessionUUID:   String,
    clientType:          String,
    clientIsMobile:      Boolean,
    browserConnectionId: String
)

object UserGraphqlConnectionClosedSysMsg { val NAME = "UserGraphqlConnectionClosedSysMsg" }
case class UserGraphqlConnectionClosedSysMsg(
    header: BbbCoreBaseHeader,
    body:   UserGraphqlConnectionClosedSysMsgBody
) extends BbbCoreMsg
case class UserGraphqlConnectionClosedSysMsgBody(middlewareUID: String, sessionToken: String, browserConnectionId: String)

/**
 * Sent from akka-apps to bbb-web to inform a summary of the meeting activities
 */
object LearningDashboardEvtMsg { val NAME = "LearningDashboardEvtMsg" }
case class LearningDashboardEvtMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   LearningDashboardEvtMsgBody
) extends BbbCoreMsg
case class LearningDashboardEvtMsgBody(learningDashboardAccessToken: String, activityJson: String)
