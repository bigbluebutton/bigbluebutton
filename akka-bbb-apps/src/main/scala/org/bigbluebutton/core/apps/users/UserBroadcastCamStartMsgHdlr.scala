package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ MediaStream, WebcamStream, Webcams }
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.apps.PermissionCheck
import org.bigbluebutton.LockSettingsUtil

trait UserBroadcastCamStartMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleUserBroadcastCamStartMsg(msg: UserBroadcastCamStartMsg): Unit = {
    var allowed: Boolean = false

    def broadcastEvent(msg: UserBroadcastCamStartMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(UserBroadcastCamStartedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserBroadcastCamStartedEvtMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val body = UserBroadcastCamStartedEvtMsgBody(msg.header.userId, msg.body.stream)
      val event = UserBroadcastCamStartedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.header.userId)
    } yield {
      val meetingId = props.meetingProp.intId
      val camBroadcastLocked = LockSettingsUtil.isCameraBroadcastLocked(user, liveMeeting)

      if (!user.userLeftFlag.left
        && meetingId == msg.header.meetingId
        && msg.body.stream.startsWith(msg.header.userId)
        && (applyPermissionCheck && !camBroadcastLocked)) {
        allowed = true
      }

      if (!allowed) {
        val reason = "No permission to share camera."
        PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
      } else {
        val stream = new MediaStream(msg.body.stream, msg.body.stream, msg.header.userId, Map.empty, Set.empty)
        val webcamStream = new WebcamStream(msg.body.stream, stream)

        for {
          uvo <- Webcams.addWebcamBroadcastStream(liveMeeting.webcams, webcamStream)
        } yield {
          broadcastEvent(msg)
        }
      }
    }
  }
}
