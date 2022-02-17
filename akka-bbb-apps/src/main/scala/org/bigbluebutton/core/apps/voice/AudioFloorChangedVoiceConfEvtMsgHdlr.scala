package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ VoiceUserState, VoiceUsers }
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }

trait AudioFloorChangedVoiceConfEvtMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleAudioFloorChangedVoiceConfEvtMsg(msg: AudioFloorChangedVoiceConfEvtMsg): Unit = {

    def broadcastEvent(vu: VoiceUserState): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId,
        vu.intId
      )
      val envelope = BbbCoreEnvelope(AudioFloorChangedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(
        AudioFloorChangedEvtMsg.NAME,
        liveMeeting.props.meetingProp.intId, vu.intId
      )

      val body = AudioFloorChangedEvtMsgBody(
        voiceConf = msg.header.voiceConf,
        intId = vu.intId,
        voiceUserId = vu.voiceUserId,
        floor = vu.floor,
        lastFloorTime = msg.body.floorTimestamp
      )

      val event = AudioFloorChangedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    for {
      oldFloorUser <- VoiceUsers.releasedFloor(
        liveMeeting.voiceUsers,
        msg.body.oldVoiceUserId,
        floor = false
      )
    } yield {
      broadcastEvent(oldFloorUser)
    }

    for {
      newFloorUser <- VoiceUsers.becameFloor(
        liveMeeting.voiceUsers,
        msg.body.voiceUserId,
        true,
        msg.body.floorTimestamp
      )
    } yield {
      broadcastEvent(newFloorUser)
    }
  }
}
