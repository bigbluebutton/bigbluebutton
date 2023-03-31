package org.bigbluebutton.core.apps.audiocaptions

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.models.AudioCaptions
import org.bigbluebutton.core.running.LiveMeeting

trait UpdateTranscriptPubMsgHdlr {
  this: AudioCaptionsApp2x =>

  def handle(msg: UpdateTranscriptPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    val meetingId = liveMeeting.props.meetingProp.intId

    def broadcastEvent(userId: String, transcriptId: String, transcript: String, locale: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, "nodeJSapp")
      val envelope = BbbCoreEnvelope(TranscriptUpdatedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(TranscriptUpdatedEvtMsg.NAME, meetingId, userId)
      val body = TranscriptUpdatedEvtMsgBody(transcriptId, transcript, locale)
      val event = TranscriptUpdatedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    // Adapt to the current captions' recording process
    def editTranscript(
        userId: String,
        start:  Int,
        end:    Int,
        locale: String,
        text:   String
    ): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
      val envelope = BbbCoreEnvelope(EditCaptionHistoryEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(EditCaptionHistoryEvtMsg.NAME, meetingId, userId)
      val body = EditCaptionHistoryEvtMsgBody(start, end, locale, locale, text)
      val event = EditCaptionHistoryEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    val isTranscriptionEnabled = !liveMeeting.props.meetingProp.disabledFeatures.contains("liveTranscription")

    if (AudioCaptions.isFloor(liveMeeting.audioCaptions, msg.header.userId) && isTranscriptionEnabled) {
      val (start, end, text) = AudioCaptions.editTranscript(
        liveMeeting.audioCaptions,
        msg.body.transcriptId,
        msg.body.start,
        msg.body.end,
        msg.body.text,
        msg.body.transcript,
        msg.body.locale
      )

      editTranscript(
        msg.header.userId,
        start,
        end,
        msg.body.locale,
        text
      )

      val transcript = AudioCaptions.parseTranscript(msg.body.transcript)

      broadcastEvent(
        msg.header.userId,
        msg.body.transcriptId,
        transcript,
        msg.body.locale
      )
    }
  }
}
