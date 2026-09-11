package org.bigbluebutton.core.apps.screenshare

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.ScreenshareModel
import org.bigbluebutton.core.apps.ScreenshareModel.getRTMPBroadcastingUrl
import org.bigbluebutton.core.apps.layout.ScreenshareAsContenthdlrHelper
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.{ LayoutDAO, ScreenshareDAO }
import org.bigbluebutton.core.models.Layouts
import org.bigbluebutton.core.models.Users2x.findPresenter
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.screenshare.ScreenshareApp2x.broadcastStopped

trait ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsgHdlr {
  this: ScreenshareApp2x =>

  def handle(msg: ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    log.info("handleScreenshareRTMPBroadcastStoppedRequest: isBroadcastingRTMP=" +
      ScreenshareModel.isBroadcastingRTMP(liveMeeting.screenshareModel) + " URL:" +
      ScreenshareModel.getRTMPBroadcastingUrl(liveMeeting.screenshareModel))

    ScreenshareDAO.updateStopped(liveMeeting.props.meetingProp.intId, getRTMPBroadcastingUrl(liveMeeting.screenshareModel))

    // The start handler turns screenshare-as-content on automatically, so turn it back off here.
    // Otherwise the flag stays on for the rest of the meeting and SetScreenshareAsContentEvent is
    // only ever recorded as true, which strands the recording processor on the screenshare.
    if (ScreenshareModel.isBroadcastingRTMP(liveMeeting.screenshareModel) &&
      Layouts.getScreenshareAsContent(liveMeeting.layouts)) {
      Layouts.setScreenshareAsContent(liveMeeting.layouts, false)
      LayoutDAO.insertOrUpdate(liveMeeting.props.meetingProp.intId, liveMeeting.layouts)

      val fromUserId = findPresenter(liveMeeting.users2x)
        .map(_.intId)
        .getOrElse(ScreenshareModel.getUserId(liveMeeting.screenshareModel))
      ScreenshareAsContenthdlrHelper.sendSetScreenshareAsContentEvtMsg(fromUserId, liveMeeting, bus.outGW)
    }

    broadcastStopped(bus.outGW, liveMeeting)
  }
}
