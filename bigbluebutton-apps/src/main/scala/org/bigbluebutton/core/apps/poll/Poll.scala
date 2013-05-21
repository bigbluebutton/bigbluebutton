package org.bigbluebutton.core.apps.poll

import scala.collection.mutable.HashMap
import QuestionType._

class Poll(val title: String, id: String) {						
	private var _active: Boolean = false
	private var questions = new HashMap[Int, Question]()
	
	
	def active = _active
	
	def activate():Unit = {
		_active = true;
	}

	def deactivate():Unit = {
	  _active = false;
	}
	
	def addQuestion(id: Int, questionType: QuestionType, question: String) {
	  questions += id -> new Question(id, questionType, question)
	}
	
	def deleteQuestion(id: Int) {
	  questions -= id
	}
	
	def addResponse(questionID: Int, responseID: Int, responseText: String) {
		questions.get(questionID) match {
		  case Some(q) => q.addResponse(new Response(responseID, responseText))
		  case None => // do nothing
		}
	}
	
	def deleteResponse(questionID: Int, responseID: Int) {
	  questions.get(questionID) match {
		case Some(q) => q.deleteResponse(responseID)
		case None => // do nothing
	  }
	}
	
	def respondToQuestion(questionID: Int, responseID: Int, userID: String, username: String):Unit = {
	  questions.get(questionID) match {
		case Some(q) => q.respondToQuestion(responseID, new Responder(userID, username))
		case None => // do nothing
	  }	  
	}
}