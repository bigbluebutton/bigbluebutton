package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.Webcams
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait UserBroadcastCamStopMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleUserBroadcastCamStopMsg(msg: UserBroadcastCamStopMsg): Unit = {

    def broadcastEvent(msg: UserBroadcastCamStopMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(UserBroadcastCamStoppedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserBroadcastCamStoppedEvtMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val body = UserBroadcastCamStoppedEvtMsgBody(msg.header.userId, msg.body.stream)
      val event = UserBroadcastCamStoppedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    for {
      uvo <- Webcams.removeWebcamBroadcastStream(liveMeeting.webcams, msg.body.stream)
    } yield {
      broadcastEvent(msg)

    }
  }
}
