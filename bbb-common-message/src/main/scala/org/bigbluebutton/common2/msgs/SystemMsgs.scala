package org.bigbluebutton.common2.msgs

import org.bigbluebutton.common2.domain.DefaultProps


/** Request Messages **/
  object CreateMeetingReqMsg { val NAME = "CreateMeetingReqMsg" }
  case class CreateMeetingReqMsg(header: BbbCoreBaseHeader,
                                 body: CreateMeetingReqMsgBody) extends BbbCoreMsg
  case class CreateMeetingReqMsgBody(props: DefaultProps)

  object DestroyMeetingSysCmdMsg { val NAME = "DestroyMeetingSysCmdMsg" }
  case class DestroyMeetingSysCmdMsg(header: BbbCoreBaseHeader,
                                 body: DestroyMeetingSysCmdMsgBody) extends BbbCoreMsg
  case class DestroyMeetingSysCmdMsgBody(meetingId: String)

  object EndMeetingSysCmdMsg { val NAME = "DestroyMeetingReqMsg" }
  case class EndMeetingSysCmdMsg(header: BbbCoreBaseHeader,
                                  body: EndMeetingSysCmdMsgBody) extends BbbCoreMsg
  case class EndMeetingSysCmdMsgBody(meetingId: String)

  object GetAllMeetingsReqMsg { val NAME = "GetAllMeetingsReqMsg" }
  case class GetAllMeetingsReqMsg(header: BbbCoreBaseHeader,
                                  body: GetAllMeetingsReqMsgBody) extends BbbCoreMsg
  case class GetAllMeetingsReqMsgBody(requesterId: String)

  object PubSubPingSysReqMsg { val NAME = "PubSubPingSysReqMsg" }
  case class PubSubPingSysReqMsg(header: BbbCoreBaseHeader,
                                  body: PubSubPingSysReqMsgBody) extends BbbCoreMsg
  case class PubSubPingSysReqMsgBody(system: String, timestamp: Long)

  /** Response Messages **/
  object MeetingCreatedEvtMsg { val NAME = "MeetingCreatedEvtMsg"}
  case class MeetingCreatedEvtMsg(header: BbbCoreBaseHeader,
                                  body: MeetingCreatedEvtBody) extends BbbCoreMsg
  case class MeetingCreatedEvtBody(props: DefaultProps)

  object MeetingEndedEvtMsg { val NAME = "MeetingEndedEvtMsg"}
  case class MeetingEndedEvtMsg(header: BbbCoreBaseHeader,
                                  body: MeetingEndedEvtMsgBody) extends BbbCoreMsg
  case class MeetingEndedEvtMsgBody(meetingId: String)

  object MeetingDestroyedEvtMsg { val NAME = "MeetingDestroyedEvtMsg"}
  case class MeetingDestroyedEvtMsg(header: BbbCoreBaseHeader,
                                  body: MeetingDestroyedEvtMsgBody) extends BbbCoreMsg
  case class MeetingDestroyedEvtMsgBody(meetingId: String)

object DisconnectAllClientsSysMsg { val NAME = "DisconnectAllClientsSysMsg"}
case class DisconnectAllClientsSysMsg(header: BbbCoreHeaderWithMeetingId,
                                  body: DisconnectAllClientsSysMsgBody) extends BbbCoreMsg
case class DisconnectAllClientsSysMsgBody(meetingId: String)

object EndAndKickAllSysMsg { val NAME = "EndAndKickAllSysMsg"}
case class EndAndKickAllSysMsg(header: BbbCoreHeaderWithMeetingId,
                                      body: EndAndKickAllSysMsgBody) extends BbbCoreMsg
case class EndAndKickAllSysMsgBody(meetingId: String)


object SyncGetMeetingInfoRespMsg { val NAME = "SyncGetMeetingInfoRespMsg"}
  case class SyncGetMeetingInfoRespMsg(header: BbbCoreBaseHeader,
                                  body: SyncGetMeetingInfoRespMsgBody) extends BbbCoreMsg
  case class SyncGetMeetingInfoRespMsgBody(props: DefaultProps)

  object PubSubPongSysRespMsg { val NAME = "PubSubPongSysRespMsg" }
  case class PubSubPongSysRespMsg(header: BbbCoreBaseHeader,
                               body: PubSubPongSysRespMsgBody) extends BbbCoreMsg
  case class PubSubPongSysRespMsgBody(system: String, timestamp: Long)

  /** System Messages **/
  case class AkkaAppsCheckAliveReqBody(timestamp: Long)
  case class AkkaAppsCheckAliveReqMsg(header: BbbCoreHeader, body: AkkaAppsCheckAliveReqBody)
  case class AkkaAppsCheckAliveReq(envelope: BbbCoreEnvelope, msg: AkkaAppsCheckAliveReqMsg) extends BbbCoreMsg

