package org.bigbluebutton.core.apps.presentation

case class Presentation(id: String, name: String, current: Boolean = false, 
                        pages: scala.collection.immutable.HashMap[String, Page])
                        
case class Page(id: String, num: Int, current: Boolean = false, 
                thumbnail: String = "",
                xOffset: Double = 0, yOffset: Double = 0,
                widthRatio: Double = 0D, heightRatio: Double = 0D)
                
class PresentationModel {
  private var presentations = new scala.collection.immutable.HashMap[String, Presentation]
  
  def getPresentations():Seq[Presentation] = {
    presentations.values.toSeq
  }
  
  def getCurrentPresentation():Option[Presentation] = {
    presentations.values find (p => p.current)
  }
  
  def getCurrentPage(pres: Presentation):Option[Page] = {
    pres.pages.values find (p => p.current)
  }

  private def deactivateCurrentPage(pres: Presentation) {
    val curPage = getCurrentPage(pres)
    curPage foreach (cp => {
      val page = cp.copy(current = false)
      val nPages = pres.pages + (page.id -> page)
      val newPres = pres.copy(pages= nPages)
      savePresentation(newPres)
    })
  }
  
  private def savePresentation(pres: Presentation) {
    presentations += pres.id -> pres
  }
  
  def changePage(pres: Presentation, pageId: String):Option[Page] = {
      deactivateCurrentPage(pres)
      pres.pages.values find (p => p.id == pageId) match {
        case Some(newCurPage) => {
          val page = newCurPage.copy(current=true)
          val newPages = pres.pages + (page.id -> page)
          val newPres = pres.copy(pages= newPages)
          savePresentation(newPres)
          Some(page)
        }
        case None => None
      }
  }
  
}