package org.bigbluebutton.core.models

import org.bigbluebutton.core.apps.Presentation
import org.bigbluebutton.core.util.RandomStringGenerator

object PresentationPodFactory {
  private def genId(): String = System.currentTimeMillis() + "-" + RandomStringGenerator.randomAlphanumericString(8)
  def create(ownerId: String): PresentationPod = {
    val currentPresenter = ownerId // default
    new PresentationPod(genId(), ownerId, currentPresenter, Vector.empty, Map.empty)
  }
}

case class PresentationPod(id: String, ownerId: String, currentPresenter: String, authorizedPresenters: Vector[String],
                           presentations: collection.immutable.Map[String, Presentation]) {
  def addPresentation(presentation: Presentation): PresentationPod = copy(presentations =
    presentations + (presentation.id -> presentation))
  def removePresentation(id: String): PresentationPod = copy(presentations = presentations - id)

  def addAuthorizedPresenter(userId: String): PresentationPod = copy(authorizedPresenters = authorizedPresenters :+ userId)
  def removeAuthorizedPresenter(userId: String): PresentationPod = copy(authorizedPresenters =
    authorizedPresenters.filterNot(u => u == userId))

  def setCurrentPresenter(userId: String): PresentationPod = copy(currentPresenter = userId)
  //  def getCurrentPresenter(): String = currentPresenter

  def getCurrentPresentation(): Option[Presentation] = presentations.values find (p => p.current)
  def setCurrentPresentation(presId: String): Option[Presentation] = { // copy(currentPresenter = userId) // ****
    presentations.values foreach (curPres => { // unset previous current presentation
      if (curPres.id != presId) {
        val newPres = curPres.copy(current = false)
        addPresentation(newPres)
      }
    })

    presentations.get(presId) match { // set new current presenter
      case Some(pres) =>
        val cp = pres.copy(current = true)
        addPresentation(cp)
        Some(cp)
      case None => None
    }

  }
}

case class PresentationPodManager(presentationPods: collection.immutable.Map[String, PresentationPod]) {

  def addPod(presPod: PresentationPod): PresentationPodManager = copy(presentationPods + (presPod.id -> presPod))
  def removePod(id: String): PresentationPodManager = copy(presentationPods = presentationPods - id)
  def getNumberOfPods(): Int = presentationPods.size
}
