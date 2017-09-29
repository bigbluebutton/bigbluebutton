package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.domain._
import org.bigbluebutton.core.apps.Presentation
import org.bigbluebutton.core.domain._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.LiveMeeting

object PresentationPodsApp {

  def createPresentationPod(ownerId: String): PresentationPod = {
    PresentationPodFactory.create(ownerId)
  }

  //  def createPresentationPod(id: String, ownerId: String, currentPresenter: String, authorizedPresenters: Vector[String],
  //                            presentations: collection.immutable.Map[String, Presentation]): PresentationPod = {
  //    PresentationPodFactory.create(ownerId)
  //  }

  def createDefaultPresentationPod(state: MeetingState2x): MeetingState2x = {
    val defaultPresPod = PresentationPodFactory.create("the-owner-id")
    val podManager = state.presentationPodManager.addPod(defaultPresPod)
    state.update(podManager)
  }

  def removePresentationPod(state: MeetingState2x, podId: String): MeetingState2x = {
    val podManager = state.presentationPodManager.removePod(podId)
    state.update(podManager)
  }

  def getPresentationPod(state: MeetingState2x, podId: String): Option[PresentationPod] = {
    state.presentationPodManager.getPod(podId)
  }

  def getAllPresentationPodsInMeeting(state: MeetingState2x): Vector[PresentationPod] = {
    state.presentationPodManager.getAllPresentationPodsInMeeting()
  }

  def getNumberOfPresentationPods(state: MeetingState2x): Int = state.presentationPodManager.getNumberOfPods()

  def translatePresentationPodToVO(pod: PresentationPod): PresentationPodVO = {
    val presentationObjects = pod.presentations
    val presentationVOs = presentationObjects.values.map(p => PresentationVO(p.id, p.name, p.current,
      p.pages.values.toVector, p.downloadable)).toVector

    PresentationPodVO(pod.id, pod.ownerId, pod.currentPresenter,
      pod.authorizedPresenters, presentationVOs)
  }
}

