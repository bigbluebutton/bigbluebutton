package org.bigbluebutton.common2.msgs

import org.bigbluebutton.common2.domain.DefaultProps


/** Request Messages **/
  object CreateMeetingReqMsg { val NAME = "CreateMeetingReqMsg" }
  case class CreateMeetingReqMsg(header: BbbCoreBaseHeader,
                                 body: CreateMeetingReqMsgBody) extends BbbCoreMsg
  case class CreateMeetingReqMsgBody(props: DefaultProps)


  object GetAllMeetingsReqMsg { val NAME = "GetAllMeetingsReqMsg" }
  case class GetAllMeetingsReqMsg(header: BbbCoreBaseHeader,
                                  body: GetAllMeetingsReqMsgBody) extends BbbCoreMsg
  case class GetAllMeetingsReqMsgBody(requesterId: String)


  /** Response Messages **/
  object MeetingCreatedEvtMsg { val NAME = "MeetingCreatedEvtMsg"}
  case class MeetingCreatedEvtMsg(header: BbbCoreBaseHeader,
                                  body: MeetingCreatedEvtBody) extends BbbCoreMsg
  case class MeetingCreatedEvtBody(props: DefaultProps)


  object SyncGetMeetingInfoRespMsg { val NAME = "SyncGetMeetingInfoRespMsg"}
  case class SyncGetMeetingInfoRespMsg(header: BbbCoreBaseHeader,
                                  body: SyncGetMeetingInfoRespMsgBody) extends BbbCoreMsg
  case class SyncGetMeetingInfoRespMsgBody(props: DefaultProps)


  /** System Messages **/
  case class AkkaAppsCheckAliveReqBody(timestamp: Long)
  case class AkkaAppsCheckAliveReqMsg(header: BbbCoreHeader, body: AkkaAppsCheckAliveReqBody)
  case class AkkaAppsCheckAliveReq(envelope: BbbCoreEnvelope, msg: AkkaAppsCheckAliveReqMsg) extends BbbCoreMsg

