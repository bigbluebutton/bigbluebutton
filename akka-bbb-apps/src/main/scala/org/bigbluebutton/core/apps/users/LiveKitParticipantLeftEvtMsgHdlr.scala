package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.models.{ VoiceUsers, Users2x }
import org.bigbluebutton.core2.message.senders.MsgBuilder
import org.bigbluebutton.core.models.Webcams
import org.bigbluebutton.core.apps.webcam.CameraHdlrHelpers
import org.bigbluebutton.core.apps.ScreenshareModel
import org.bigbluebutton.core.db.ScreenshareDAO
import org.bigbluebutton.core.apps.screenshare.ScreenshareApp2x

trait LiveKitParticipantLeftEvtMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleLiveKitParticipantLeftEvtMsg(msg: LiveKitParticipantLeftEvtMsg) {
    val meetingId = liveMeeting.props.meetingProp.intId
    val userId = msg.header.userId
    val isPresenter = Users2x.isPresenter(userId, liveMeeting.users2x)

    // Clean up any voice users associated with the user
    for {
      vu <- VoiceUsers.findWIthIntId(liveMeeting.voiceUsers, userId)
    } yield {
      VoiceUsers.removeWithIntId(
        liveMeeting.voiceUsers,
        meetingId,
        userId
      )
      val event = MsgBuilder.buildUserLeftVoiceConfToClientEvtMsg(
        meetingId,
        userId,
        liveMeeting.props.voiceProp.voiceConf,
        vu.voiceUserId
      )
      outGW.send(event)
    }

    // Clean up any webcams associated with the user
    Webcams.findWebcamsForUser(liveMeeting.webcams, userId) foreach { webcam =>
      CameraHdlrHelpers.stopBroadcastedCam(
        liveMeeting,
        meetingId,
        userId,
        webcam.streamId,
        outGW
      )
    }

    // Clean up any screenshare associated with the user
    if (isPresenter && ScreenshareModel.isBroadcastingRTMP(liveMeeting.screenshareModel)) {
      ScreenshareDAO.updateStopped(
        meetingId,
        ScreenshareModel.getRTMPBroadcastingUrl(liveMeeting.screenshareModel)
      )
      ScreenshareApp2x.broadcastStopped(outGW, liveMeeting)
    }
  }
}
