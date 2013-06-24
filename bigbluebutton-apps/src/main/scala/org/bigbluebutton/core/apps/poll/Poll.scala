package org.bigbluebutton.core.apps.poll

import scala.collection.mutable.HashMap
import QuestionType._

class Poll(val id: String, val title: String, val questions: Array[Question]) {						
	private var started: Boolean = false
	private var stopped: Boolean = false
	
	def start() {
		started = true;
	}

	def stop() {
	  stopped = true;
	}
	
	def isStarted():Boolean = {
	  return started
	}
	
	def isStopped():Boolean = {
	  return stopped
	}
	
	def clear() {
	  questions.foreach(q => {
	    q.clear
	  })	
	  
	  started = false
	  stopped = false
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