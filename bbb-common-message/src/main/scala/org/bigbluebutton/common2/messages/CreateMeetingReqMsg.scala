package org.bigbluebutton.common2.messages

import org.bigbluebutton.common2.domain.DefaultProps

object CreateMeetingReqMsg { val NAME = "CreateMeetingReqMsg" }
case class CreateMeetingReqMsg(header: BbbCoreBaseHeader,
                               body: CreateMeetingReqMsgBody) extends BbbCoreMsg

case class CreateMeetingReqMsgBody(props: DefaultProps)
