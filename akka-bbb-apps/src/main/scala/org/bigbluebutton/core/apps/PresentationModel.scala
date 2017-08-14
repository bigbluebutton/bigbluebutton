package org.bigbluebutton.core.apps

import org.bigbluebutton.common2.domain.PresentationVO
import org.bigbluebutton.common2.domain.PageVO

case class CurrentPresenter(userId: String, name: String, assignedBy: String)
case class CurrentPresentationInfo(presenter: CurrentPresenter, presentations: Seq[Presentation])
case class Presentation(id: String, name: String, current: Boolean = false,
                        pages: scala.collection.immutable.Map[String, PageVO], downloadable: Boolean)

case class Page(id: String, num: Int, thumbUri: String = "", swfUri: String,
                txtUri: String, svgUri: String, current: Boolean = false, xOffset: Double = 0, yOffset: Double = 0,
                widthRatio: Double = 100D, heightRatio: Double = 100D)

class PresentationModel {
  private var presentations = new scala.collection.immutable.HashMap[String, Presentation]

  def addPresentation(pres: Presentation) {
    savePresentation(pres)
  }

  def getPresentations(): Vector[Presentation] = {
    presentations.values.toVector
  }

  def getCurrentPresentation(): Option[Presentation] = {
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

  def removePresentation(presId: String): Option[Presentation] = {
    for {
      pres <- presentations.get(presId)
    } yield {
      presentations -= presId
      pres
    }
  }

  def setCurrentPresentation(presId: String): Option[Presentation] = {
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

  private def savePresentation(pres: Presentation) {
    presentations += pres.id -> pres
  }

  def resizePage(presentationId: String, pageId: String,
                 xOffset: Double, yOffset: Double, widthRatio: Double,
                 heightRatio: Double): Option[PageVO] = {
    for {
      pres <- presentations.get(presentationId)
      page <- pres.pages.get(pageId)
    } yield {
      val nPage = page.copy(xOffset = xOffset, yOffset = yOffset,
        widthRatio = widthRatio, heightRatio = heightRatio)
      val nPages = pres.pages + (nPage.id -> nPage)
      val newPres = pres.copy(pages = nPages)
      savePresentation(newPres)
      nPage
    }
  }

  private def deactivateCurrentPage(pres: Presentation, pageIdToIgnore: String): Presentation = {
    var updatedPres = pres
    pres.pages.values.find(p => p.current && p.id != pageIdToIgnore).foreach { cp =>
      val page = cp.copy(current = false)
      val nPages = pres.pages + (page.id -> page)
      val newPres = pres.copy(pages = nPages)
      updatedPres = newPres
    }
    updatedPres
  }

  private def makePageCurrent(pres: Presentation, pageId: String): Option[Presentation] = {
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

  def changeCurrentPage(presentationId: String, pageId: String): Boolean = {
    var foundPage: Boolean = false;

    for {
      pres <- presentations.get(presentationId)
      newPres <- makePageCurrent(pres, pageId)
    } yield {
      foundPage = true
      savePresentation(deactivateCurrentPage(newPres, pageId))
    }

    foundPage
  }

}
