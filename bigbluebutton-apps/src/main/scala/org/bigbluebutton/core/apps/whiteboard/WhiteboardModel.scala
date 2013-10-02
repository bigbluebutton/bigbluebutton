package org.bigbluebutton.core.apps.whiteboard

import scala.collection.mutable.HashMap

class WhiteboardModel {

  private val _presentations = new HashMap[String, Presentation]()
  private var _activePresentation = ""
  private var _enabled = true
  
  def addAnnotation(shape: Map[String, Object]) {
    _presentations.get(_activePresentation) match {
      case Some(p) => {
        p.addAnnotation(shape)
      }
      case None => // do nothing
    }    
  }
  
  def modifyText(shape: Map[String, Object]) {
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