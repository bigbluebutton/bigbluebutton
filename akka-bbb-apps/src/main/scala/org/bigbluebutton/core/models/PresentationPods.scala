package org.bigbluebutton.core.models

import org.bigbluebutton.common2.domain.PageVO
import org.bigbluebutton.core.models.PresentationInPod
import org.bigbluebutton.core.util.RandomStringGenerator

object PresentationPodFactory {
  private def genId(): String = System.currentTimeMillis() + "-" + RandomStringGenerator.randomAlphanumericString(8)

  def create(creatorId: String): PresentationPod = {
    val currentPresenter = creatorId
    PresentationPod(genId(), currentPresenter, Map.empty)
  }

  def createDefaultPod(): PresentationPod = {
    // we hardcode the podId of the default presentation pod for the purposes of having bbb-web know the podId
    // in advance (so we can fully process default.pdf)
    PresentationPod(PresentationPod.DEFAULT_PRESENTATION_POD, "", Map.empty)
  }
}

case class PresentationPage(
    id:          String,
    num:         Int,
    urls:        Map[String, String],
    current:     Boolean             = false,
    xOffset:     Double              = 0,
    yOffset:     Double              = 0,
    widthRatio:  Double              = 100D,
    heightRatio: Double              = 100D
)

object PresentationInPod {
  def addPage(pres: PresentationInPod, page: PresentationPage): PresentationInPod = {
    val newPages = pres.pages + (page.id -> page)
    pres.copy(pages = newPages)
  }

  def makePageCurrent(pres: PresentationInPod, pageId: String): Option[PresentationInPod] = {
    pres.pages.get(pageId) match {
      case Some(newCurPage) =>
        val page = newCurPage.copy(current = true)
        val newPages = pres.pages + (page.id -> page)
        val newPres = pres.copy(pages = newPages)
        Some(newPres)
      case None =>
        None
    }
  }

  def getCurrentPage(pres: PresentationInPod): Option[PresentationPage] = {
    pres.pages.values find (p => p.current)
  }

}

case class PresentationInPod(
    id:           String,
    name:         String,
    current:      Boolean                                                  = false,
    pages:        scala.collection.immutable.Map[String, PresentationPage],
    downloadable: Boolean
)

object PresentationPod {
  val DEFAULT_PRESENTATION_POD = "DEFAULT_PRESENTATION_POD"
}

case class PresentationPod(id: String, currentPresenter: String,
                           presentations: collection.immutable.Map[String, PresentationInPod]) {
  def addPresentation(presentation: PresentationInPod): PresentationPod = {
    copy(presentations = presentations + (presentation.id -> presentation))
  }

  def removePresentation(id: String): PresentationPod = copy(presentations = presentations - id)

  def setCurrentPresenter(userId: String): PresentationPod = copy(currentPresenter = userId)

  def getCurrentPresentation(): Option[PresentationInPod] = presentations.values find (p => p.current)

  def getPresentation(presentationId: String): Option[PresentationInPod] =
    presentations.values find (p => p.id == presentationId)

  def setCurrentPresentation(presId: String): Option[PresentationPod] = {
    var tempPod: PresentationPod = this
    presentations.values foreach (curPres => { // unset previous current presentation
      if (curPres.id != presId) {
        val newPres = curPres.copy(current = false)
        tempPod = tempPod.addPresentation(newPres)
      }
    })

    presentations.get(presId) match { // set new current presentation
      case Some(pres) =>
        val cp = pres.copy(current = true)
        tempPod = tempPod.addPresentation(cp)
      case None => None
    }

    Some(tempPod)
  }

  def setPresentationDownloadable(presentationId: String, downloadable: Boolean): Option[PresentationPod] = {
    var tempPod: PresentationPod = this
    presentations.values foreach (curPres => { // unset previous current presentation
      if (curPres.id != presentationId) {
        val newPres = curPres.copy(downloadable = downloadable)
        tempPod = tempPod.addPresentation(newPres)
      }
    })

    presentations.get(presentationId) match { // set new current presentation
      case Some(pres) =>
        val cp = pres.copy(downloadable = downloadable)
        tempPod = tempPod.addPresentation(cp)
      case None => None
    }

    Some(tempPod)
  }

  def setCurrentPage(presentationId: String, pageId: String): Option[PresentationPod] = {
    for {
      pres <- presentations.get(presentationId)
      newPres <- PresentationInPod.makePageCurrent(pres, pageId)
    } yield {
      addPresentation(deactivateCurrentPage(newPres, pageId))
    }
  }

  private def deactivateCurrentPage(pres: PresentationInPod, pageIdToIgnore: String): PresentationInPod = {
    var updatedPres = pres
    pres.pages.values.find(p => p.current && p.id != pageIdToIgnore).foreach { cp =>
      val page = cp.copy(current = false)
      val nPages = pres.pages + (page.id -> page)
      val newPres = pres.copy(pages = nPages)
      updatedPres = newPres
    }
    updatedPres
  }

  def getPresentationsSize(): Int = {
    presentations.values.size
  }

  def printPod(): String = {
    val b = s"printPod (${presentations.values.size}):"
    var d = ""
    presentations.values.foreach(p => d += s"\nPRES_ID=${p.id} NAME=${p.name} CURRENT=${p.current}\n")
    b.concat(s"PODID=$id CURRENTPRESENTER=$currentPresenter PRESENTATIONS={{{$d}}}\n")
  }

  def resizePage(presentationId: String, pageId: String,
                 xOffset: Double, yOffset: Double, widthRatio: Double,
                 heightRatio: Double): Option[(PresentationPod, PresentationPage)] = {
    // Force coordinate that are out-of-bounds inside valid values
    // 0.25D is 400% zoom
    // 100D-checkedWidth is the maximum the page can be moved over
    val checkedWidth = Math.min(widthRatio, 100D) //if (widthRatio <= 100D) widthRatio else 100D
    val checkedHeight = Math.min(heightRatio, 100D)
    val checkedXOffset = Math.min(xOffset, 0D)
    val checkedYOffset = Math.min(yOffset, 0D)

    for {
      pres <- presentations.get(presentationId)
      page <- pres.pages.get(pageId)
    } yield {
      val nPage = page.copy(xOffset = checkedXOffset, yOffset = checkedYOffset,
        widthRatio = checkedWidth, heightRatio = checkedHeight)
      val nPages = pres.pages + (nPage.id -> nPage)
      val newPres = pres.copy(pages = nPages)
      (addPresentation(newPres), nPage)
    }
  }

}

case class PresentationPodManager(presentationPods: collection.immutable.Map[String, PresentationPod]) {

  def addPod(presPod: PresentationPod): PresentationPodManager = {
    copy(presentationPods = presentationPods + (presPod.id -> presPod))
  }

  def removePod(podId: String): PresentationPodManager = {
    copy(presentationPods = presentationPods - podId)
  }

  def getNumberOfPods(): Int = presentationPods.size
  def getPod(podId: String): Option[PresentationPod] = presentationPods.get(podId)
  def getDefaultPod(): Option[PresentationPod] = presentationPods.get(PresentationPod.DEFAULT_PRESENTATION_POD)
  def getAllPresentationPodsInMeeting(): Vector[PresentationPod] = presentationPods.values.toVector
  def updatePresentationPod(presPod: PresentationPod): PresentationPodManager = addPod(presPod)

  def addPresentationToPod(podId: String, pres: PresentationInPod): PresentationPodManager = {
    val updatedManager = for {
      pod <- getPod(podId)
    } yield {
      updatePresentationPod(pod.addPresentation(pres))
    }

    updatedManager match {
      case Some(ns) => ns
      case None     => this
    }
  }

  def removePresentationInPod(podId: String, presentationId: String): PresentationPodManager = {
    val updatedManager = for {
      pod <- getPod(podId)
    } yield {
      updatePresentationPod(pod.removePresentation(presentationId))
    }

    updatedManager match {
      case Some(ns) => ns
      case None     => this
    }
  }

  def setPresentationDownloadableInPod(podId: String, presentationId: String, downloadable: Boolean): PresentationPodManager = {
    val updatedManager = for {
      pod <- getPod(podId)
      podWithAdjustedDownloadablePresentation <- pod.setPresentationDownloadable(presentationId, downloadable)

    } yield {
      updatePresentationPod(podWithAdjustedDownloadablePresentation)
    }

    updatedManager match {
      case Some(ns) => ns
      case None     => this
    }
  }

  def printPods(): String = {
    var a = s"printPods (${presentationPods.values.size}):"
    presentationPods.values.foreach(pod => a = a.concat(pod.printPod()))
    a
  }

  def setCurrentPresentation(podId: String, presId: String): PresentationPodManager = {
    val updatedManager = for {
      pod <- getPod(podId)
      podWithAdjustedCurrentPresentation <- pod.setCurrentPresentation(presId)

    } yield {
      updatePresentationPod(podWithAdjustedCurrentPresentation)
    }

    updatedManager match {
      case Some(ns) => ns
      case None     => this
    }
  }

}
