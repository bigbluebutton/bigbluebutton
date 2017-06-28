package org.bigbluebutton.common2.msgs

import org.bigbluebutton.common2.domain.DefaultProps



  object CreateMeetingReqMsg { val NAME = "CreateMeetingReqMsg" }
  case class CreateMeetingReqMsg(header: BbbCoreBaseHeader,
                                 body: CreateMeetingReqMsgBody) extends BbbCoreMsg

  case class CreateMeetingReqMsgBody(props: DefaultProps)

  object MeetingCreatedEvtMsg { val NAME = "MeetingCreatedEvtMsg"}
  case class MeetingCreatedEvtMsg(header: BbbCoreBaseHeader,
                                  body: MeetingCreatedEvtBody) extends BbbCoreMsg
  case class MeetingCreatedEvtBody(props: DefaultProps)




  /** System Messages **/
  case class AkkaAppsCheckAliveReqBody(timestamp: Long)
  case class AkkaAppsCheckAliveReqMsg(header: BbbCoreHeader, body: AkkaAppsCheckAliveReqBody)
  case class AkkaAppsCheckAliveReq(envelope: BbbCoreEnvelope, msg: AkkaAppsCheckAliveReqMsg) extends BbbCoreMsg

