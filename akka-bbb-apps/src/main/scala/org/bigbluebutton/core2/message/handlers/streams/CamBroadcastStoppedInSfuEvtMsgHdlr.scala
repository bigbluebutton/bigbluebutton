package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.Webcams
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.apps.PermissionCheck
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait CamBroadcastStoppedInSfuEvtMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleCamBroadcastStoppedInSfuEvtMsg(msg: CamBroadcastStoppedInSfuEvtMsg): Unit = {
    for {
      publisherStream <- Webcams.findWithStreamId(liveMeeting.webcams, msg.body.streamId)
    } yield {
      if (publisherStream.stream.userId != msg.header.userId
        || !msg.body.streamId.startsWith(msg.header.userId)) {
        val reason = "User does not own camera stream"
        PermissionCheck.ejectUserForFailedPermission(
          props.meetingProp.intId, msg.header.userId, reason, outGW, liveMeeting
        )
      } else {
        for {
          _ <- Webcams.removeWebcamBroadcastStream(liveMeeting.webcams, msg.body.streamId)
        } yield {
          val event = MsgBuilder.buildUserBroadcastCamStoppedEvtMsg(
            props.meetingProp.intId, msg.header.userId, msg.body.streamId
          )
          outGW.send(event)
        }
      }
    }
  }
}
