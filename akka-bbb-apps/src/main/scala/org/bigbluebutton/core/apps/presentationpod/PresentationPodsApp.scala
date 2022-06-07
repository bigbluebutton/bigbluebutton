package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.domain._
import org.bigbluebutton.core.domain._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.util.RandomStringGenerator

object PresentationPodsApp {

  def createPresentationPod(creatorId: String): PresentationPod = {
    PresentationPodFactory.create(creatorId)
  }

  def createDefaultPresentationPod(): PresentationPod = {
    PresentationPodFactory.createDefaultPod()
  }

  def removePresentationPod(state: MeetingState2x, podId: String): MeetingState2x = {
    val podManager = state.presentationPodManager.removePod(podId)
    state.update(podManager)
  }

  def getPresentationPod(state: MeetingState2x, podId: String): Option[PresentationPod] = {
    state.presentationPodManager.getPod(podId)
  }

  def getPresentationPodIfPresenter(state: MeetingState2x, podId: String, userId: String): Option[PresentationPod] = {
    for {
      pod <- getPresentationPod(state, podId)
      if pod.currentPresenter == userId
    } yield {
      pod
    }
  }

  def getAllPresentationPodsInMeeting(state: MeetingState2x): Vector[PresentationPod] = {
    state.presentationPodManager.getAllPresentationPodsInMeeting()
  }

  def getNumberOfPresentationPods(state: MeetingState2x): Int = state.presentationPodManager.getNumberOfPods()

  def translatePresentationPodToVO(pod: PresentationPod): PresentationPodVO = {
    val presentationObjects = pod.presentations
    val presentationVOs = presentationObjects.values.map { p =>
      val pages = p.pages.values.map { page =>
        PageVO(
          id = page.id,
          num = page.num,
          thumbUri = page.urls.getOrElse("thumb", ""),
          swfUri = page.urls.getOrElse("swf", ""),
          txtUri = page.urls.getOrElse("text", ""),
          svgUri = page.urls.getOrElse("svg", ""),
          current = page.current,
          xOffset = page.xOffset,
          yOffset = page.yOffset,
          widthRatio = page.widthRatio,
          heightRatio = page.heightRatio
        )
      }

      PresentationVO(p.id, p.name, p.current,
        pages.toVector, p.downloadable)
    }

    PresentationPodVO(pod.id, pod.currentPresenter, presentationVOs.toVector)
  }

  def findPodsWhereUserIsPresenter(mgr: PresentationPodManager, userId: String): Vector[PresentationPod] = {
    mgr.presentationPods.values.toVector.filter(p => p.currentPresenter == userId)
  }

  def updatePresentationPod(state: MeetingState2x, pod: PresentationPod): MeetingState2x = {
    val podManager = state.presentationPodManager.addPod(pod)
    state.update(podManager)
  }

  def translatePresentationToPresentationVO(pres: PresentationInPod): PresentationVO = {
    val pages = pres.pages.values.map { page =>
      PageVO(
        id = page.id,
        num = page.num,
        thumbUri = page.urls.getOrElse("thumb", ""),
        swfUri = page.urls.getOrElse("swf", ""),
        txtUri = page.urls.getOrElse("text", ""),
        svgUri = page.urls.getOrElse("svg", ""),
        current = page.current,
        xOffset = page.xOffset,
        yOffset = page.yOffset,
        widthRatio = page.widthRatio,
        heightRatio = page.heightRatio
      )
    }
    PresentationVO(pres.id, pres.name, pres.current, pages.toVector, pres.downloadable)
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

