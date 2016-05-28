package org.bigbluebutton.core.models

import org.bigbluebutton.core.domain.{ PresentationId, Page, Presentation }

class PresentationModel {
  private var presentations = new scala.collection.immutable.HashMap[String, Presentation]

  def addPresentation(pres: Presentation) {
    savePresentation(pres)
  }

  def getPresentations(): Seq[Presentation] = {
    presentations.values.toSeq
  }

  def getCurrentPresentation(): Option[Presentation] = {
    presentations.values find (p => p.current)
  }

  def getCurrentPage(pres: Presentation): Option[Page] = {
    pres.pages.values find (p => p.current)
  }

  def getCurrentPage(): Option[Page] = {
    for {
      curPres <- getCurrentPresentation()
      curPage <- getCurrentPage(curPres)
    } yield curPage
  }

  def remove(presId: PresentationId): Option[Presentation] = {
    val pres = presentations.get(presId.value)
    pres foreach (p => presentations -= p.id)
    pres
  }

  def sharePresentation(presId: PresentationId): Option[Presentation] = {
    getCurrentPresentation foreach (curPres => {
      if (curPres.id != presId.value) {
        val newPres = curPres.copy(current = false)
        savePresentation(newPres)
      }
    })

    presentations.get(presId.value) match {
      case Some(pres) => {
        val cp = pres.copy(current = true)
        savePresentation(cp)
        Some(cp)
      }
      case None => None
    }
  }

  private def savePresentation(pres: Presentation) {
    presentations += pres.id -> pres
  }

  private def resizeCurrentPage(pres: Presentation,
    xOffset: Double, yOffset: Double,
    widthRatio: Double,
    heightRatio: Double): Option[Page] = {
    getCurrentPage(pres) match {
      case Some(cp) => {
        val page = cp.copy(xOffset = xOffset, yOffset = yOffset,
          widthRatio = widthRatio, heightRatio = heightRatio)
        val nPages = pres.pages + (page.id -> page)
        val newPres = pres.copy(pages = nPages)
        savePresentation(newPres)
        Some(page)
      }
      case None => None
    }
  }

  def resizePage(xOffset: Double, yOffset: Double,
    widthRatio: Double, heightRatio: Double): Option[Page] = {
    for {
      curPres <- getCurrentPresentation
      page <- resizeCurrentPage(curPres, xOffset, yOffset, widthRatio, heightRatio)
    } yield page
  }

  private def deactivateCurrentPage(pres: Presentation) {
    getCurrentPage(pres) foreach { cp =>
      val page = cp.copy(current = false)
      val nPages = pres.pages + (page.id -> page)
      val newPres = pres.copy(pages = nPages)
      savePresentation(newPres)
      //        println("Making page[" + page.id + "] not current[" + page.current + "]")  
      //        println("After deact page. presentation id=[" + newPres.id + "] current=[" + newPres.current + "]")
      //        newPres.pages.values foreach {page =>
      //          println("page id=[" + page.id + "] current=[" + page.current + "]")
      //        }   
    }
  }

  private def makePageCurrent(pres: Presentation, page: String): Option[Page] = {
    pres.pages.values find (p => p.id == page) match {
      case Some(newCurPage) => {
        val page = newCurPage.copy(current = true)
        val newPages = pres.pages + (page.id -> page)
        val newPres = pres.copy(pages = newPages)
        savePresentation(newPres)
        //        println("Making page[" + page.id + "] current[" + page.current + "]")
        Some(page)
      }
      case None => {
        //        println("Could not find page[" + page + "] in presentation [" + pres.id + "]")
        None
      }
    }
  }

  def changePage(pageId: String): Option[Page] = {
    getCurrentPresentation foreach { pres => deactivateCurrentPage(pres) }

    for {
      pres <- getCurrentPresentation
      page <- makePageCurrent(pres, pageId)
    } yield page
  }

}