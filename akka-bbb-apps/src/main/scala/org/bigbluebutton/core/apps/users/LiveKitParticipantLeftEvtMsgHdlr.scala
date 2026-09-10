package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.ScreenshareModel
import org.bigbluebutton.core.apps.screenshare.ScreenshareApp2x
import org.bigbluebutton.core.apps.webcam.CameraHdlrHelpers
import org.bigbluebutton.core.db.ScreenshareDAO
import org.bigbluebutton.core.models.{ Users2x, VoiceUsers, Webcams }
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait LiveKitParticipantLeftEvtMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleLiveKitParticipantLeftEvtMsg(msg: LiveKitParticipantLeftEvtMsg) {
    val meetingId = liveMeeting.props.meetingProp.intId
    val userId = msg.header.userId
    val roomName = msg.body.roomName
    val isPrimaryRoom = roomName == meetingId

    // Media cleanup below is primary-room-only; non-primary leaves are ignored
    // as they should not affect the user's voice state, webcam state, or presenter state.
    if (isPrimaryRoom) {
      val isPresenter = Users2x.isPresenter(userId, liveMeeting.users2x)

      // ACK for the reconciler. Primary-scoped: it tracks the user's own
      // meeting voice state, which a secondary-room leave must not touch.
      liveMeeting.voiceUserReconciler.forget(userId)

      for {
        vu <- VoiceUsers.findWIthIntId(liveMeeting.voiceUsers, userId)
      } yield {
        liveMeeting.audioFloorManager.handleUserLeftVoice(
          vu.intId,
          System.currentTimeMillis(),
          liveMeeting,
          outGW
        )
        VoiceUsers.removeWithIntId(liveMeeting.voiceUsers, meetingId, userId)
        val event = MsgBuilder.buildUserLeftVoiceConfToClientEvtMsg(
          meetingId, userId, liveMeeting.props.voiceProp.voiceConf, vu.voiceUserId
        )
        outGW.send(event)

        val eventUserVoiceStatus = MsgBuilder.buildUserVoiceStateEvtMsg(
          meetingId,
          liveMeeting.props.voiceProp.voiceConf,
          userId,
          None,
          leftVoiceConf = true
        )
        outGW.send(eventUserVoiceStatus)
      }

      Webcams.findWebcamsForUser(liveMeeting.webcams, userId) foreach { webcam =>
        CameraHdlrHelpers.stopBroadcastedCam(liveMeeting, meetingId, userId, webcam.streamId, outGW)
      }

      if (isPresenter && ScreenshareModel.isBroadcastingRTMP(liveMeeting.screenshareModel)) {
        ScreenshareDAO.updateStopped(
          meetingId,
          ScreenshareModel.getRTMPBroadcastingUrl(liveMeeting.screenshareModel)
        )
        ScreenshareApp2x.broadcastStopped(outGW, liveMeeting)
      }
    }
  }
}
