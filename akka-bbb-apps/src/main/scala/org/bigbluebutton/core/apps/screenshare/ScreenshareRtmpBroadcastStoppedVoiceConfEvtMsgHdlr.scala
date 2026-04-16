package org.bigbluebutton.core.apps.screenshare

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.ScreenshareModel
import org.bigbluebutton.core.apps.ScreenshareModel.getRTMPBroadcastingUrl
import org.bigbluebutton.core.apps.layout.ScreenshareAsContenthdlrHelper
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.{ LayoutDAO, ScreenshareDAO }
import org.bigbluebutton.core.models.{ Layouts, Screenshares }
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.screenshare.ScreenshareApp2x.broadcastStopped

trait ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsgHdlr {
  this: ScreenshareApp2x =>

  def handle(msg: ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    val isLiveKit = liveMeeting.props.meetingProp.screenShareBridge == "livekit"

    if (isLiveKit) {
      log.info("handleScreenshareRTMPBroadcastStoppedRequest (LiveKit): stream={}", msg.body.stream)

      ScreenshareApp2x.broadcastStopped(bus.outGW, liveMeeting, msg.body.stream)

      // If no more active screenshares, reset layout state
      if (!Screenshares.hasAnyActiveScreenshare(liveMeeting.screenshares)) {
        Layouts.setScreenshareAsContent(liveMeeting.layouts, false)
        LayoutDAO.insertOrUpdate(liveMeeting.props.meetingProp.intId, liveMeeting.layouts)
        for {
          presenter <- Users2x.findPresenter(liveMeeting.users2x)
        } yield {
          ScreenshareAsContenthdlrHelper.sendSetScreenshareAsContentEvtMsg(presenter.intId, liveMeeting, bus.outGW)
        }
      }
    } else {
      log.info("handleScreenshareRTMPBroadcastStoppedRequest: isBroadcastingRTMP=" +
        ScreenshareModel.isBroadcastingRTMP(liveMeeting.screenshareModel) + " URL:" +
        ScreenshareModel.getRTMPBroadcastingUrl(liveMeeting.screenshareModel))

      ScreenshareDAO.updateStopped(liveMeeting.props.meetingProp.intId, getRTMPBroadcastingUrl(liveMeeting.screenshareModel))

      broadcastStopped(bus.outGW, liveMeeting)
    }
  }
}
