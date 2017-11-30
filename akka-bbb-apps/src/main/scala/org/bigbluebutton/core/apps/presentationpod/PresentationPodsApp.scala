package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.domain._
import org.bigbluebutton.core.domain._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.util.RandomStringGenerator

object PresentationPodsApp {

  def createPresentationPod(creatorId: String): PresentationPod = {
    PresentationPodFactory.create(creatorId)
  }

  def createDefaultPresentationPod(state: MeetingState2x): MeetingState2x = {
    val podManager = state.presentationPodManager.addPod(PresentationPodFactory.createDefaultPod())
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

    PresentationPodVO(pod.id, pod.currentPresenter, presentationVOs)
  }

  def findPodWhereUserIsPresenter(mgr: PresentationPodManager, userId: String): Option[PresentationPod] = {
    mgr.presentationPods.values.toVector.find(p => p.currentPresenter == userId)
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

  def generateToken(podId: String, userId: String): String = {
    "PresUploadToken-" + RandomStringGenerator.randomAlphanumericString(8) + podId + "-" + userId
  }
}

