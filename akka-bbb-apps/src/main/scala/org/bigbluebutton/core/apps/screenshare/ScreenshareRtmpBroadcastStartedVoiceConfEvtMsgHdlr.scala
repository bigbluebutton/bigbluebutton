package org.bigbluebutton.core.apps.screenshare

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.layout.ScreenshareAsContenthdlrHelper
import org.bigbluebutton.core.apps.{ ExternalVideoModel, ScreenshareModel }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.{ LayoutDAO, ScreenshareDAO }
import org.bigbluebutton.core.models.{ Layouts, Screenshares, ScreenshareEntry, Users2x, Roles }
import org.bigbluebutton.core.models.Users2x.findPresenter
import org.bigbluebutton.core.running.LiveMeeting

trait ScreenshareRtmpBroadcastStartedVoiceConfEvtMsgHdlr {
  this: ScreenshareApp2x =>

  def handle(msg: ScreenshareRtmpBroadcastStartedVoiceConfEvtMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    def broadcastEvent(voiceConf: String, screenshareConf: String, userId: String, stream: String, vidWidth: Int, vidHeight: Int,
                       timestamp: String, hasAudio: Boolean, contentType: String): BbbCommonEnvCoreMsg = {

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
        stream, vidWidth, vidHeight, timestamp, hasAudio, contentType)
      val event = ScreenshareRtmpBroadcastStartedEvtMsg(header, body)
      BbbCommonEnvCoreMsg(envelope, event)
    }

    log.info(
      "handleScreenshareRTMPBroadcastStartedRequest: stream={} userId={}",
      msg.body.stream, msg.body.userId
    )

    if (msg.body.contentType == "camera" && liveMeeting.props.meetingProp.disabledFeatures.contains("cameraAsContent")) {
      log.error(
        "Camera as a content is disabled for meeting {}, meetingID = {}",
        liveMeeting.props.meetingProp.name, liveMeeting.props.meetingProp.intId
      )
    } else if (msg.body.contentType == "screenshare" && liveMeeting.props.meetingProp.disabledFeatures.contains("screenshare")) {
      val meetingId = liveMeeting.props.meetingProp.intId
      log.error("Screen sharing is disabled for this meeting, meetingID = {}", meetingId)
    } else {
      // Determine whether this broadcaster is the presenter or a moderator.
      val broadcasterIsPresenterOrMod = Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId)
        .exists(u => u.presenter || u.role == Roles.MODERATOR_ROLE)

      // showAsContent=true only when no other share already occupies the content area AND this user
      // is the presenter or moderator.  Non-presenter viewer shares always go to the camera dock.
      val alreadyHasContent = Screenshares.findAll(liveMeeting.screenshares).exists(_.showAsContent) ||
        ScreenshareModel.isBroadcastingRTMP(liveMeeting.screenshareModel)
      val showAsContent = broadcasterIsPresenterOrMod && !alreadyHasContent

      // Register in the multi-share collection (keyed by stream URL).
      val entry = ScreenshareEntry(
        screenshareId = msg.body.stream,
        userId = msg.body.userId,
        stream = msg.body.stream,
        voiceConf = msg.body.voiceConf,
        screenshareConf = msg.body.screenshareConf,
        vidWidth = msg.body.vidWidth,
        vidHeight = msg.body.vidHeight,
        hasAudio = msg.body.hasAudio,
        contentType = msg.body.contentType,
        showAsContent = showAsContent,
        startedAt = System.currentTimeMillis()
      )
      Screenshares.add(liveMeeting.screenshares, entry)

      // Keep the legacy singleton model in sync for backward compatibility with existing consumers
      // that still reference liveMeeting.screenshareModel (subscribe permission handler, broadcastStopped).
      if (!ScreenshareModel.isBroadcastingRTMP(liveMeeting.screenshareModel)) {
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
      }

      // When a presenter/mod share takes the content area, stop external video if running.
      if (showAsContent) {
        ExternalVideoModel.stop(bus.outGW, liveMeeting)
        if (!Layouts.getScreenshareAsContent(liveMeeting.layouts)) {
          Layouts.setScreenshareAsContent(liveMeeting.layouts, true)
          LayoutDAO.insertOrUpdate(liveMeeting.props.meetingProp.intId, liveMeeting.layouts)
          for {
            presenter <- findPresenter(liveMeeting.users2x)
          } yield {
            ScreenshareAsContenthdlrHelper.sendSetScreenshareAsContentEvtMsg(presenter.intId, liveMeeting, bus.outGW)
          }
        }
      }

      log.info(
        "START broadcast ALLOWED: userId={} stream={} showAsContent={}",
        msg.body.userId, msg.body.stream, showAsContent
      )

      ScreenshareDAO.insert(liveMeeting.props.meetingProp.intId, msg.body.userId, liveMeeting.screenshareModel, showAsContent)

      // Notify all participants in the meeting.
      val msgEvent = broadcastEvent(msg.body.voiceConf, msg.body.screenshareConf, msg.body.userId, msg.body.stream,
        msg.body.vidWidth, msg.body.vidHeight, msg.body.timestamp, msg.body.hasAudio, msg.body.contentType)
      bus.outGW.send(msgEvent)
    }
  }

}
