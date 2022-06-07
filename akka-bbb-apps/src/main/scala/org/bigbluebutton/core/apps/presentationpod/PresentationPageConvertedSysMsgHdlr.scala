package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.domain.PresentationPageVO
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.{ PresentationInPod, PresentationPage }
import org.bigbluebutton.core.running.LiveMeeting

trait PresentationPageConvertedSysMsgHdlr {
  this: PresentationPodHdlrs =>

  def handle(
      msg:         PresentationPageConvertedSysMsg,
      state:       MeetingState2x,
      liveMeeting: LiveMeeting,
      bus:         MessageBus
  ): MeetingState2x = {

    def broadcastEvent(msg: PresentationPageConvertedSysMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, msg.header.userId
      )
      val envelope = BbbCoreEnvelope(PresentationPageConvertedEventMsg.NAME, routing)
      val header = BbbClientMsgHeader(
        PresentationPageConvertedEventMsg.NAME,
        liveMeeting.props.meetingProp.intId, msg.header.userId
      )

      val page = PresentationPageVO(
        id = msg.body.page.id,
        num = msg.body.page.num,
        urls = msg.body.page.urls,
        current = msg.body.page.current
      )

      val body = PresentationPageConvertedEventMsgBody(
        msg.body.podId,
        msg.body.messageKey,
        msg.body.code,
        msg.body.presentationId,
        msg.body.numberOfPages,
        msg.body.pagesCompleted,
        msg.body.presName,
        page
      )
      val event = PresentationPageConvertedEventMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    val page = PresentationPage(
      msg.body.page.id,
      msg.body.page.num,
      msg.body.page.urls,
      msg.body.page.current
    )

    val newState = for {
      pod <- PresentationPodsApp.getPresentationPod(state, msg.body.podId)
      pres <- pod.getPresentation(msg.body.presentationId)
    } yield {
      val newPres = PresentationInPod.addPage(pres, page)
      var pods = state.presentationPodManager.addPod(pod)
      pods = pods.addPresentationToPod(pod.id, newPres)

      state.update(pods)
    }

    broadcastEvent(msg)

    newState match {
      case Some(ns) => ns
      case None     => state
    }
  }
}
