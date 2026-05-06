package org.bigbluebutton.core.apps.screenshare

import org.apache.pekko.actor.ActorContext
import org.apache.pekko.event.Logging
import org.bigbluebutton.core.apps.ScreenshareModel
import org.bigbluebutton.core.models.{ Screenshares, Roles, Users2x }
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

  /** Stop all active screenshares belonging to locked viewers.
   *  Called when disableMultiScreenshare is activated by a moderator. */
  def enforceScreenshareLockSettingsForAllViewers(outGW: OutMsgRouter, liveMeeting: LiveMeeting): Unit = {
    val allShares = Screenshares.findAll(liveMeeting.screenshares)
    allShares.foreach { entry =>
      val isViewer = Users2x.findWithIntId(liveMeeting.users2x, entry.userId)
        .exists(u => u.role == Roles.VIEWER_ROLE)
      if (isViewer) {
        val event = MsgBuilder.buildScreenBroadcastStopSysMsg(
          liveMeeting.props.meetingProp.intId,
          entry.voiceConf,
          entry.userId,
          entry.stream
        )
        outGW.send(event)
      }
    }
    // Also stop the singleton if it belongs to a viewer.
    if (ScreenshareModel.isBroadcastingRTMP(liveMeeting.screenshareModel)) {
      val singletonUserId = ScreenshareModel.getUserId(liveMeeting.screenshareModel)
      val singletonNotInCollection = !Screenshares.hasStream(
        liveMeeting.screenshares, ScreenshareModel.getRTMPBroadcastingUrl(liveMeeting.screenshareModel))
      if (singletonNotInCollection) {
        val isViewer = Users2x.findWithIntId(liveMeeting.users2x, singletonUserId)
          .exists(u => u.role == Roles.VIEWER_ROLE)
        if (isViewer) {
          val event = MsgBuilder.buildScreenBroadcastStopSysMsg(
            liveMeeting.props.meetingProp.intId,
            ScreenshareModel.getVoiceConf(liveMeeting.screenshareModel),
            singletonUserId,
            ScreenshareModel.getRTMPBroadcastingUrl(liveMeeting.screenshareModel)
          )
          outGW.send(event)
        }
      }
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
  with ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsgHdlr
  with SetScreenshareShowAsContentReqMsgHdlr {

  val log = Logging(context.system, getClass)

}
