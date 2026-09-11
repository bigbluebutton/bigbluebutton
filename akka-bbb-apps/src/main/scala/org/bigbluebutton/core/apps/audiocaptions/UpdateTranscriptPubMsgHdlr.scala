package org.bigbluebutton.core.apps.audiocaptions

import org.bigbluebutton.ClientSettings.getConfigPropertyValueByPathAsIntOrElse
import org.bigbluebutton.LockSettingsUtil
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.CaptionDAO
import org.bigbluebutton.core.models.{ AudioCaptions, Users2x, VoiceUsers }
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.util.LocaleUtil

trait UpdateTranscriptPubMsgHdlr {
  this: AudioCaptionsApp2x =>

  def handle(msg: UpdateTranscriptPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    val meetingId = liveMeeting.props.meetingProp.intId

    def broadcastEvent(userId: String, transcriptId: String, transcript: String, locale: String, result: Boolean): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
      val envelope = BbbCoreEnvelope(TranscriptUpdatedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(TranscriptUpdatedEvtMsg.NAME, meetingId, userId)
      val body = TranscriptUpdatedEvtMsgBody(transcriptId, transcript, locale, result)
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
    val maxTextLength = getConfigPropertyValueByPathAsIntOrElse(liveMeeting.clientSettings, "public.captions.maxTextLength", 8192)

    if (!isTranscriptionEnabled) {
      log.debug("Ignoring transcript from user {} in meeting {}: liveTranscription is disabled", msg.header.userId, meetingId)
    } else if (!LocaleUtil.isValidLocale(msg.body.locale)) {
      log.warning("Ignoring transcript from user {} in meeting {}: invalid locale '{}'", msg.header.userId, meetingId, msg.body.locale)
    } else if (!LocaleUtil.isValidCaptionId(msg.body.transcriptId)) {
      log.warning("Ignoring transcript from user {} in meeting {}: invalid transcriptId", msg.header.userId, meetingId)
    } else if (msg.body.transcript.length > maxTextLength || msg.body.text.length > maxTextLength) {
      log.warning(
        "Ignoring transcript from user {} in meeting {}: length {} exceeds {}",
        msg.header.userId, meetingId, msg.body.transcript.length, maxTextLength
      )
    } else {
      // The lookups stay in the for-comprehension, but the decisions do not: a
      // guard that fails here yields None with no log, which is precisely what
      // made the previous muted guard invisible in production.
      for {
        user <- Users2x.findWithIntId(liveMeeting.users2x, msg.header.userId)
        voiceUser <- VoiceUsers.findWithIntId(liveMeeting.voiceUsers, msg.header.userId)
      } yield {
        if (voiceUser.listenOnly) {
          log.debug(
            "Ignoring transcript from user {} in meeting {}: user is listen-only",
            msg.header.userId, meetingId
          )
        } else if (applyPermissionCheck && LockSettingsUtil.isMicrophoneSharingLocked(user, liveMeeting)) {
          // Automatic captions are a transcript of the user's microphone, so a
          // user barred from the microphone has nothing legitimate to
          // transcribe. This is the moderator control for caption submission.
          log.warning(
            "Ignoring transcript from user {} in meeting {}: microphone sharing is locked",
            msg.header.userId, meetingId
          )
        } else {
          AudioCaptions.editTranscript(
            liveMeeting.audioCaptions,
            msg.header.userId,
            msg.body.transcriptId,
            msg.body.start,
            msg.body.end,
            msg.body.text,
            msg.body.transcript,
            msg.body.locale
          ) match {
            case Some((start, end, text)) =>
              editTranscript(
                msg.header.userId,
                start,
                end,
                msg.body.locale,
                text
              )

              val transcript = AudioCaptions.parseTranscript(msg.body.transcript)

              CaptionDAO.insertOrUpdateCaption(msg.body.transcriptId, meetingId, msg.header.userId, transcript, msg.body.locale)

              broadcastEvent(
                msg.header.userId,
                msg.body.transcriptId,
                transcript,
                msg.body.locale,
                msg.body.result,
              )
            case None =>
              log.warning(
                "Ignoring transcript from user {} in meeting {}: locale limit reached for locale '{}'",
                msg.header.userId, meetingId, msg.body.locale
              )
          }
        }
      }
    }
  }
}
