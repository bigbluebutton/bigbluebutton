package org.bigbluebutton.core.apps.caption

import org.apache.pekko.actor.ActorContext
import org.apache.pekko.event.Logging
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.db.{ CaptionDAO, CaptionLocaleDAO, CaptionTypes }

class CaptionApp2x(implicit val context: ActorContext) extends RightsManagementTrait {
  val log = Logging(context.system, getClass)

  def getCaptionHistory(liveMeeting: LiveMeeting): Map[String, TranscriptVO] = {
    liveMeeting.captionModel.getHistory()
  }

  def editCaptionHistory(liveMeeting: LiveMeeting, userId: String, startIndex: Integer, endIndex: Integer, name: String, text: String): Boolean = {
    liveMeeting.captionModel.editHistory(userId, startIndex, endIndex, name, text)
  }

  def isUserCaptionOwner(liveMeeting: LiveMeeting, userId: String, name: String): Boolean = {
    liveMeeting.captionModel.isUserCaptionOwner(userId, name)
  }

  def handle(msg: EditCaptionHistoryPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    def broadcastEvent(msg: EditCaptionHistoryPubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, msg.header.userId
      )
      val envelope = BbbCoreEnvelope(EditCaptionHistoryEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(EditCaptionHistoryEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = EditCaptionHistoryEvtMsgBody(msg.body.startIndex, msg.body.endIndex, msg.body.name, msg.body.locale, msg.body.text)
      val event = EditCaptionHistoryEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)
      && isUserCaptionOwner(liveMeeting, msg.header.userId, msg.body.name)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to edit caption history in meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      val successfulEdit = editCaptionHistory(liveMeeting, msg.header.userId, msg.body.startIndex,
        msg.body.endIndex, msg.body.name, msg.body.text)
      if (successfulEdit) {
        broadcastEvent(msg)
      }
    }
  }
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
  def handle(msg: SendCaptionHistoryReqMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    def broadcastEvent(msg: SendCaptionHistoryReqMsg, history: Map[String, TranscriptVO]): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(SendCaptionHistoryRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(SendCaptionHistoryRespMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = SendCaptionHistoryRespMsgBody(history)
      val event = SendCaptionHistoryRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    broadcastEvent(msg, getCaptionHistory(liveMeeting))
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
