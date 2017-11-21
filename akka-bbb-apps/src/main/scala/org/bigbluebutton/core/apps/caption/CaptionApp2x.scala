package org.bigbluebutton.core.apps.caption

import akka.actor.ActorContext
import akka.event.Logging
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.{ LiveMeeting }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

class CaptionApp2x(implicit val context: ActorContext) extends RightsManagementTrait {
  val log = Logging(context.system, getClass)

  def getCaptionHistory(liveMeeting: LiveMeeting): Map[String, TranscriptVO] = {
    liveMeeting.captionModel.getHistory()
  }

  def updateCaptionOwner(liveMeeting: LiveMeeting, locale: String, localeCode: String, userId: String): Map[String, TranscriptVO] = {
    liveMeeting.captionModel.updateTranscriptOwner(locale, localeCode, userId)
  }

  def editCaptionHistory(liveMeeting: LiveMeeting, userId: String, startIndex: Integer, endIndex: Integer, locale: String, text: String): Boolean = {
    liveMeeting.captionModel.editHistory(userId, startIndex, endIndex, locale, text)
  }

  def checkCaptionOwnerLogOut(liveMeeting: LiveMeeting, userId: String): Option[(String, TranscriptVO)] = {
    liveMeeting.captionModel.checkCaptionOwnerLogOut(userId)
  }

  def isUserCaptionOwner(liveMeeting: LiveMeeting, userId: String, locale: String): Boolean = {
    liveMeeting.captionModel.isUserCaptionOwner(userId, locale)
  }

  def handle(msg: EditCaptionHistoryPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    def broadcastEvent(msg: EditCaptionHistoryPubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, msg.header.userId
      )
      val envelope = BbbCoreEnvelope(EditCaptionHistoryEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(EditCaptionHistoryEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = EditCaptionHistoryEvtMsgBody(msg.body.startIndex, msg.body.endIndex, msg.body.locale, msg.body.localeCode, msg.body.text)
      val event = EditCaptionHistoryEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)
      && isUserCaptionOwner(liveMeeting, msg.header.userId, msg.body.locale)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to edit caption history in meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      val successfulEdit = editCaptionHistory(liveMeeting, msg.header.userId, msg.body.startIndex,
        msg.body.endIndex, msg.body.locale, msg.body.text)
      if (successfulEdit) {
        broadcastEvent(msg)
      }
    }
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

  def handle(msg: UpdateCaptionOwnerPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    def broadcastUpdateCaptionOwnerEvent(locale: String, localeCode: String, newOwnerId: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, newOwnerId)
      val envelope = BbbCoreEnvelope(UpdateCaptionOwnerEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UpdateCaptionOwnerEvtMsg.NAME, liveMeeting.props.meetingProp.intId, newOwnerId)

      val body = UpdateCaptionOwnerEvtMsgBody(locale, localeCode, newOwnerId)
      val event = UpdateCaptionOwnerEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to change caption owners."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      updateCaptionOwner(liveMeeting, msg.body.locale, msg.body.localeCode, msg.body.ownerId).foreach(f => {
        broadcastUpdateCaptionOwnerEvent(f._1, f._2.localeCode, f._2.ownerId)
      })
    }
  }

  def handleUserLeavingMsg(userId: String, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    def broadcastUpdateCaptionOwnerEvent(locale: String, localeCode: String, newOwnerId: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, newOwnerId)
      val envelope = BbbCoreEnvelope(UpdateCaptionOwnerEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UpdateCaptionOwnerEvtMsg.NAME, liveMeeting.props.meetingProp.intId, newOwnerId)

      val body = UpdateCaptionOwnerEvtMsgBody(locale, localeCode, newOwnerId)
      val event = UpdateCaptionOwnerEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    for {
      transcriptInfo <- checkCaptionOwnerLogOut(liveMeeting, userId)
    } yield {
      broadcastUpdateCaptionOwnerEvent(transcriptInfo._1, transcriptInfo._2.localeCode, transcriptInfo._2.ownerId)
    }
  }
}
