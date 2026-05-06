package org.bigbluebutton.core.apps.screenshare

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.ScreenshareModel
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.ScreenshareDAO
import org.bigbluebutton.core.models.Screenshares
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.screenshare.ScreenshareApp2x.broadcastStopped

trait ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsgHdlr {
  this: ScreenshareApp2x =>

  def handle(msg: ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    val stream = msg.body.stream
    log.info("handleScreenshareRTMPBroadcastStoppedRequest: stream={}", stream)

    // Remove from the multi-share collection first.
    val removedEntry = Screenshares.remove(liveMeeting.screenshares, stream)
    log.info("Removed screenshare entry from collection: {}", removedEntry.isDefined)

    // Update the database record only for streams we were actually tracking.
    val singletonMatches = ScreenshareModel.getRTMPBroadcastingUrl(liveMeeting.screenshareModel) == stream
    if (removedEntry.isDefined || singletonMatches) {
      ScreenshareDAO.updateStopped(liveMeeting.props.meetingProp.intId, stream)
    }

    // If the stopped stream was the one tracked by the legacy singleton, clear it.
    // The singleton will reflect the next active stream if any, or remain cleared.
    if (singletonMatches) {
      broadcastStopped(bus.outGW, liveMeeting)
      // After clearing the singleton, prefer the share that occupies the content area for continuity.
      val remaining = Screenshares.findAll(liveMeeting.screenshares)
      val nextOpt = remaining.find(_.showAsContent).orElse(remaining.headOption)
      nextOpt.foreach { next =>
        ScreenshareModel.setRTMPBroadcastingUrl(liveMeeting.screenshareModel, next.stream)
        ScreenshareModel.broadcastingRTMPStarted(liveMeeting.screenshareModel)
        ScreenshareModel.setUserId(liveMeeting.screenshareModel, next.userId)
        ScreenshareModel.setVoiceConf(liveMeeting.screenshareModel, next.voiceConf)
        ScreenshareModel.setScreenshareConf(liveMeeting.screenshareModel, next.screenshareConf)
      }
    } else {
      // The stopped stream is not the singleton; send a targeted stop event without clearing the model.
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, "not-used"
      )
      val envelope = BbbCoreEnvelope(ScreenshareRtmpBroadcastStoppedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(
        ScreenshareRtmpBroadcastStoppedEvtMsg.NAME,
        liveMeeting.props.meetingProp.intId, "not-used"
      )
      val body = ScreenshareRtmpBroadcastStoppedEvtMsgBody(
        msg.body.voiceConf, msg.body.screenshareConf,
        removedEntry.map(_.userId).getOrElse(msg.body.userId),
        stream,
        msg.body.vidWidth, msg.body.vidHeight, msg.body.timestamp
      )
      bus.outGW.send(BbbCommonEnvCoreMsg(envelope, ScreenshareRtmpBroadcastStoppedEvtMsg(header, body)))
    }
  }
}
