package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.messages.MessageBody.{ UserBroadcastCamStoppedEvtMsgBody }
import org.bigbluebutton.common2.messages._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.Users
import org.bigbluebutton.core.running.MeetingActor

trait UserBroadcastCamStopMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleUserBroadcastCamStopMsg(msg: UserBroadcastCamStopMsg): Unit = {

    def broadcastEvent(msg: UserBroadcastCamStopMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(UserBroadcastCamStoppedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserBroadcastCamStoppedEvtMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val body = UserBroadcastCamStoppedEvtMsgBody(msg.header.userId, msg.body.stream)
      val event = UserBroadcastCamStoppedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)

      record(event)
    }

    for {
      uvo <- Users.userUnsharedWebcam(msg.header.userId, liveMeeting.users, msg.body.stream)
    } yield {
      broadcastEvent(msg)

    }
  }
}
