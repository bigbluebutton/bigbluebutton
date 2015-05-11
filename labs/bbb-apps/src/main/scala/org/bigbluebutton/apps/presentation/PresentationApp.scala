package org.bigbluebutton.apps.presentation

import org.bigbluebutton.apps.presentation.data._

class PresentationApp {
  private var presentations = new collection.immutable.HashMap[String, Presentation]()
  
  private var currentPresentation:Option[Presentation] = None
  
  private def savePresentation(p: Presentation) = {
    presentations += p.id -> p
  }
  
  def clearPresentation(id: String) = {
      currentPresentation foreach { cp =>
        if (cp.id == id) currentPresentation = None  
      }
  }
  
  private def getPresentation(id: String):Option[Presentation] = {
    presentations.get(id)
  }
  
  private def getPage(pres: Presentation, page: Int):Option[Page] = {
    pres.pages find { x => x.num == page}
  }
  
  private def remove(id: String) = {
    presentations -= id
  }
  
  def removePresentation(id: String):Option[Presentation] = {
    val pres = getPresentation(id)
    remove(id)
    pres
  }
  
  def newPresentation(pres: Presentation) = {
    savePresentation(pres)
  }
  
  def sharePresentation(id: String):Option[Presentation] = {
    val pres = presentations.get(id) 
    pres foreach { p => currentPresentation = Some(p) }  
    pres
  }
   
  def setCurrentPageForPresentation(pres: Presentation, page: Page):Option[Presentation] = {
    val newPres = pres.copy(currentPage = page.num)
    savePresentation(newPres)
    Some(newPres)
  }
 
  def displayPage(presentation: String, num: Int):Option[Page] = {
    for { 
      pres <- getPresentation(presentation) 
      page <-  getPage(pres, num) 
      newpres <- setCurrentPageForPresentation(pres, page)
    } yield page    
  }
  
  private def changePagePosition(pres: Presentation, page: Page, 
                                 position: Position):Page = {
    val newPage = page.copy(position = position)
    val otherPages = pres.pages filterNot {op => op.num == page.num}
    val newPages = otherPages :+ newPage
    val newPres = pres.copy(pages = newPages)
    newPage
  }
  
  def resizeAndMovePage(id: String, pageNum: Int, 
                        position: Position):Option[Page] = {
    for { 
      pres <- getPresentation(id) 
      page <-  getPage(pres, pageNum) 
      newPage = changePagePosition(pres, page, position)
    } yield newPage    
  }
}