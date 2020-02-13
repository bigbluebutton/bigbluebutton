package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.common2.msgs.{ BbbClientMsgHeader, BbbCommonEnvCoreMsg, BbbCoreEnvelope, MessageTypes, Routing, VoiceCallStateEvtMsg, VoiceCallStateEvtMsgBody, VoiceConfCallStateEvtMsg }
import org.bigbluebutton.core.models.{ VoiceUserState, VoiceUsers }
import org.bigbluebutton.core.running.{ LiveMeeting, MeetingActor, OutMsgRouter }

trait VoiceConfCallStateEvtMsgHdlr {
  this: MeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleVoiceConfCallStateEvtMsg(msg: VoiceConfCallStateEvtMsg): Unit = {
    val routing = Routing.addMsgToClientRouting(
      MessageTypes.BROADCAST_TO_MEETING,
      liveMeeting.props.meetingProp.intId,
      msg.body.voiceConf
    )
    val envelope = BbbCoreEnvelope(
      VoiceCallStateEvtMsg.NAME,
      routing
    )
    val header = BbbClientMsgHeader(
      VoiceCallStateEvtMsg.NAME,
      liveMeeting.props.meetingProp.intId,
      msg.body.voiceConf
    )

    val body = VoiceCallStateEvtMsgBody(
      meetingId = liveMeeting.props.meetingProp.intId,
      voiceConf = msg.body.voiceConf,
      clientSession = msg.body.clientSession,
      userId = msg.body.userId,
      callerName = msg.body.callerName,
      callState = msg.body.callState
    )

    val event = VoiceCallStateEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    outGW.send(msgEvent)
  }
}
