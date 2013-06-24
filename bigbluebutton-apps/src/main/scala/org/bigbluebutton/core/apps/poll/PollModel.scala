package org.bigbluebutton.core.apps.poll

import org.bigbluebutton.core.apps.poll.messages.PollVO
import scala.collection.mutable.ArrayBuffer
import scala.collection.mutable.HashMap
import org.bigbluebutton.core.apps.poll.messages.QuestionVO
import org.bigbluebutton.core.apps.poll.messages.ResponseVO

class PollModel {

  private val polls = new HashMap[String, Poll]()
  
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
      val questions = new ArrayBuffer[QuestionVO]
      p.questions.foreach(q => {
        val responses = new ArrayBuffer[ResponseVO]
        q.responses.foreach(response => {
          val r = new ResponseVO(response.id, response.response)
          responses += r
        })

        val quest = new QuestionVO(q.id, q.multiResponse, q.question, responses.toArray)
        questions += quest
      })
     
      poll += new PollVO(p.id, p.title, questions.toArray)
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
    			 val r = new ResponseVO(response.id, response.response)
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
    
  }
}