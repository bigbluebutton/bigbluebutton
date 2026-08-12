package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.LiveKitMemberships
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }

trait GenerateLiveKitTokenRespMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleGenerateLiveKitTokenRespMsg(msg: GenerateLiveKitTokenRespMsg) {
    val userId = msg.header.userId
    val roomRef = msg.body.roomRef
    val token = msg.body.token

    LiveKitMemberships.setToken(
      liveMeeting.liveKitMemberships,
      userId,
      roomRef.roomName,
      token
    ) match {
        case Some(_) => ()
        case None =>
          log.warning(
            "GenerateLiveKitTokenRespMsg: no matching membership for userId={}, roomName={}, purpose={}",
            userId, roomRef.roomName, roomRef.purpose
          )
      }
  }
}
