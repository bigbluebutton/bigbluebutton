package org.bigbluebutton.core.apps.screenshare

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.layout.ScreenshareAsContenthdlrHelper
import org.bigbluebutton.core.apps.{ ExternalVideoModel, ScreenshareModel }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.{ LayoutDAO, ScreenshareDAO }
import org.bigbluebutton.core.models.{ Layouts, Screenshares, ScreenshareStream }
import org.bigbluebutton.core.models.Users2x.findPresenter
import org.bigbluebutton.core.running.LiveMeeting

trait ScreenshareRtmpBroadcastStartedVoiceConfEvtMsgHdlr {
  this: ScreenshareApp2x =>

  def handle(msg: ScreenshareRtmpBroadcastStartedVoiceConfEvtMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    def broadcastEvent(voiceConf: String, screenshareConf: String, userId: String, stream: String, vidWidth: Int, vidHeight: Int,
                       timestamp: String, hasAudio: Boolean, contentType: String, trackSid: Option[String] = None): BbbCommonEnvCoreMsg = {

      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, "not-used"
      )
      val envelope = BbbCoreEnvelope(ScreenshareRtmpBroadcastStartedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(
        ScreenshareRtmpBroadcastStartedEvtMsg.NAME,
        liveMeeting.props.meetingProp.intId, "not-used"
      )

      val body = ScreenshareRtmpBroadcastStartedEvtMsgBody(voiceConf, screenshareConf, userId,
        stream, vidWidth, vidHeight, timestamp, hasAudio, contentType, trackSid)
      val event = ScreenshareRtmpBroadcastStartedEvtMsg(header, body)
      BbbCommonEnvCoreMsg(envelope, event)
    }

    if (msg.body.contentType == "camera" && liveMeeting.props.meetingProp.disabledFeatures.contains("cameraAsContent")) {
      log.error(
        "Camera as a content is disabled for meeting {}, meetingID = {}",
        liveMeeting.props.meetingProp.name, liveMeeting.props.meetingProp.intId
      )
    } else if (msg.body.contentType == "screenshare" && liveMeeting.props.meetingProp.disabledFeatures.contains("screenshare")) {
      val meetingId = liveMeeting.props.meetingProp.intId
      log.error("Screen sharing is disabled for this meeting, meetingID = {}", meetingId)
    } else {
      val isLiveKit = liveMeeting.props.meetingProp.screenShareBridge == "livekit"

      if (isLiveKit) {
        // LiveKit multi-screenshare path
        val meetingId = liveMeeting.props.meetingProp.intId
        val userId = msg.body.userId
        val userScreenshareCap = liveMeeting.props.usersProp.userScreenshareCap
        val currentCount = Screenshares.userScreenshareCount(liveMeeting.screenshares, userId)

        if (userScreenshareCap > 0 && currentCount >= userScreenshareCap) {
          log.warning("User {} has reached screenshare cap ({}) in meeting {}", userId, userScreenshareCap, meetingId)
        } else {
          // Stop external video if it's running
          ExternalVideoModel.stop(bus.outGW, liveMeeting)

          val isPresenter = findPresenter(liveMeeting.users2x).exists(_.intId == userId)
          // Only show as content if presenter AND no other users already have active screenshares.
          // The second condition prevents a race where a new presenter's share arrives slightly
          // after AssignPresenterReqMsg and incorrectly overrides the just-reset layout flag.
          val otherUsersSharing = Screenshares.findAll(liveMeeting.screenshares).exists(_.userId != userId)
          val newEntry = ScreenshareStream(
            streamId = msg.body.stream,
            userId = userId,
            voiceConf = msg.body.voiceConf,
            screenshareConf = msg.body.screenshareConf,
            contentType = msg.body.contentType,
            vidWidth = msg.body.vidWidth,
            vidHeight = msg.body.vidHeight,
            hasAudio = msg.body.hasAudio,
            showAsContent = isPresenter && !otherUsersSharing,
            timestamp = msg.body.timestamp,
            trackSid = msg.body.trackSid
          )

          Screenshares.add(meetingId, liveMeeting.screenshares, newEntry)

          log.info("START broadcast (LiveKit) for stream={} user={} showAsContent={}", msg.body.stream, userId, newEntry.showAsContent)

          // Set layout flag when this is the first screenshare (no other users already sharing).
          // Skip when other users are already active — avoids re-enabling content area after
          // AssignPresenterReqMsgHdlr just reset the flag (race condition in presenter transfer).
          if (!otherUsersSharing && !Layouts.getScreenshareAsContent(liveMeeting.layouts)) {
            Layouts.setScreenshareAsContent(liveMeeting.layouts, true)
            LayoutDAO.insertOrUpdate(meetingId, liveMeeting.layouts)
            for {
              presenter <- findPresenter(liveMeeting.users2x)
            } yield {
              ScreenshareAsContenthdlrHelper.sendSetScreenshareAsContentEvtMsg(presenter.intId, liveMeeting, bus.outGW)
            }
          }

          val msgEvent = broadcastEvent(msg.body.voiceConf, msg.body.screenshareConf, userId, msg.body.stream,
            msg.body.vidWidth, msg.body.vidHeight, msg.body.timestamp, msg.body.hasAudio, msg.body.contentType,
            msg.body.trackSid)
          bus.outGW.send(msgEvent)
        }
      } else {
        // SFU path - keep existing singleton logic
        log.info("handleScreenshareRTMPBroadcastStartedRequest: isBroadcastingRTMP=" +
          ScreenshareModel.isBroadcastingRTMP(liveMeeting.screenshareModel) +
          " URL:" + ScreenshareModel.getRTMPBroadcastingUrl(liveMeeting.screenshareModel))

        // only valid if not broadcasting yet
        if (!ScreenshareModel.isBroadcastingRTMP(liveMeeting.screenshareModel)) {
          // Stop external video if it's running
          ExternalVideoModel.stop(bus.outGW, liveMeeting)

          ScreenshareModel.setRTMPBroadcastingUrl(liveMeeting.screenshareModel, msg.body.stream)
          ScreenshareModel.broadcastingRTMPStarted(liveMeeting.screenshareModel)
          ScreenshareModel.setScreenshareVideoWidth(liveMeeting.screenshareModel, msg.body.vidWidth)
          ScreenshareModel.setScreenshareVideoHeight(liveMeeting.screenshareModel, msg.body.vidHeight)
          ScreenshareModel.setVoiceConf(liveMeeting.screenshareModel, msg.body.voiceConf)
          ScreenshareModel.setScreenshareConf(liveMeeting.screenshareModel, msg.body.screenshareConf)
          ScreenshareModel.setTimestamp(liveMeeting.screenshareModel, msg.body.timestamp)
          ScreenshareModel.setHasAudio(liveMeeting.screenshareModel, msg.body.hasAudio)
          ScreenshareModel.setContentType(liveMeeting.screenshareModel, msg.body.contentType)
          ScreenshareModel.setUserId(liveMeeting.screenshareModel, msg.body.userId)

          log.info("START broadcast ALLOWED when isBroadcastingRTMP=false")

          ScreenshareDAO.insert(liveMeeting.props.meetingProp.intId, liveMeeting.screenshareModel)
          if (!Layouts.getScreenshareAsContent(liveMeeting.layouts)) {
            Layouts.setScreenshareAsContent(liveMeeting.layouts, true)
            LayoutDAO.insertOrUpdate(liveMeeting.props.meetingProp.intId, liveMeeting.layouts)
            for {
              presenter <- findPresenter(liveMeeting.users2x)
            } yield {
              ScreenshareAsContenthdlrHelper.sendSetScreenshareAsContentEvtMsg(presenter.intId, liveMeeting, bus.outGW)
            }
          }

          // Notify viewers in the meeting that there's an rtmp stream to view
          val msgEvent = broadcastEvent(msg.body.voiceConf, msg.body.screenshareConf, msg.body.userId, msg.body.stream,
            msg.body.vidWidth, msg.body.vidHeight, msg.body.timestamp, msg.body.hasAudio, msg.body.contentType)
          bus.outGW.send(msgEvent)
        } else {
          log.info("START broadcast NOT ALLOWED when isBroadcastingRTMP=true")
        }
      }
    }
  }

}
