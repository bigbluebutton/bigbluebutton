package org.bigbluebutton.core.apps.audiocaptions

import org.bigbluebutton.ClientSettings.getConfigPropertyValueByPathAsStringOrElse
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.CaptionDAO
import org.bigbluebutton.core.models.{AudioCaptions, UserState, Pads, Users2x}
import org.bigbluebutton.core.running.LiveMeeting
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

trait UpdateTranscriptPubMsgHdlr {
  this: AudioCaptionsApp2x =>

  def handle(msg: UpdateTranscriptPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    val meetingId = liveMeeting.props.meetingProp.intId

    def broadcastEvent(userId: String, transcriptId: String, transcript: String, locale: String, result: Boolean): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, "nodeJSapp")
      val envelope = BbbCoreEnvelope(TranscriptUpdatedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(TranscriptUpdatedEvtMsg.NAME, meetingId, userId)
      val body = TranscriptUpdatedEvtMsgBody(transcriptId, transcript, locale, result)
      val event = TranscriptUpdatedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    def sendPadUpdateCmdMsg(groupId: String, defaultPad: String, text: String, transcript: Boolean): Unit = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(PadUpdateCmdMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(PadUpdateCmdMsg.NAME, liveMeeting.props.meetingProp.intId)
      val body = PadUpdateCmdMsgBody(groupId, defaultPad, text)
      val event = PadUpdateCmdMsg(header, body)
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


      for {
        u <- Users2x.findWithIntId(liveMeeting.users2x, msg.header.userId)
      } yield {
        CaptionDAO.insertOrUpdateCaption(msg.body.transcriptId, meetingId, msg.header.userId, transcript, u.speechLocale)
      }

      broadcastEvent(
        msg.header.userId,
        msg.body.transcriptId,
        transcript,
        msg.body.locale,
        msg.body.result,
      )

      if(msg.body.result) {
        val userName = Users2x.findWithIntId(liveMeeting.users2x, msg.header.userId).get match {
          case u: UserState => u.name
          case _ => "???"
        }

        val now = LocalDateTime.now()
        val formatter = DateTimeFormatter.ofPattern("HH:mm:ss")
        val formattedTime = now.format(formatter)

        val userSpoke = s"\n $userName ($formattedTime): $transcript"

        val defaultPad = getConfigPropertyValueByPathAsStringOrElse(
          liveMeeting.clientSettings,
          "public.captions.defaultPad",
          alternativeValue = ""
        )

        Pads.getGroup(liveMeeting.pads, defaultPad) match {
          case Some(group) => sendPadUpdateCmdMsg(group.groupId, defaultPad, userSpoke, transcript = true)
          case _ =>
        }
      }

    }
  }
}
