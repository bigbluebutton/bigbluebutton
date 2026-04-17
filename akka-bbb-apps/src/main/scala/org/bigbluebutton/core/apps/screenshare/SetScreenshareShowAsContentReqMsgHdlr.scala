package org.bigbluebutton.core.apps.screenshare

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.PermissionCheck
import org.bigbluebutton.core.apps.layout.ScreenshareAsContenthdlrHelper
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.{ LayoutDAO, ScreenshareDAO }
import org.bigbluebutton.core.models.{ Layouts, Screenshares }
import org.bigbluebutton.core.running.LiveMeeting

trait SetScreenshareShowAsContentReqMsgHdlr {
  this: ScreenshareApp2x =>

  def handle(
      msg:         SetScreenshareShowAsContentReqMsg,
      liveMeeting: LiveMeeting,
      bus:         MessageBus
  ): Unit = {
    val meetingId = liveMeeting.props.meetingProp.intId

    def broadcastEvent(streamId: String, showAsContent: Boolean, setBy: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, setBy)
      val envelope = BbbCoreEnvelope(SetScreenshareShowAsContentEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(SetScreenshareShowAsContentEvtMsg.NAME, meetingId, setBy)
      val body = SetScreenshareShowAsContentEvtMsgBody(streamId, showAsContent, setBy)
      val event = SetScreenshareShowAsContentEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    val userIsModerator = PermissionCheck.isAllowed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL,
      liveMeeting.users2x,
      msg.header.userId
    )

    if (!userIsModerator) {
      val reason = "No permission to set showAsContent for screenshare."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      for {
        stream <- Screenshares.findByStreamId(liveMeeting.screenshares, msg.body.streamId)
      } yield {
        if (msg.body.showAsContent) {
          // Demote all other screenshares before promoting the target
          Screenshares.findAll(liveMeeting.screenshares).foreach { s =>
            if (s.streamId != msg.body.streamId) {
              Screenshares.setShowAsContent(liveMeeting.screenshares, s.streamId, showAsContent = false)
              ScreenshareDAO.updateShowAsContent(meetingId, s.streamId, showAsContent = false)
              broadcastEvent(s.streamId, showAsContent = false, msg.body.setBy)
            }
          }
        }
        Screenshares.setShowAsContent(liveMeeting.screenshares, msg.body.streamId, msg.body.showAsContent)
        ScreenshareDAO.updateShowAsContent(meetingId, msg.body.streamId, msg.body.showAsContent)
        broadcastEvent(msg.body.streamId, msg.body.showAsContent, msg.body.setBy)

        // Notify the recorder so it can track screenshare_as_content correctly
        Layouts.setScreenshareAsContent(liveMeeting.layouts, msg.body.showAsContent)
        LayoutDAO.insertOrUpdate(meetingId, liveMeeting.layouts)
        ScreenshareAsContenthdlrHelper.sendSetScreenshareAsContentEvtMsg(msg.body.setBy, liveMeeting, bus.outGW)
      }
    }
  }
}
