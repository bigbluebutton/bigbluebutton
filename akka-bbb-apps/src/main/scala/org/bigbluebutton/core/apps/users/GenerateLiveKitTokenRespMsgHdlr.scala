package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.models.{ RegisteredUsers, Users2x }

trait GenerateLiveKitTokenRespMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleGenerateLiveKitTokenRespMsg(msg: GenerateLiveKitTokenRespMsg) {
    val userId = msg.header.userId
    val token = msg.body.token

    for {
      ru <- RegisteredUsers.findWithUserId(userId, liveMeeting.registeredUsers)
    } yield {
      RegisteredUsers.setLivekitToken(liveMeeting.registeredUsers, ru, token)
    }
  }
}
