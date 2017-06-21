package org.bigbluebutton.common2.messages.users

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}


object UserBroadcastCamStartMsg { val NAME = "UserBroadcastCamStartMsg" }
case class UserBroadcastCamStartMsg(header: BbbClientMsgHeader, body: UserBroadcastCamStartMsgBody) extends BbbCoreMsg
case class UserBroadcastCamStartMsgBody(stream: String)
