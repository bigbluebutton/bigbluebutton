package org.bigbluebutton.core.apps.caption

import org.apache.pekko.actor.ActorContext
import org.apache.pekko.event.Logging
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.{ CaptionDAO, CaptionLocaleDAO, CaptionTypes }
import org.bigbluebutton.core.running.LiveMeeting

class CaptionApp2x(implicit val context: ActorContext) extends RightsManagementTrait {
  val log = Logging(context.system, getClass)

  def handle(msg: CaptionSubmitTranscriptPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    val meetingId = liveMeeting.props.meetingProp.intId
    def broadcastSuccessEvent(transcriptId: String, transcript: String, locale: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(CaptionSubmitTranscriptEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(CaptionSubmitTranscriptEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = CaptionSubmitTranscriptEvtMsgBody(transcriptId, transcript, locale, msg.body.captionType)
      val event = CaptionSubmitTranscriptEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }
    CaptionDAO.insertOrUpdateCaption(msg.body.transcriptId, meetingId, msg.header.userId,
      msg.body.transcript, msg.body.locale, msg.body.captionType)

    broadcastSuccessEvent(msg.body.transcriptId, msg.body.transcript, msg.body.locale)
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
    } else {
      broadcastAddCaptionLocaleEvent(msg.body.locale, msg.header.userId)
    }
  }
}
