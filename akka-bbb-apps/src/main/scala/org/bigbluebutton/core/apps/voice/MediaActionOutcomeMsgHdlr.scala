package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.common2.msgs.{ EjectUserFromVoiceConfRespMsg, UpdateLiveKitParticipantPermissionsRespMsg }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

/**
 * Outcomes the SFU reports for actions akka cannot confirm itself. For now,
 * only the VoiceUserReconciler cares about these.
 */
trait MediaActionOutcomeMsgHdlr {
  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleUpdateLiveKitParticipantPermissionsRespMsg(msg: UpdateLiveKitParticipantPermissionsRespMsg): Unit = {
    liveMeeting.voiceUserReconciler.onPermissionsOutcome(
      liveMeeting,
      msg.header.userId,
      msg.body.grant,
      msg.body.outcome
    )
  }

  def handleEjectUserFromVoiceConfRespMsg(msg: EjectUserFromVoiceConfRespMsg): Unit = {
    liveMeeting.voiceUserReconciler.onEjectOutcome(
      liveMeeting,
      msg.body.voiceUserId,
      msg.body.outcome
    )
  }
}
