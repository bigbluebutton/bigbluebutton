package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.apps.whiteboard.vo.AnnotationVO
import scala.collection.mutable.ArrayBuffer

class WhiteboardModel {
  private var _whiteboards = new scala.collection.immutable.HashMap[String, Whiteboard]()
  
  private var _enabled = true
    
  private def saveWhiteboard(wb: Whiteboard) {
    _whiteboards += wb.id -> wb
  }
  
  private def getWhiteboard(id: String):Option[Whiteboard] = {
    _whiteboards.values.find(wb => wb.id == id)
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
  
 
  def history(wbId:String):Option[Whiteboard] = {
    for {
      pres <- getCurrentPresentation
      page <- getCurrentPage(pres)
    } yield page
  }
  
  def clearWhiteboard(wbId:String) {
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
  
  def undoWhiteboard(wbId:String) {
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
  

  
  def enableWhiteboard(enable: Boolean) {
    _enabled = enable
  }
  
  def isWhiteboardEnabled():Boolean = {
    _enabled
  }
}