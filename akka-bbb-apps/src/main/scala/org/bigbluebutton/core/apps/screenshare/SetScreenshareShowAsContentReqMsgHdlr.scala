package org.bigbluebutton.core.apps.screenshare

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.PermissionCheck
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.ScreenshareDAO
import org.bigbluebutton.core.models.Screenshares
import org.bigbluebutton.core.running.LiveMeeting

trait SetScreenshareShowAsContentReqMsgHdlr {
  this: ScreenshareApp2x =>

  def handle(msg: SetScreenshareShowAsContentReqMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    val meetingId = liveMeeting.props.meetingProp.intId

    def broadcastEvt(streamId: String, showAsContent: Boolean, setBy: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, setBy)
      val envelope = BbbCoreEnvelope(SetScreenshareShowAsContentEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(SetScreenshareShowAsContentEvtMsg.NAME, meetingId, setBy)
      val body = SetScreenshareShowAsContentEvtMsgBody(streamId, showAsContent, setBy)
      val event = SetScreenshareShowAsContentEvtMsg(header, body)
      bus.outGW.send(BbbCommonEnvCoreMsg(envelope, event))
    }

    val notPresenter = !PermissionCheck.isAllowed(
      PermissionCheck.GUEST_LEVEL,
      PermissionCheck.PRESENTER_LEVEL,
      liveMeeting.users2x,
      msg.header.userId
    )

    if (notPresenter) {
      val reason = "No permission to toggle screenshare showAsContent."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      Screenshares.findByStream(liveMeeting.screenshares, msg.body.streamId).foreach { entry =>
        if (msg.body.showAsContent) {
          // Mutual exclusion: clear showAsContent on every other active stream first.
          Screenshares.findAll(liveMeeting.screenshares)
            .filter(s => s.stream != entry.stream && s.showAsContent)
            .foreach { other =>
              Screenshares.add(liveMeeting.screenshares, other.copy(showAsContent = false))
              ScreenshareDAO.updateShowAsContent(meetingId, other.stream, false)
              broadcastEvt(other.stream, false, msg.body.setBy)
            }
        }
        Screenshares.add(liveMeeting.screenshares, entry.copy(showAsContent = msg.body.showAsContent))
        ScreenshareDAO.updateShowAsContent(meetingId, entry.stream, msg.body.showAsContent)
        broadcastEvt(entry.stream, msg.body.showAsContent, msg.body.setBy)
      }
    }
  }
}
