package org.bigbluebutton.common2.msgs

object ScreenStreamSubscribeSysMsg { val NAME = "ScreenStreamSubscribeSysMsg" }
case class ScreenStreamSubscribeSysMsg(
    header: BbbCoreBaseHeader,
    body:   ScreenStreamSubscribeSysMsg
) extends BbbCoreMsg

case class ScreenStreamSubscribeSysMsgBody(
    meetingId:    String,
    userId:       String,
    streamId:     String,
    sfuSessionId: String
)