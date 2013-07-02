package org.bigbluebutton.core.apps.poll

import scala.collection.mutable.ArrayBuffer
import scala.collection.mutable.HashMap

class PollModel {

  private val polls = new HashMap[String, Poll]()
  
  createSamplePoll
  
  def createSamplePoll() {
    val r1 = new ResponseVO("0", "Answer 1")
    val r2 = new ResponseVO("1", "Answer 2")
    val r3 = new ResponseVO("2", "Answer 3")
    val r4 = new ResponseVO("3", "Answer 4")
    
    var q = new QuestionVO("q1", true, "What is my name?", Array(r1, r2, r3))
	val pvo = new PollVO("pollID-100", "sample poll", Array(q))
    
    createPoll(pvo)
		   
	respondToQuestion("pollID-100", "q1", "1", new Responder("user1", "Juan Tamad"))
	respondToQuestion("pollID-100", "q1", "0", new Responder("user2", "Asyong Aksaya"))
  }
  
  def numPolls():Int = {
    polls.size
  }
  
  def createPoll(pollVO: PollVO) {
    val questions = new ArrayBuffer[Question]    
    pollVO.questions.foreach(qv => {           
      val responses = new ArrayBuffer[Response]      
      qv.responses.foreach(rv => {
    	  val response = new Response(rv.id, rv.text)
    	  responses += response
      })      
      questions += new Question(qv.id, qv.multiResponse, qv.question, responses.toArray)
    })
       
    val poll = new Poll(pollVO.id, pollVO.title, questions.toArray)    
    polls += poll.id -> poll   
  }
  
  def updatePoll(pollVO: PollVO):Boolean = {
    var success = false    
    
    polls.get(pollVO.id) match {
      case Some(p) => {
	    val questions = new ArrayBuffer[Question]	    
	    pollVO.questions.foreach(qv => {	           
	      val responses = new ArrayBuffer[Response]	      
	      qv.responses.foreach(rv => {
	    	  val response = new Response(rv.id, rv.text)
	    	  responses += response
	      })	      
	      questions += new Question(qv.id, qv.multiResponse, qv.question, responses.toArray)
	    })
	        
	    val poll = new Poll(pollVO.id, pollVO.title, questions.toArray)	    
	    polls += poll.id -> poll    	    
	    success = true
      }
      case None => success = false
    }     
    
    success
  }
  
  def getPolls():Array[PollVO] = {
    val poll = new ArrayBuffer[PollVO]   
    polls.values.foreach(p => {     
      poll += p.toPollVO
    })
    
    poll.toArray
  }
  
  def clearPoll(pollID: String):Boolean = {
    var success = false
    polls.get(pollID) match {
      case Some(p) => {
        p.clear   
        success = true
      }
      case None => success = false
    } 
    
    success
  }
  
  def startPoll(pollID: String):Boolean = {
    var success = false
    polls.get(pollID) match {
      case Some(p) => {
        p.start
        success = true
      }
      case None => success = false
    }  
    
    success
  }
  
  def removePoll(pollID: String):Boolean = {
    var success = false
	polls.get(pollID) match {
      case Some(p) => {
        polls -= p.id
        success = true
      }
      case None => success = false
    }
    
    success
  }
  
  def stopPoll(pollID: String):Boolean = {
    var success = false
	polls.get(pollID) match {
      case Some(p) => {
        p.stop   
        success = true
      }
      case None => success = false
    } 
    
    success
  }
  
  def hasPoll(pollID: String):Boolean = {
    var present = false
	polls.get(pollID) match {
      case Some(p) => {  
        present = true
      }
      case None => present = false
    }  
    
    present
  }
  
  def getPoll(pollID: String):Option[PollVO] = {
	var poll:Option[PollVO] = None
  
    polls.get(pollID) match {
      case Some(p) => {
    	  val questions = new ArrayBuffer[QuestionVO]
    	  p.questions.foreach(q => {
    		val responses = new ArrayBuffer[ResponseVO]
    		 q.responses.foreach(response => {
    			 val r = new ResponseVO(response.id, response.response, response.getResponders)
    			 responses += r
    		 })

    		 val quest = new QuestionVO(q.id, q.multiResponse, q.question, responses.toArray)
    		 questions += quest
    	  })
    	  poll = Some(new PollVO(p.id, p.title, questions.toArray))
      }
      case None => poll = None
    }  
      
    poll
  }
  
  def respondToQuestion(pollID: String, questionID: String, responseID: String, responder: Responder) {
     polls.get(pollID) match {
      case Some(p) => {
    	  p.respondToQuestion(questionID, responseID, responder)
      }
      case None =>
    }  
  }
}