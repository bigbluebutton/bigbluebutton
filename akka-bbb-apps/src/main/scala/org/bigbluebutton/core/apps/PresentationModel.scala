package org.bigbluebutton.core.apps

import org.bigbluebutton.common2.domain.PresentationVO
import org.bigbluebutton.common2.domain.PageVO

case class CurrentPresenter(userId: String, name: String, assignedBy: String)
case class CurrentPresentationInfo(presenter: CurrentPresenter, presentations: Seq[Presentation])
case class Presentation(id: String, name: String, current: Boolean = false,
  pages: scala.collection.immutable.HashMap[String, Page], downloadable: Boolean)

case class Page(id: String, num: Int, thumbUri: String = "", swfUri: String,
  txtUri: String, svgUri: String, current: Boolean = false, xOffset: Double = 0, yOffset: Double = 0,
  widthRatio: Double = 100D, heightRatio: Double = 100D)

class PresentationModel {
  private var presentations = new scala.collection.immutable.HashMap[String, PresentationVO]

  def addPresentation(pres: PresentationVO) {
    savePresentation(pres)
  }

  def getPresentations(): Seq[PresentationVO] = {
    presentations.values.toSeq
  }

  def getCurrentPresentation(): Option[PresentationVO] = {
    presentations.values find (p => p.current)
  }

  def getCurrentPage(pres: PresentationVO): Option[PageVO] = {
    pres.pages.values find (p => p.current)
  }

  def getCurrentPage(): Option[PageVO] = {
    for {
      curPres <- getCurrentPresentation()
      curPage <- getCurrentPage(curPres)
    } yield curPage
  }

  def removePresentation(presId: String): Option[PresentationVO] = {
    for {
      pres <- presentations.get(presId)
    } yield {
      presentations -= presId
      pres
    }
  }

  def setCurrentPresentation(presId: String): Option[PresentationVO] = {
    getCurrentPresentation foreach (curPres => {
      if (curPres.id != presId) {
        val newPres = curPres.copy(current = false)
        savePresentation(newPres)
      }
    })

    presentations.get(presId) match {
      case Some(pres) => {
        val cp = pres.copy(current = true)
        savePresentation(cp)
        Some(cp)
      }
      case None => None
    }
  }

  private def savePresentation(pres: PresentationVO) {
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

  private def deactivateCurrentPage(pres: PresentationVO, pageIdToIgnore: String): PresentationVO = {
    var updatedPres = pres
    pres.pages.values.find(p => p.current && p.id != pageIdToIgnore).foreach { cp =>
      val page = cp.copy(current = false)
      val nPages = pres.pages + (page.id -> page)
      val newPres = pres.copy(pages = nPages)
      updatedPres = newPres
    }
    updatedPres
  }

  private def makePageCurrent(pres: PresentationVO, pageId: String): Option[PresentationVO] = {
    pres.pages.get(pageId) match {
      case Some(newCurPage) => {
        val page = newCurPage.copy(current = true)
        val newPages = pres.pages + (page.id -> page)
        val newPres = pres.copy(pages = newPages)
        Some(newPres)
        //        println("Making page[" + page.id + "] current[" + page.current + "]")
      }
      case None => {
        //        println("Could not find page[" + page + "] in presentation [" + pres.id + "]")
        None
      }
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