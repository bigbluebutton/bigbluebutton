package org.bigbluebutton.core.apps.poll

import scala.collection.mutable.HashMap
import QuestionType._

class Poll(val id: String, val title: String, val questions: Array[Question]) {						
	private var _active: Boolean = false
	
	def active = _active
	
	def activate():Unit = {
		_active = true;
	}

	def deactivate():Unit = {
	  _active = false;
	}
	
	def clear() {
	  
	}
	
	def hasResponses():Boolean = {
	  questions.foreach(q => {
	    if (q.hasResponders) return true
	  })
	  
	  return false
	}
	
	def respondToQuestion(questionID: String, responseID: String, userID: String, username: String) {
	  questions.foreach(q => {
	    if (q.id.equals(questionID)) {
	      q.respondToQuestion(responseID, new Responder(userID, username))
	    }
	  })  
	}
}