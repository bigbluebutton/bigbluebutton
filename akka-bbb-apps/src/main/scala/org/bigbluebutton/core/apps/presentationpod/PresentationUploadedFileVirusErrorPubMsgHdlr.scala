package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.PresPresentationDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.PresentationInPod
import org.bigbluebutton.core.running.LiveMeeting

trait PresentationUploadedFileVirusErrorPubMsgHdlr {
  this: PresentationPodHdlrs =>

  def handle(
      msg: PresentationUploadedFileVirusErrorSysPubMsg, state: MeetingState2x,
      liveMeeting: LiveMeeting, bus: MessageBus
  ): MeetingState2x = {

    def broadcastEvent(msg: PresentationUploadedFileVirusErrorSysPubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, msg.header.userId
      )
      val envelope = BbbCoreEnvelope(PresentationUploadedFileVirusErrorEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(
        PresentationUploadedFileVirusErrorEvtMsg.NAME,
        liveMeeting.props.meetingProp.intId, msg.header.userId
      )

      val body = PresentationUploadedFileVirusErrorEvtMsgBody(msg.body.podId, msg.body.meetingId,
        msg.body.presentationName, msg.body.messageKey, msg.body.temporaryPresentationId,
        msg.body.presentationId)
      val event = PresentationUploadedFileVirusErrorEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    val newState = for {
      pod <- PresentationPodsApp.getPresentationPod(state, msg.body.podId)
      pres <- pod.getPresentation(msg.body.presentationId)
    } yield {
      val presWithError = PresentationInPod(
        id = pres.id,
        name = pres.name,
        default = pres.default,
        current = pres.current,
        pages = pres.pages,
        downloadable = pres.downloadable,
        removable = pres.removable,
        filenameConverted = pres.filenameConverted,
        uploadCompleted = pres.uploadCompleted,
        numPages = pres.numPages,
        errorMsgKey = msg.body.messageKey,
        errorDetails = Map.empty
      )
      var pods = state.presentationPodManager.addPod(pod)
      pods = pods.addPresentationToPod(pod.id, presWithError)

      state.update(pods)
    }

    PresPresentationDAO.updateErrors(msg.body.presentationId, msg.body.messageKey, Map.empty)
    broadcastEvent(msg)

    newState match {
      case Some(ns) => ns
      case None     => state
    }
  }
}
