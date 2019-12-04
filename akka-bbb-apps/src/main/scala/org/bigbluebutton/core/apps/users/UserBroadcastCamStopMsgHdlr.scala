package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.Webcams
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait UserBroadcastCamStopMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleUserBroadcastCamStopMsg(msg: UserBroadcastCamStopMsg): Unit = {
    for {
      _ <- Webcams.removeWebcamBroadcastStream(liveMeeting.webcams, msg.body.stream)
    } yield {
      broadcastUserBroadcastCamStoppedEvtMsg(msg.body.stream, msg.header.userId)

    }
  }

  def broadcastUserBroadcastCamStoppedEvtMsg(streamId: String, userId: String): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, userId)
    val envelope = BbbCoreEnvelope(UserBroadcastCamStoppedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(UserBroadcastCamStoppedEvtMsg.NAME, props.meetingProp.intId, userId)

    val body = UserBroadcastCamStoppedEvtMsgBody(userId, streamId)
    val event = UserBroadcastCamStoppedEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    outGW.send(msgEvent)
  }
}
