package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.PresPresentationDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.PresentationInPod
import org.bigbluebutton.core.running.LiveMeeting

trait PresentationHasInvalidMimeTypeErrorPubMsgHdlr {
  this: PresentationPodHdlrs =>

  def handle(
      msg: PresentationHasInvalidMimeTypeErrorSysPubMsg, state: MeetingState2x,
      liveMeeting: LiveMeeting, bus: MessageBus
  ): MeetingState2x = {

    def broadcastEvent(msg: PresentationHasInvalidMimeTypeErrorSysPubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, msg.header.userId
      )
      val envelope = BbbCoreEnvelope(PresentationHasInvalidMimeTypeErrorEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(
        PresentationHasInvalidMimeTypeErrorEvtMsg.NAME,
        liveMeeting.props.meetingProp.intId, msg.header.userId
      )

      val body = PresentationHasInvalidMimeTypeErrorEvtMsgBody(msg.body.podId, msg.body.meetingId,
        msg.body.presentationName, msg.body.temporaryPresentationId,
        msg.body.presentationId, msg.body.messageKey, msg.body.fileMime, msg.body.fileExtension)
      val event = PresentationHasInvalidMimeTypeErrorEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    val pod = PresentationPodsApp.getPresentationPod(state, msg.body.podId)
    pod match {
      case Some(pod) =>
        val pres = pod.getPresentation(msg.body.presentationId)
        pres match {
          case Some(pres) =>
            val presWithError = PresentationInPod(pres.id, pres.name, pres.current, pres.pages, pres.downloadable, pres.removable, pres.filenameConverted, pres.uploadCompleted, pres.numPages, msg.body.messageKey)
            PresPresentationDAO.insert(msg.header.meetingId, presWithError)
          case None =>
            println(s"Presentation with ID ${msg.body.presentationId} not found")
            PresPresentationDAO.updateErrorMsgKey(msg.body.presentationId, msg.body.messageKey)
        }
      case None =>
        println(s"Pod with ID ${msg.body.podId} not found")
    }

    broadcastEvent(msg)
    state
  }
}
