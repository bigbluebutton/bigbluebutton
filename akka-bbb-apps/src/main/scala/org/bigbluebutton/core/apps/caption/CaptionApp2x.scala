package org.bigbluebutton.core.apps.caption

import org.apache.pekko.actor.ActorContext
import org.apache.pekko.event.Logging
import org.bigbluebutton.ClientSettings.getConfigPropertyValueByPathAsIntOrElse
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.db.{ CaptionDAO, CaptionLocaleDAO, CaptionTypes }
import org.bigbluebutton.core.util.LocaleUtil

class CaptionApp2x(implicit val context: ActorContext) extends RightsManagementTrait {
  val log = Logging(context.system, getClass)

  def handle(msg: CaptionSubmitTranscriptPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    val meetingId = liveMeeting.props.meetingProp.intId
    val validCaptionTypes = Set(CaptionTypes.TYPED, CaptionTypes.AUDIO_TRANSCRIPTION)
    val maxTextLength = getConfigPropertyValueByPathAsIntOrElse(liveMeeting.clientSettings, "public.captions.maxTextLength", 8192)

    def broadcastSuccessEvent(transcriptId: String, transcript: String, locale: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(CaptionSubmitTranscriptEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(CaptionSubmitTranscriptEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = CaptionSubmitTranscriptEvtMsgBody(transcriptId, transcript, locale, msg.body.captionType)
      val event = CaptionSubmitTranscriptEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val reason = "No permission to submit caption transcript."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else if (!validCaptionTypes.contains(msg.body.captionType)) {
      log.warning("Invalid captionType '{}' from user {} in meeting {}", msg.body.captionType, msg.header.userId, meetingId)
    } else if (!LocaleUtil.isValidLocale(msg.body.locale)) {
      log.warning("Invalid locale '{}' from user {} in meeting {}", msg.body.locale, msg.header.userId, meetingId)
    } else if (!LocaleUtil.isValidCaptionId(msg.body.transcriptId)) {
      log.warning("Invalid transcriptId from user {} in meeting {}", msg.header.userId, meetingId)
    } else if (msg.body.transcript.length > maxTextLength) {
      log.warning(
        "Ignoring caption transcript from user {} in meeting {}: length {} exceeds {}",
        msg.header.userId, meetingId, msg.body.transcript.length, maxTextLength
      )
    } else {
      CaptionDAO.insertOrUpdateCaption(msg.body.transcriptId, meetingId, msg.header.userId,
        msg.body.transcript, msg.body.locale, msg.body.captionType)

      broadcastSuccessEvent(msg.body.transcriptId, msg.body.transcript, msg.body.locale)
    }
  }

  def handle(msg: AddCaptionLocalePubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    def broadcastAddCaptionLocaleEvent(locale: String, userId: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, userId)
      val envelope = BbbCoreEnvelope(AddCaptionLocaleEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(AddCaptionLocaleEvtMsg.NAME, liveMeeting.props.meetingProp.intId, userId)

      val body = AddCaptionLocaleEvtMsgBody(locale)
      val event = AddCaptionLocaleEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
      CaptionLocaleDAO.insertOrUpdateCaptionLocale(liveMeeting.props.meetingProp.intId, locale, CaptionTypes.TYPED, userId)
    }

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to add caption locale."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else if (!LocaleUtil.isValidLocale(msg.body.locale)) {
      log.warning(
        "Invalid locale '{}' from user {} in meeting {}",
        msg.body.locale, msg.header.userId, liveMeeting.props.meetingProp.intId
      )
    } else {
      broadcastAddCaptionLocaleEvent(msg.body.locale, msg.header.userId)
    }
  }
}
