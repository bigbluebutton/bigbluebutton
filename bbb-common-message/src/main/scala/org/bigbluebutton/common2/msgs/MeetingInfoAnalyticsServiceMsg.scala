package org.bigbluebutton.common2.msgs

object MeetingInfoAnalyticsServiceMsg { val NAME = "MeetingInfoAnalyticsServiceMsg" }
case class MeetingInfoAnalyticsServiceMsg(
    header: BbbCoreBaseHeader,
    body:   MeetingInfoAnalyticsMsgBody
) extends BbbCoreMsg
