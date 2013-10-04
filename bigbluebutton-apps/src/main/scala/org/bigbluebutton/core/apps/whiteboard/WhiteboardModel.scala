package org.bigbluebutton.core.apps.whiteboard

import scala.collection.mutable.HashMap
import org.bigbluebutton.core.apps.whiteboard.vo.AnnotationVO

class WhiteboardModel {

  private val _presentations = new HashMap[String, Presentation]()
  private var _activePresentation = ""
  private var _enabled = true
  
  def activePresentation() = _activePresentation
  
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
  
  def addAnnotation(shape: AnnotationVO) {
    _presentations.get(_activePresentation) match {
      case Some(p) => {
        p.addAnnotation(shape)
      }
      case None => // do nothing
    }    
  }
  
  def modifyText(shape: AnnotationVO) {
    _presentations.get(_activePresentation) match {
      case Some(p) => {
        p.modifyText(shape)
      }
      case None => // do nothing
    }     
  }
  
  def changePage(page: Int) {
    _presentations.get(_activePresentation) match {
      case Some(p) => {
        p.changePage(page)
      }
      case None => // do nothing
    }      
  }
  
  def history():Array[AnnotationVO] = {
    var shapes:Array[AnnotationVO] = new Array(0)
    
    _presentations.get(_activePresentation) match {
      case Some(p) => {
        shapes = p.annotations
      }
      case None => // do nothing
    }
    
    shapes
  }
  
  def clearWhiteboard() {
    _presentations.get(_activePresentation) match {
      case Some(p) => {
        p.clear()
      }
      case None => // do nothing
    }     
  }
  
  def undoWhiteboard() {
    _presentations.get(_activePresentation) match {
      case Some(p) => {
        p.undo()
      }
      case None => // do nothing
    }    
  }
  
  def setActivePresentation(presentationID: String, numPages: Int) {
    _presentations.get(presentationID) match {
      case Some(p) => {
        _activePresentation = presentationID
      }
      case None => {
        _activePresentation = presentationID
        
        val pre = new Presentation(presentationID, numPages)
        _presentations += presentationID -> pre
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