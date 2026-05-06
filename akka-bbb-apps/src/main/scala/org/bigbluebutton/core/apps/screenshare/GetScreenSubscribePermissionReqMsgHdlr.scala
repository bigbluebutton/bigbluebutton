package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.models.{ Users2x, Screenshares, Roles }
import org.bigbluebutton.core.apps.ScreenshareModel
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait GetScreenSubscribePermissionReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleGetScreenSubscribePermissionReqMsg(msg: GetScreenSubscribePermissionReqMsg) {
    var allowed = false

    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId)
    } yield {
      if (liveMeeting.props.meetingProp.intId == msg.body.meetingId
        && liveMeeting.props.voiceProp.voiceConf == msg.body.voiceConf) {
        val streamId = msg.body.streamId
        // Check in the multi-screenshare collection first, then fall back to the legacy singleton.
        val streamKnown = Screenshares.hasStream(liveMeeting.screenshares, streamId) ||
          ScreenshareModel.getRTMPBroadcastingUrl(liveMeeting.screenshareModel) == streamId

        if (streamKnown) {
          // Apply hideViewersScreenshare: locked viewers cannot subscribe to other viewers' streams.
          val permissions = MeetingStatus2x.getPermissions(liveMeeting.status)
          val isLockedViewer = user.role == Roles.VIEWER_ROLE && user.locked
          if (isLockedViewer && permissions.hideViewersScreenshare) {
            // Check whether the stream belongs to a viewer.
            val broadcasterIsViewer = Screenshares.findByStream(liveMeeting.screenshares, streamId)
              .exists { entry =>
                Users2x.findWithIntId(liveMeeting.users2x, entry.userId)
                  .exists(_.role == Roles.VIEWER_ROLE)
              }
            if (!broadcasterIsViewer) allowed = true
            // Subscription to viewer streams is blocked; to moderator/presenter streams it is not.
          } else {
            allowed = true
          }
        }
      }
    }

    val event = MsgBuilder.buildGetScreenSubscribePermissionRespMsg(
      liveMeeting.props.meetingProp.intId,
      liveMeeting.props.voiceProp.voiceConf,
      msg.body.userId,
      msg.body.streamId,
      msg.body.sfuSessionId,
      allowed
    )
    outGW.send(event)
  }
}
