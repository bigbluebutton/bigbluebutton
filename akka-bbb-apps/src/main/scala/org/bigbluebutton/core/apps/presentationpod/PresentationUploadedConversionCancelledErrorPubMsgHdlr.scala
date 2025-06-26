package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.PresPresentationDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.PresentationInPod
import org.bigbluebutton.core.running.LiveMeeting

trait PresentationUploadedConversionCancelledErrorPubMsgHdlr {
  this: PresentationPodHdlrs =>

  def handle(msg: PresentationUploadedConversionCancelledErrorSysPubMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    def broadcastEvent(msg: PresentationUploadedConversionCancelledErrorSysPubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(PresentationUploadedConversionCancelledErrorEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(PresentationUploadedConversionCancelledErrorEvtMsg.NAME,
        liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = PresentationUploadedConversionCancelledErrorEvtMsgBody(msg.body.podId, msg.body.meetingId,
        msg.body.presentationName, msg.body.messageKey, msg.body.temporaryPresentationId,
        msg.body.presentationId)
      val event = PresentationUploadedConversionCancelledErrorEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    val maxConversionTime = msg.body.maxConversionTime / 1000

    val errorDetails = scala.collection.immutable.Map(
      "maxConversionTime" -> maxConversionTime.toString,
    )

    val newState = for {
      pod <- PresentationPodsApp.getPresentationPod(state, msg.body.podId)
      pres <- pod.getPresentation(msg.body.presentationId)
    } yield {
      val presWithError = PresentationInPod(pres.id, pres.name, pres.default, pres.current, pres.pages, pres.downloadable,
        "", pres.removable, pres.filenameConverted, pres.uploadCompleted, pres.numPages, msg.body.messageKey, errorDetails)
      var pods = state.presentationPodManager.addPod(pod)
      pods = pods.addPresentationToPod(pod.id, presWithError)

      state.update(pods)

      val conversion = state.presentationConversions.find(pres.id)
      conversion match {
        case Some(_) =>
          val presentationConversions = state.presentationConversions.remove(pres.id)
          state.update(presentationConversions)
        case None =>
          state
      }
    }

    PresPresentationDAO.updateErrors(msg.body.presentationId, msg.body.messageKey, errorDetails)
    broadcastEvent(msg)

    newState match {
      case Some(ns) => ns
      case None => state
    }
  }
}
