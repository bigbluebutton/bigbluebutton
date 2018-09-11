package org.bigbluebutton.core.apps

import org.bigbluebutton.common2.domain.PageVO

case class CurrentPresenter(userId: String, name: String, assignedBy: String)
case class CurrentPresentationInfo(presenter: CurrentPresenter, presentations: Seq[Presentation])
case class Presentation(id: String, name: String, current: Boolean = false,
                        pages: scala.collection.immutable.Map[String, PageVO], downloadable: Boolean)

class PresentationModel {
  private var presentations = new scala.collection.immutable.HashMap[String, Presentation] // todo remove

  def addPresentation(pres: Presentation) { // todo remove
    savePresentation(pres)
  }

  def getPresentations(): Vector[Presentation] = { // todo remove
    presentations.values.toVector
  }

  def getCurrentPresentation(): Option[Presentation] = { // todo remove
    presentations.values find (p => p.current)
  }

  def getCurrentPage(pres: Presentation): Option[PageVO] = {
    pres.pages.values find (p => p.current)
  }

  def getCurrentPage(): Option[PageVO] = {
    for {
      curPres <- getCurrentPresentation()
      curPage <- getCurrentPage(curPres)
    } yield curPage
  }

  def setCurrentPresentation(presId: String): Option[Presentation] = { // todo remove
    getPresentations foreach (curPres => {
      if (curPres.id != presId) {
        val newPres = curPres.copy(current = false)
        savePresentation(newPres)
      }
    })

    presentations.get(presId) match {
      case Some(pres) =>
        val cp = pres.copy(current = true)
        savePresentation(cp)
        Some(cp)
      case None => None
    }
  }

  private def savePresentation(pres: Presentation) { // todo remove
    presentations += pres.id -> pres
  }

}
