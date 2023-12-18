package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.PresPresentationDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.PresentationInPod
import org.bigbluebutton.core.running.LiveMeeting

trait PdfConversionInvalidErrorSysPubMsgHdlr {
  this: PresentationPodHdlrs =>

  def handle(
      msg: PdfConversionInvalidErrorSysPubMsg, state: MeetingState2x,
      liveMeeting: LiveMeeting, bus: MessageBus
  ): MeetingState2x = {

    def broadcastEvent(msg: PdfConversionInvalidErrorSysPubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, msg.header.userId
      )
      val envelope = BbbCoreEnvelope(PdfConversionInvalidErrorEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(
        PdfConversionInvalidErrorEvtMsg.NAME,
        liveMeeting.props.meetingProp.intId, msg.header.userId
      )

      val body = PdfConversionInvalidErrorEvtMsgBody(msg.body.podId, msg.body.messageKey, msg.body.code, msg.body.presentationId, msg.body.bigPageNumber, msg.body.bigPageSize, msg.body.presName)
      val event = PdfConversionInvalidErrorEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    val errorDetails = scala.collection.immutable.Map(
      "bigPageNumber" -> msg.body.bigPageNumber.toString,
      "bigPageSize" -> msg.body.bigPageSize.toString
    )

    val newState = for {
      pod <- PresentationPodsApp.getPresentationPod(state, msg.body.podId)
      pres <- pod.getPresentation(msg.body.presentationId)
    } yield {
      val presWithError = PresentationInPod(pres.id, pres.name, pres.default, pres.current, pres.pages, pres.downloadable,
        pres.downloadFileExtension, pres.removable, pres.filenameConverted, pres.uploadCompleted, pres.numPages,
        msg.body.messageKey, errorDetails)
      var pods = state.presentationPodManager.addPod(pod)
      pods = pods.addPresentationToPod(pod.id, presWithError)

      state.update(pods)
    }

    PresPresentationDAO.updateErrors(msg.body.presentationId, msg.body.messageKey, errorDetails)
    broadcastEvent(msg)

    newState match {
      case Some(ns) => ns
      case None     => state
    }
  }
}
