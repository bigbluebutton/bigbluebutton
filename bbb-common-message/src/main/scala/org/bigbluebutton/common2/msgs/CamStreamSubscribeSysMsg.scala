package org.bigbluebutton.common2.msgs

object CamStreamSubscribeSysMsg { val NAME = "CamStreamSubscribeSysMsg" }
case class CamStreamSubscribeSysMsg(
    header: BbbCoreBaseHeader,
    body:   CamStreamSubscribeSysMsgBody
) extends BbbCoreMsg

case class CamStreamSubscribeSysMsgBody(
    meetingId:    String,
    userId:       String,
    streamId:     String,
    sfuSessionId: String
)
