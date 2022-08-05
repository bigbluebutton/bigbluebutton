package org.bigbluebutton.core.apps.webcam

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.PermissionCheck
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core2.message.senders.{ MsgBuilder }

trait UpdateWebcamsOnlyForModeratorCmdMsgHdlr {
  this: WebcamApp2x =>

  def handle(
      msg:         UpdateWebcamsOnlyForModeratorCmdMsg,
      liveMeeting: LiveMeeting,
      bus:         MessageBus
  ) {
    val meetingId = liveMeeting.props.meetingProp.intId

    def broadcastEvent(meetingId: String, userId: String, webcamsOnlyForModerator: Boolean) {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
      val envelope = BbbCoreEnvelope(WebcamsOnlyForModeratorChangedEvtMsg.NAME, routing)
      val body = WebcamsOnlyForModeratorChangedEvtMsgBody(webcamsOnlyForModerator, userId)
      val header = BbbClientMsgHeader(WebcamsOnlyForModeratorChangedEvtMsg.NAME, meetingId, userId)
      val event = WebcamsOnlyForModeratorChangedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    val allow = CameraHdlrHelpers.isWebcamsOnlyForModeratorUpdateAllowed(
      liveMeeting,
      msg.header.userId
    )

    if (!allow) {
      val reason = "No permission to change lock settings"
      PermissionCheck.ejectUserForFailedPermission(
        meetingId,
        msg.header.userId,
        reason,
        bus.outGW,
        liveMeeting
      )
    } else {
      CameraHdlrHelpers.updateWebcamsOnlyForModerator(
        liveMeeting,
        msg.body.webcamsOnlyForModerator,
        bus.outGW
      ) match {
          case Some(value) => {
            log.info(s"Change webcams only for moderator status. meetingId=${meetingId} value=${value}")

            if (value) {
              val notifyEvent = MsgBuilder.buildNotifyAllInMeetingEvtMsg(
                meetingId,
                "info",
                "lock",
                "app.userList.userOptions.webcamsOnlyForModerator",
                "Label to disable all webcams except for the moderators cam",
                Vector()
              )
              bus.outGW.send(notifyEvent)
            } else {
              val notifyEvent = MsgBuilder.buildNotifyAllInMeetingEvtMsg(
                meetingId,
                "info",
                "lock",
                "app.userList.userOptions.enableOnlyModeratorWebcam",
                "Label to enable all webcams except for the moderators cam",
                Vector()
              )
              bus.outGW.send(notifyEvent)
            }

            broadcastEvent(meetingId, msg.body.setBy, value)
          }
          case _ =>
        }
    }
  }
}
