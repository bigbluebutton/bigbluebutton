package org.bigbluebutton.core.apps.whiteboard

import scala.collection.mutable.HashMap

class Presentation(presentationID: String, numPages: Int) {
  
	private val _pages = new HashMap[String, Page]()
	
	private var _curPage: String = "";
	
	
	
}