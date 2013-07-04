package org.bigbluebutton.core.apps.poll

import scala.collection.mutable.HashMap
import scala.collection.mutable.ArrayBuffer

case class QuestionResponsesVO(val questionID:String, val responseIDs:Array[String])
case class PollResponseVO(val pollID: String, val responses: Array[QuestionResponsesVO])
case class ResponderVO(responseID: String, user: Responder)

case class ResponseVO(id: String, text: String, responders: Array[Responder] = Array[Responder]())
case class QuestionVO(id: String, multiResponse: Boolean, question: String, responses: Array[ResponseVO])
case class PollVO(id: String, title: String, questions: Array[QuestionVO])

case class Responder(val userID: String, name: String)

case class ResponseOutVO(id: String, text: String, responders: Array[Responder] = Array[Responder]())
case class QuestionOutVO(id: String, multiResponse: Boolean, question: String, responses: Array[ResponseOutVO])
case class PollOutVO(id: String, title: String, started: Boolean, stopped: Boolean, questions: Array[QuestionOutVO])


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
	
	def respondToQuestion(questionID: String, responseID: String, responder: Responder) {
	  questions.foreach(q => {
	    if (q.id.equals(questionID)) {
	      q.respondToQuestion(responseID, responder)
	    }
	  })  
	}
	
	def toPollVO():PollVO = {
      val qvos = new ArrayBuffer[QuestionVO]
      questions.foreach(q => {
        qvos += q.toQuestionVO
      })
     
      new PollVO(id, title, qvos.toArray)	  
	}
}

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
  
  def respondToQuestion(id: String, responder: Responder) {
	responses.foreach(r => {
	  if (r.id == id) r.addResponder(responder)
	})	  
  }
  
  def toQuestionVO():QuestionVO = {
	val rvos = new ArrayBuffer[ResponseVO]
    responses.foreach(response => {
          val r = new ResponseVO(response.id, response.response, response.getResponders)
          rvos += r
    })

    new QuestionVO(id, multiResponse, question, rvos.toArray)    
  }
}

class Response(val id: String, val response: String) {

  val responders = new ArrayBuffer[Responder]()
  
  def clear() {
    responders.clear
  }
  def addResponder(responder: Responder) {
	responders += responder
  }
  
  def numResponders():Int = {
    responders.length;
  }
  
  def getResponders():Array[Responder] = {
    var r = new Array[Responder](responders.length)
    responders.copyToArray(r)
    return r
  }
}