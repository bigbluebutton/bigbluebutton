package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.PresentationInPod
import org.bigbluebutton.core.running.LiveMeeting

trait PresentationPageConversionStartedSysMsgHdlr {
  this: PresentationPodHdlrs =>

  def handle(msg: PresentationPageConversionStartedSysMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    def broadcastEvent(msg: PresentationPageConversionStartedSysMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, msg.header.userId
      )
      val envelope = BbbCoreEnvelope(PresentationPageConversionStartedSysMsg.NAME, routing)
      val header = BbbClientMsgHeader(
        PresentationPageConversionStartedSysMsg.NAME,
        liveMeeting.props.meetingProp.intId, msg.header.userId
      )

      val body = PresentationPageConversionStartedSysMsgBody(
        podId = msg.body.podId,
        presentationId = msg.body.presentationId,
        current = msg.body.current,
        presName = msg.body.presName,
        downloadable = msg.body.downloadable,
        authzToken = msg.body.authzToken,
        numPages = msg.body.numPages
      )
      val event = PresentationPageConversionStartedSysMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    val downloadable = msg.body.downloadable
    val presentationId = msg.body.presentationId
    val podId = msg.body.podId

    val pres = new PresentationInPod(presentationId, msg.body.presName, msg.body.current, Map.empty, downloadable)

    val newState = for {
      pod <- PresentationPodsApp.getPresentationPod(state, podId)
    } yield {
      var pods = state.presentationPodManager.addPod(pod)
      pods = pods.addPresentationToPod(pod.id, pres)
      if (msg.body.current) {
        pods = pods.setCurrentPresentation(pod.id, pres.id)
      }

      state.update(pods)
    }

    broadcastEvent(msg)

    newState match {
      case Some(ns) => ns
      case None     => state
    }

  }
}
