package org.bigbluebutton.common2.msgs

/**
 * Sent from client when user attemps to start or stop screensharing
 */
object UserScreenSharingStartedCmdMsg { val NAME = "UserScreenSharingStartedCmdMsg" }
case class UserScreenSharingStartedCmdMsg(
  header: BbbClientMsgHeader,
  body:   UserScreenSharingStartedCmdMsgBody) extends StandardMsg
case class UserScreenSharingStartedCmdMsgBody(userId: String, screenSharingType: String)

object UserScreenSharingStoppedCmdMsg { val NAME = "UserScreenSharingStoppedCmdMsg" }
case class UserScreenSharingStoppedCmdMsg(header: BbbClientMsgHeader, body: UserScreenSharingStoppedCmdMsgBody) extends StandardMsg
case class UserScreenSharingStoppedCmdMsgBody(userId: String)

/**
 * Sent from server to web API when user attemps to start or stop screensharing
 */
object UserScreenSharingStartedEvtMsg { val NAME = "UserScreenSharingStartedEvtMsg" }
case class UserScreenSharingStartedEvtMsg(
  header: BbbClientMsgHeader,
  body:   UserScreenSharingStartedEvtMsgBody) extends BbbCoreMsg
case class UserScreenSharingStartedEvtMsgBody(userId: String, screenSharingType: String)

object UserScreenSharingStoppedEvtMsg { val NAME = "UserScreenSharingStoppedEvtMsg" }
case class UserScreenSharingStoppedEvtMsg(header: BbbClientMsgHeader, body: UserScreenSharingStoppedEvtMsgBody) extends BbbCoreMsg
case class UserScreenSharingStoppedEvtMsgBody(userId: String)
