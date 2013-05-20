package org.bigbluebutton.core.apps.poll

import scala.collection.mutable.HashMap

class Question(val id: String, val question: String) {

  private val responses = new HashMap[String, Response]()
  
  def addResponse(resp: Response):Unit = {
    responses.get(resp.id) match {
    	case None => {
		 responses += resp.id -> resp   
    	}
    }
  }
  
  def getResponses():Array[Response] = {
	var r = new Array[Response](responses.size)
	responses.values.copyToArray(r)  
	return r
  }
	 
 
}