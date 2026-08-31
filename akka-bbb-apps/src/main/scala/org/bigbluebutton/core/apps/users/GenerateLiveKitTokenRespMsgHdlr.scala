package org.bigbluebutton.core.apps.users

import org.apache.pekko.actor.Cancellable
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.api.LiveKitTokenRefreshInternalMsg
import org.bigbluebutton.core.models.{ LiveKitMemberships, RegisteredUsers }
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder

import scala.concurrent.duration._

trait GenerateLiveKitTokenRespMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  // One LK token refresh timer per (userId, roomName)
  private var liveKitRefreshTimers: Map[(String, String), Cancellable] = Map()

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
        case Some(_) =>
          scheduleLiveKitTokenRefresh(userId, roomRef.roomName, msg.body.ttlSec)
        case None =>
          log.warning(
            "GenerateLiveKitTokenRespMsg: no matching membership for userId={}, roomName={}, purpose={}",
            userId, roomRef.roomName, roomRef.purpose
          )
      }
  }

  // Each successful token gen arms the next refresh at 75% of the token's TTL,
  // Membership removals makes pending ticks a no-op.
  private def scheduleLiveKitTokenRefresh(userId: String, roomName: String, ttlSec: Int): Unit = {
    import context.dispatcher
    val key = (userId, roomName)
    val interval = math.max((ttlSec * 0.75).toLong, 30L).seconds
    liveKitRefreshTimers.get(key).foreach(_.cancel())
    liveKitRefreshTimers += key -> context.system.scheduler.scheduleOnce(
      interval,
      self,
      LiveKitTokenRefreshInternalMsg(userId, roomName)
    )
  }

  def handleLiveKitTokenRefreshInternalMsg(msg: LiveKitTokenRefreshInternalMsg): Unit = {
    liveKitRefreshTimers -= ((msg.userId, msg.roomName))
    LiveKitMemberships.findByUserAndRoom(liveMeeting.liveKitMemberships, msg.userId, msg.roomName) foreach { m =>
      val userName = RegisteredUsers.findWithUserId(msg.userId, liveMeeting.registeredUsers)
        .map(_.name).getOrElse("")

      outGW.send(MsgBuilder.buildGenerateLiveKitTokenReqMsg(
        liveMeeting.props.meetingProp.intId,
        m.userId,
        userName,
        m.roomRef,
        m.grant,
        m.metadata
      ))
    }
  }
}
