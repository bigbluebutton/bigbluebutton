package org.bigbluebutton.core.apps.poll


class Question(val id: String, val multiResponse: Boolean, val question: String, val responses: Array[Response]) {
  
  def clear() {
	  responses.foreach(r => r.clear)
  }
  
  def hasResponders():Boolean = {
	responses.foreach(r => {
	  if (r.numResponders > 0) return true
	})
	
	return false
  }
  
  def respondToQuestion(id: String, resp: Responder) {

  }
  
}