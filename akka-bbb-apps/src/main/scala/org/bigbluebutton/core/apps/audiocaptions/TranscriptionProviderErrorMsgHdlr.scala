package org.bigbluebutton.core.apps.audiocaptions

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.models.AudioCaptions
import org.bigbluebutton.core.running.LiveMeeting

trait TranscriptionProviderErrorMsgHdlr {
  this: AudioCaptionsApp2x =>

  def handleTranscriptionProviderErrorMsg(msg: TranscriptionProviderErrorMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    val meetingId = liveMeeting.props.meetingProp.intId

    def broadcastEvent(userId: String, errorCode: String, errorMessage: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, "nodeJSapp")
      val envelope = BbbCoreEnvelope(TranscriptionProviderErrorEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(TranscriptionProviderErrorEvtMsg.NAME, meetingId, userId)
      val body = TranscriptionProviderErrorEvtMsgBody(errorCode, errorMessage)
      val event = TranscriptionProviderErrorEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    broadcastEvent(msg.header.userId, msg.body.errorCode, msg.body.errorMessage)
  }
}
