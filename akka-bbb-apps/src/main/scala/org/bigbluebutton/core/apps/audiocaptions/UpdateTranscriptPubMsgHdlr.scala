package org.bigbluebutton.core.apps.audiocaptions

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.models.AudioCaptions
import org.bigbluebutton.core.running.LiveMeeting

trait UpdateTranscriptPubMsgHdlr {
  this: AudioCaptionsApp2x =>

  def handle(msg: UpdateTranscriptPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    val meetingId = liveMeeting.props.meetingProp.intId

    def broadcastEvent(userId: String, transcript: String, locale: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, "nodeJSapp")
      val envelope = BbbCoreEnvelope(TranscriptUpdatedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(TranscriptUpdatedEvtMsg.NAME, meetingId, userId)
      val body = TranscriptUpdatedEvtMsgBody(transcript, locale)
      val event = TranscriptUpdatedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    if (AudioCaptions.isFloor(liveMeeting.audioCaptions, msg.header.userId)) {
      broadcastEvent(
        msg.header.userId,
        msg.body.transcript,
        msg.body.locale
      )
    }
  }
}
