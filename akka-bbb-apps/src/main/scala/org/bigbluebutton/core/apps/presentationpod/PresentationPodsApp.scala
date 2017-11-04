package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.domain._
import org.bigbluebutton.core.domain._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.util.RandomStringGenerator

object PresentationPodsApp {

  def createPresentationPod(ownerId: String): PresentationPod = {
    PresentationPodFactory.create(ownerId)
  }

  def createDefaultPresentationPod(ownerId: String): PresentationPod = {
    PresentationPodFactory.createDefaultPod(ownerId)
  }

  //    def createDefaultPresentationPod(state: MeetingState2x): MeetingState2x = {
  //      val defaultPresPod = PresentationPodFactory.create("the-owner-id")
  //      val podManager = state.presentationPodManager.addPod(defaultPresPod)
  //      state.update(podManager)
  //    }

  def removePresentationPod(state: MeetingState2x, podId: String): MeetingState2x = {
    val podManager = state.presentationPodManager.removePod(podId)
    state.update(podManager)
  }

  def getPresentationPod(state: MeetingState2x, podId: String): Option[PresentationPod] = {
    if (getNumberOfPresentationPods(state) == 0) {
      val defPod = createDefaultPresentationPod("") // ownerId is to be assigned later
      state.presentationPodManager.addPod(defPod)
      Some(defPod)
    } else {
      state.presentationPodManager.getPod(podId)
    }
  }

  def getAllPresentationPodsInMeeting(state: MeetingState2x): Vector[PresentationPod] = {
    state.presentationPodManager.getAllPresentationPodsInMeeting()
  }

  def getNumberOfPresentationPods(state: MeetingState2x): Int = state.presentationPodManager.getNumberOfPods()

  def translatePresentationPodToVO(pod: PresentationPod): PresentationPodVO = {
    val presentationObjects = pod.presentations
    val presentationVOs = presentationObjects.values.map(p => PresentationVO(p.id, p.name, p.current,
      p.pages.values.toVector, p.downloadable)).toVector

    PresentationPodVO(pod.id, pod.ownerId, pod.currentPresenter, presentationVOs)
  }

  def updatePresentationPod(state: MeetingState2x, pod: PresentationPod): MeetingState2x = {
    val podManager = state.presentationPodManager.addPod(pod)
    state.update(podManager)
  }

  def translatePresentationToPresentationVO(pres: PresentationInPod): PresentationVO = {
    PresentationVO(pres.id, pres.name, pres.current, pres.pages.values.toVector, pres.downloadable)
  }

  def setCurrentPresentationInPod(state: MeetingState2x, podId: String, nextCurrentPresId: String): Option[PresentationPod] = {
    for {
      pod <- getPresentationPod(state, podId)
      updatedPod <- pod.setCurrentPresentation(nextCurrentPresId)
    } yield {
      updatedPod
    }
  }

  // add ownerId to default presentation pod -- in some cases we add it before first user is available
  def changeOwnershipOfDefaultPod(state: MeetingState2x, newOwnerId: String): Option[PresentationPod] = {
    for {
      defPod <- getPresentationPod(state, "DEFAULT_PRESENTATION_POD")
    } yield {
      defPod.copy(ownerId = newOwnerId)
    }
  }

  def generateToken(podId: String, userId: String): String = {
    "LALA-" + RandomStringGenerator.randomAlphanumericString(8) + podId + "-" + userId
  }
}

