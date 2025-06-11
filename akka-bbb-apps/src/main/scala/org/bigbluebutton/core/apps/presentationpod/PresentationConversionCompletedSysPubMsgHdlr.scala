package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.{NotificationDAO, PresPresentationDAO}
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.PresentationInPod
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core2.message.senders.MsgBuilder

import java.time.{Instant, Duration}

trait PresentationConversionCompletedSysPubMsgHdlr {
  this: PresentationPodHdlrs =>

  def handle(
      msg: PresentationConversionCompletedSysPubMsg,
      state: MeetingState2x,
      liveMeeting: LiveMeeting,
      bus: MessageBus
  ): MeetingState2x = {

    val meetingId = liveMeeting.props.meetingProp.intId
    val temporaryPresentationId = msg.body.presentation.temporaryPresentationId

    val newState = for {
      pod <- PresentationPodsApp.getPresentationPod(state, msg.body.podId)
      pres <- pod.getPresentation(msg.body.presentation.id)
    } yield {
      val presVO = PresentationPodsApp.translatePresentationToPresentationVO(pres, temporaryPresentationId,
        msg.body.presentation.defaultPresentation, msg.body.presentation.filenameConverted)
      PresentationSender.broadcastPresentationConversionCompletedEvtMsg(
        bus,
        meetingId,
        pod.id,
        msg.header.userId,
        msg.body.messageKey,
        msg.body.code,
        presVO,
      )

      val originalDownloadableExtension = pres.name.split("\\.").last
      PresentationSender.broadcastSetPresentationDownloadableEvtMsg(
        bus,
        meetingId,
        pod.id,
        msg.header.userId,
        pres.id,
        pres.downloadable,
        pres.name,
        originalDownloadableExtension
      )

      val presWithConvertedName = PresentationInPod(pres.id, pres.name, default = msg.body.presentation.defaultPresentation,
        pres.current, pres.pages, pres.downloadable, pres.downloadFileExtension, pres.removable, msg.body.presentation.filenameConverted,
        uploadCompleted = true, numPages = pres.numPages, errorDetails = Map.empty)
      var pods = state.presentationPodManager.addPod(pod)
      pods = pods.addPresentationToPod(pod.id, presWithConvertedName)

      PresPresentationDAO.updatePages(presWithConvertedName)
      if(pres.current) {
        val notifyEvent = MsgBuilder.buildNotifyAllInMeetingEvtMsg(
          meetingId,
          "info",
          "presentation",
          "app.presentation.newCurrentPresentationNotification",
          "Notification when a new presentation is set as current",
          Map("presentationName"->s"${pres.name}")
        )
        NotificationDAO.insert(notifyEvent)
      }

      state.update(pods)

      val conversion = state.presentationConversions.find(pres.id)
      conversion match {
        case Some(pc) =>
          val start = Instant.ofEpochMilli(pc.startTime)
          val duration = Duration.between(start, Instant.now())
          log.info(s"Presentation ${pres.id} with ${pres.pages.size} pages finished converting after $duration")
          val presentationConversions = state.presentationConversions.remove(pres.id)
          state.update(presentationConversions)
      }
    }

    newState match {
      case Some(ns) => ns
      case None     => state
    }

  }
}

