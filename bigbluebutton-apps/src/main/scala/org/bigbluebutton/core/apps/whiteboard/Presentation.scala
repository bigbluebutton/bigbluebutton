package org.bigbluebutton.core.apps.whiteboard

import scala.collection.mutable.HashMap
import org.bigbluebutton.core.apps.whiteboard.vo.AnnotationVO
import scala.collection.mutable.ArrayBuffer

class Presentation(val presentationID: String, val numPages: Int) {
  
	private val _pages = new HashMap[Int, Page]()	
	private var _curPage = 1;
	
	for (i <- 1 to numPages) {
	  val page = new Page(i)
	  _pages += i -> page
	}
	
	
	def addAnnotation(shape: AnnotationVO) {
	  _pages.get(_curPage) match {
	    case Some(p) => {
	      p.addAnnotation(shape)
	    }
	    case None => // do nothing
	  }
	}
	
	def modifyText(shape: AnnotationVO) {
	  _pages.get(_curPage) match {
	    case Some(p) => {
	      p.modifyText(shape)
	    }
	    case None => // do nothing
	  }	  
	}
	
	def changePage(page: Int) {
	  _curPage = page
	}
	
	def clear() {
	  _pages.get(_curPage) match {
	    case Some(p) => {
	      p.clear()
	    }
	    case None => // do nothing
	  }	  
	}
	
	def undo() {
	  _pages.get(_curPage) match {
	    case Some(p) => {
	      p.undo()
	    }
	    case None => // do nothing
	  }	  
	}
	
	def annotations():Array[AnnotationVO] = {
	  var shapes:Array[AnnotationVO] = new Array(0)
	  
	  _pages.get(_curPage) match {
	    case Some(p) => {
	      shapes = p.getAnnotations
	    }
	    case None => // do nothing
	  }	
	  
	  shapes
	}
}