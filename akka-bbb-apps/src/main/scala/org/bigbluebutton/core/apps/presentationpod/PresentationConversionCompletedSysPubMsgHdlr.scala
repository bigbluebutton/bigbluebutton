package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.common2.domain.{ PageVO, PresentationVO }
import org.bigbluebutton.core.models.PresentationInPod

trait PresentationConversionCompletedSysPubMsgHdlr {

  this: PresentationPodHdlrs =>

  def handle(
    msg: PresentationConversionCompletedSysPubMsg, state: MeetingState2x,
    liveMeeting: LiveMeeting, bus: MessageBus
  ): MeetingState2x = {

    def broadcastPresentationConversionCompletedEvtMsg(podId: String, userId: String, messageKey: String,
                                                       code: String, presentation: PresentationVO): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, userId
      )
      val envelope = BbbCoreEnvelope(PresentationConversionCompletedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(PresentationConversionCompletedEvtMsg.NAME, liveMeeting.props.meetingProp.intId, userId)

      val body = PresentationConversionCompletedEvtMsgBody(podId, messageKey, code, presentation)
      val event = PresentationConversionCompletedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    val pages = new collection.mutable.HashMap[String, PageVO]

    msg.body.presentation.pages.foreach { p =>
      val page = PageVO(p.id, p.num, p.thumbUri, p.swfUri, p.txtUri, p.svgUri, p.current, p.xOffset, p.yOffset,
        p.widthRatio, p.heightRatio)
      pages += page.id -> page
    }

    val pres = new PresentationInPod(msg.body.presentation.id, msg.body.presentation.name, msg.body.presentation.current,
      pages.toMap, msg.body.presentation.downloadable)
    val presVO = PresentationPodsApp.translatePresentationToPresentationVO(pres)
    val podId = msg.body.podId

    val newState = for {
      pod <- PresentationPodsApp.getPresentationPod(state, podId)
    } yield {
      broadcastPresentationConversionCompletedEvtMsg(pod.id, msg.header.userId, msg.body.messageKey, msg.body.code, presVO)

      var pods = state.presentationPodManager.addPod(pod)
      pods = pods.addPresentationToPod(pod.id, pres)
      pods = pods.setCurrentPresentation(pod.id, pres.id)

      state.update(pods)
    }

    newState match {
      case Some(ns) => ns
      case None     => state
    }

  }
}

