package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

trait PresentationConversionCompletedSysPubMsgHdlr {

  this: PresentationPodHdlrs =>

  def handle(
      msg: PresentationConversionCompletedSysPubMsg, state: MeetingState2x,
      liveMeeting: LiveMeeting, bus: MessageBus
  ): MeetingState2x = {

    val meetingId = liveMeeting.props.meetingProp.intId

    val newState = for {
      pod <- PresentationPodsApp.getPresentationPod(state, msg.body.podId)
      pres <- pod.getPresentation(msg.body.presentation.id)
    } yield {
      val presVO = PresentationPodsApp.translatePresentationToPresentationVO(pres)

      PresentationSender.broadcastPresentationConversionCompletedEvtMsg(
        bus,
        meetingId,
        pod.id,
        msg.header.userId,
        msg.body.messageKey,
        msg.body.code,
        presVO
      )
      PresentationSender.broadcastSetPresentationDownloadableEvtMsg(
        bus,
        meetingId,
        pod.id,
        msg.header.userId,
        pres.id,
        pres.downloadable,
        pres.name
      )

      var pods = state.presentationPodManager.addPod(pod)
      pods = pods.addPresentationToPod(pod.id, pres)

      state.update(pods)
    }

    newState match {
      case Some(ns) => ns
      case None     => state
    }

  }
}

