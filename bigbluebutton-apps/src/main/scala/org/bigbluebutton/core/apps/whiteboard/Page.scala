package org.bigbluebutton.core.apps.whiteboard

import scala.collection.mutable.ArrayBuffer

class Page(val pageNum: Int) {
  import org.bigbluebutton.core.apps.whiteboard.vo._
  
  private var annotations = new scala.collection.immutable.HashMap[String, AnnotationVO]()
  private var _lastAnnotationID: String = _
  
  def addAnnotation(shape: AnnotationVO) {
    _lastAnnotationID = shape.id
    annotations += shape.id -> shape
  }
  
  def removeAnnotation(id: String) {
    annotations.get(id) match {
      case Some(a) => annotations -= id
      case None => // do nothing      
    }
  }
  
  def getAnnotations():Array[AnnotationVO] = {
    val shapes = new ArrayBuffer[AnnotationVO]   
    annotations.values.foreach(p => {     
      shapes += p
    })
    
    shapes.toArray    
  }
  
  def undo() {
    
  }
  
  def clear() {
    annotations = new scala.collection.immutable.HashMap[String, AnnotationVO]()
  }
  
  def modifyText(shape: AnnotationVO) {
    annotations.get(shape.id) match {
      case Some(a) => annotations += shape.id -> shape
      case None => // do nothing      
    }    
  }

}