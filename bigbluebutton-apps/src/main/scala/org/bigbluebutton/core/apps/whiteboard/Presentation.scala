package org.bigbluebutton.core.apps.whiteboard

import scala.collection.mutable.HashMap

class Presentation(presentationID: String, numPages: Int) {
  
	private val _pages = new HashMap[Int, Page]()	
	private var _curPage = 1;
	
	for (i <- 1 to numPages) {
	  val page = new Page(i)
	  _pages += i -> page
	}
	
	def addAnnotation(shape: Map[String, Object]) {
	  _pages.get(_curPage) match {
	    case Some(p) => {
	      p.addShape(shape)
	    }
	    case None => // do nothing
	  }
	}
	
	def modifyText(shape: Map[String, Object]) {
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
	
	
}