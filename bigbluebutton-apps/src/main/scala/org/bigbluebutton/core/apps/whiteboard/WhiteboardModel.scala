package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.apps.whiteboard.vo.AnnotationVO
import scala.collection.mutable.ArrayBuffer

class WhiteboardModel {
  private var _presentations = new scala.collection.immutable.HashMap[String, Presentation2]()
  
  private var _activePresentation = ""
  private var _enabled = true
  
  def getCurrentPresentation():Option[Presentation2] = {
    _presentations.values find (pres => pres.current)
  }
  
  def getCurrentPage(pres: Presentation2):Option[Page2] = {
    pres.pages.values find (page => page.current)
  }
   
  def numPages() = {
    var numPages = 0
    _presentations.get(_activePresentation) match {
      case Some(p) => {
        numPages = p.numPages
      }
      case None => // do nothing
    } 	  
    
    numPages
  }
  
  private def savePresentation(pres: Presentation2) {
    _presentations += pres.presentationID -> pres
  }
  
  def addAnnotationToShape(pres: Presentation2, page: Page2, shape: AnnotationVO) = {
    println("Adding shape to page [" + page.num + "]. Before numShapes=[" + page.shapes.length + "].")
    val newPage = page.copy(shapes=(page.shapes :+ shape))
    println("Adding shape to page [" + page.num + "]. After numShapes=[" + newPage.shapes.length + "].")
    val newPages = pres.pages + (newPage.num -> newPage)
    val newPres = pres.copy(pages=newPages)
    savePresentation(newPres)
  }
  
  def addAnnotation(shape: AnnotationVO) {
    getCurrentPresentation() foreach { pres =>
      getCurrentPage(pres) foreach {page =>
        addAnnotationToShape(pres, page, shape) 
      }
    }     
  }
  
  private def modifyTextInPage(pres: Presentation2, page: Page2, shape: AnnotationVO) = {
    val removedLastText = page.shapes.dropRight(1)
    val addedNewText = removedLastText :+ shape
    val newPage = page.copy(shapes=addedNewText)
    val newPages = pres.pages + (newPage.num -> newPage)
    val newPres = pres.copy(pages=newPages)
    savePresentation(newPres)    
  }
  
  def modifyText(shape: AnnotationVO) {
    getCurrentPresentation() foreach { pres =>
      getCurrentPage(pres) foreach {page =>
        modifyTextInPage(pres, page, shape) 
      }
    }   
  }
  
  private def deactivateCurrentPage(pres: Presentation2) {
    getCurrentPage(pres)  foreach {cp =>
        val page = cp.copy(current = false)
        val nPages = pres.pages + (page.num -> page)
        val newPres = pres.copy(pages= nPages)
        savePresentation(newPres)
        println("Making whiteboard page[" + page.num + "] not current[" + page.current + "]")  
        println("After deact page. presentation id=[" + newPres.presentationID + "] current=[" + newPres.current + "]")
        newPres.pages.values foreach {page =>
          println("page num=[" + page.num + "] current=[" + page.current + "]")
        }   
    }
  }
  
  
  private def makePageCurrent(pres: Presentation2, page: Int):Option[Page2] = {
    pres.pages.values find (p => p.num == page) match {
      case Some(newCurPage) => {
        val page = newCurPage.copy(current=true)
        val newPages = pres.pages + (page.num -> page)
        val newPres = pres.copy(pages= newPages)
        savePresentation(newPres)
        println("Making page[" + page.num + "] current[" + page.current + "]")
        Some(page)
      }
      case None => {
        println("Could not find page[" + page + "] in presentation [" + pres.presentationID + "]")
        None
      }
    }
  }
  
  def changePage(pageId: Int):Option[Page2] = {
    getCurrentPresentation foreach {pres => deactivateCurrentPage(pres)}
       
    for {
      pres <- getCurrentPresentation      
      page <- makePageCurrent(pres, pageId)
    } yield page
  }
  
  def history():Option[Page2] = {
    for {
      pres <- getCurrentPresentation
      page <- getCurrentPage(pres)
    } yield page
  }
  
  def clearWhiteboard() {
    getCurrentPresentation foreach {pres =>
      getCurrentPage(pres) foreach {page =>
        val clearedShapes = page.shapes.drop(page.shapes.length)
        val newPage = page.copy(shapes= clearedShapes)
        val newPages = pres.pages + (newPage.num -> newPage)
        val newPres = pres.copy(pages= newPages)
        savePresentation(newPres)        
      }  
    }    
  }
  
  def undoWhiteboard() {
    getCurrentPresentation foreach {pres =>
      getCurrentPage(pres) foreach {page =>
        val droppedShapes = page.shapes.drop(page.shapes.length-1)
        val newPage = page.copy(shapes= droppedShapes)
        val newPages = pres.pages + (newPage.num -> newPage)
        val newPres = pres.copy(pages= newPages)
        savePresentation(newPres)        
      }  
    }  
  }
  
  private def generatePages(numPages: Int):scala.collection.immutable.HashMap[Int, Page2] = {
    var pages = new scala.collection.immutable.HashMap[Int, Page2]()
	  
	for (i <- 1 to numPages) {
	  val shapes = new ArrayBuffer[AnnotationVO]
	    val p = new Page2(num=i, current=false, shapes.toSeq)
	    pages += (p.num -> p)
	  }
    
    pages
  }
  
  def setActivePresentation(presentationID: String, numPages: Int) {
     getCurrentPresentation foreach {curPres =>
        savePresentation(curPres.copy(current=false))
     }
     
     _presentations.get(presentationID) match {
       case Some(existingPres) => {
         savePresentation(existingPres.copy(current=true))
       }
       case None => { // New presentation
         val pages = generatePages(numPages)
         val newPres = new Presentation2(presentationID, numPages, 
                 current = true, pages)
         savePresentation(newPres)
       }
     }
  }
  
  def enableWhiteboard(enable: Boolean) {
    _enabled = enable
  }
  
  def isWhiteboardEnabled():Boolean = {
    _enabled
  }
}