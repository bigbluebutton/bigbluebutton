package org.bigbluebutton.core.apps.audiocaptions

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.CaptionDAO
import org.bigbluebutton.core.models.{Users2x, VoiceUsers}
import org.bigbluebutton.core.running.LiveMeeting
import java.util.{IllformedLocaleException, Locale}

private[audiocaptions] object CaptionLocale {
  // Keep caption_<locale>.vtt within the 255-byte Linux filename limit.
  private val MaxLength = 255 - "caption_".length - ".vtt".length
  private val SafeCharacters = "^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$".r

  def isValid(locale: String): Boolean = {
    if (locale == null || locale.length > MaxLength || !SafeCharacters.pattern.matcher(locale).matches()) {
      false
    } else {
      try {
        new Locale.Builder().setLanguageTag(locale).build().toLanguageTag == locale
      } catch {
        case _: IllformedLocaleException => false
      }
    }
  }
}

trait UpdateTranscriptPubMsgHdlr {
  this: AudioCaptionsApp2x =>

  def handle(msg: UpdateTranscriptPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    val meetingId = liveMeeting.props.meetingProp.intId

    // Keeps the speaker's client in sync and, through the recorder, becomes the
    // CaptionUpdatedEvent of the recording: one segment per transcriptId, whole text.
    def broadcastEvent(userId: String, transcriptId: String, transcript: String, locale: String, result: Boolean): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
      val envelope = BbbCoreEnvelope(TranscriptUpdatedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(TranscriptUpdatedEvtMsg.NAME, meetingId, userId)
      val body = TranscriptUpdatedEvtMsgBody(transcriptId, transcript, locale, result)
      val event = TranscriptUpdatedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    val isTranscriptionEnabled = !liveMeeting.props.meetingProp.disabledFeatures.contains("liveTranscription")

    if (!CaptionLocale.isValid(msg.body.locale)) {
      context.system.log.warning(
        "Ignoring transcript with an invalid locale from user {} in meeting {}",
        msg.header.userId,
        meetingId
      )
    } else if (isTranscriptionEnabled) {
      for {
        u <- Users2x.findWithIntId(liveMeeting.users2x, msg.header.userId)
        voiceUser <- VoiceUsers.findWithIntId(liveMeeting.voiceUsers, msg.header.userId)
        if !voiceUser.listenOnly
      } yield {
        CaptionDAO.insertOrUpdateCaption(msg.body.transcriptId, meetingId, msg.header.userId, msg.body.transcript, msg.body.locale)

        broadcastEvent(
          msg.header.userId,
          msg.body.transcriptId,
          msg.body.transcript,
          msg.body.locale,
          msg.body.result,
        )
      }
    }
  }
}
