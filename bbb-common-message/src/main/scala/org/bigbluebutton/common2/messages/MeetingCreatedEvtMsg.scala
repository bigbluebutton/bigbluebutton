package org.bigbluebutton.common2.messages

import org.bigbluebutton.common2.domain.DefaultProps

object MeetingCreatedEvtMsg { val NAME = "MeetingCreatedEvtMsg"}
case class MeetingCreatedEvtMsg(header: BbbCoreBaseHeader,
                                body: MeetingCreatedEvtBody) extends BbbCoreMsg
case class MeetingCreatedEvtBody(props: DefaultProps)


