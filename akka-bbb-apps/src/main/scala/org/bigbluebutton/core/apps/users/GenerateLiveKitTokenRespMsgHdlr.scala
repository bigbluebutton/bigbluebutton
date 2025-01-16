package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.RegisteredUsers
import org.bigbluebutton.core.running.{BaseMeetingActor, LiveMeeting, OutMsgRouter}

trait GenerateLiveKitTokenRespMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleGenerateLiveKitTokenRespMsg(msg: GenerateLiveKitTokenRespMsg): Unit = {
    val userId = msg.header.userId
    val token = msg.body.token

    for {
      ru <- RegisteredUsers.findWithUserId(userId, liveMeeting.registeredUsers)
    } yield {
      RegisteredUsers.setLivekitToken(liveMeeting.registeredUsers, ru, token)
    }
  }
}
