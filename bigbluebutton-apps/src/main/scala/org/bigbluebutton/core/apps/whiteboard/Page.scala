package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.apps.whiteboard.messages.Annotation
import scala.collection.mutable.HashMap
import scala.collection.mutable.ArrayBuffer

class Page(val pageNum: Int) {
  val annotations = new HashMap[String, Annotation]()
  
  def addAnnotation(shape: Annotation) {
    annotations += shape.id -> shape
  }
  
  def removeAnnotation(id: String) {
    annotations.get(id) match {
      case Some(a) => annotations -= id
      case None => // don nothing      
    }
  }
  
  def getAnnotations():Array[Annotation] = {
    val poll = new ArrayBuffer[Annotation]   
    annotations.values.foreach(p => {     
      poll += p
    })
    
    poll.toArray    
  }
}