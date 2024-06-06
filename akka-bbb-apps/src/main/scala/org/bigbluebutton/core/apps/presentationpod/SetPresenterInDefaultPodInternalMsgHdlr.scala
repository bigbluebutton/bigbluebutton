package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.api.SetPresenterInDefaultPodInternalMsg
import org.bigbluebutton.core.apps.{ RightsManagementTrait }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.models.{ PresentationPod, Users2x }

trait SetPresenterInDefaultPodInternalMsgHdlr {
  this: PresentationPodHdlrs =>

  def handleSetPresenterInDefaultPodInternalMsg(
      msg: SetPresenterInDefaultPodInternalMsg, state: MeetingState2x,
      liveMeeting: LiveMeeting, bus: MessageBus
  ): MeetingState2x = {
    // Switch presenter as default presenter pod has changed.
    log.info("Presenter pod change will trigger a presenter change")
    SetPresenterInPodActionHandler.handleAction(state, liveMeeting, bus.outGW, "", PresentationPod.DEFAULT_PRESENTATION_POD, msg.presenterId)
  }
}

object SetPresenterInPodActionHandler extends RightsManagementTrait {
  def handleAction(
      state:          MeetingState2x,
      liveMeeting:    LiveMeeting,
      outGW:          OutMsgRouter,
      assignedBy:     String,
      podId:          String,
      newPresenterId: String
  ): MeetingState2x = {

    def broadcastSetPresenterInPodRespMsg(podId: String, nextPresenterId: String, requesterId: String): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, requesterId
      )
      val envelope = BbbCoreEnvelope(SetPresenterInPodRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(SetPresenterInPodRespMsg.NAME, liveMeeting.props.meetingProp.intId, requesterId)

      val body = SetPresenterInPodRespMsgBody(podId, nextPresenterId)
      val event = SetPresenterInPodRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    val newState = for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, newPresenterId)
      pod <- PresentationPodsApp.getPresentationPod(state, podId)
    } yield {
      if (pod.currentPresenter != "") {
        Users2x.removeUserFromPresenterGroup(liveMeeting.users2x, pod.currentPresenter)
        liveMeeting.users2x.addOldPresenter(pod.currentPresenter)
      }
      Users2x.addUserToPresenterGroup(liveMeeting.users2x, newPresenterId)
      val updatedPod = pod.setCurrentPresenter(newPresenterId)
      broadcastSetPresenterInPodRespMsg(pod.id, newPresenterId, assignedBy)
      val pods = state.presentationPodManager.addPod(updatedPod)
      state.update(pods)
    }

    newState match {
      case Some(ns) => ns
      case None     => state
    }
  }
}
