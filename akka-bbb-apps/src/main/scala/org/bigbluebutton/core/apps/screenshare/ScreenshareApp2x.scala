package org.bigbluebutton.core.apps.screenshare

import org.apache.pekko.actor.ActorContext
import org.apache.pekko.event.Logging
import org.bigbluebutton.core.apps.ScreenshareModel
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder


object ScreenshareApp2x {
  def requestBroadcastStop(outGW: OutMsgRouter, liveMeeting: LiveMeeting): Unit = {
    if (ScreenshareModel.isBroadcastingRTMP(liveMeeting.screenshareModel)) {
      val event = MsgBuilder.buildScreenBroadcastStopSysMsg(
        liveMeeting.props.meetingProp.intId,
        ScreenshareModel.getVoiceConf(liveMeeting.screenshareModel),
        ScreenshareModel.getUserId(liveMeeting.screenshareModel),
        ScreenshareModel.getRTMPBroadcastingUrl(liveMeeting.screenshareModel),
      )

      outGW.send(event)
    }
  }

  def broadcastStopped(outGW: OutMsgRouter, liveMeeting: LiveMeeting): Unit = {
    if (ScreenshareModel.isBroadcastingRTMP(liveMeeting.screenshareModel)) {
      val voiceConf = ScreenshareModel.getVoiceConf(liveMeeting.screenshareModel)
      val screenShareConf = ScreenshareModel.getScreenshareConf(liveMeeting.screenshareModel)
      val ownerUserId = ScreenshareModel.getUserId(liveMeeting.screenshareModel)
      val url = ScreenshareModel.getRTMPBroadcastingUrl(liveMeeting.screenshareModel)
      val width = ScreenshareModel.getScreenshareVideoWidth(liveMeeting.screenshareModel)
      val height = ScreenshareModel.getScreenshareVideoHeight(liveMeeting.screenshareModel)
      val ts = ScreenshareModel.getTimestamp(liveMeeting.screenshareModel)

      ScreenshareModel.resetDesktopSharingParams(liveMeeting.screenshareModel)

      val event = MsgBuilder.buildStopScreenshareRtmpBroadcastEvtMsg(
        liveMeeting.props.meetingProp.intId,
        voiceConf,
        screenShareConf,
        ownerUserId,
        url,
        width,
        height,
        ts
      )
      outGW.send(event)
    }
  }
}

class ScreenshareApp2x(implicit val context: ActorContext)
  extends GetScreenshareStatusReqMsgHdlr
  with ScreenshareRtmpBroadcastStartedVoiceConfEvtMsgHdlr
  with ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsgHdlr {

  val log = Logging(context.system, getClass)

}
