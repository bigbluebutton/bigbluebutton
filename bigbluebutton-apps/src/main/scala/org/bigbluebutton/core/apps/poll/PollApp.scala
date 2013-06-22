package org.bigbluebutton.core.apps.poll

import scala.collection.mutable.HashMap
import org.bigbluebutton.core.api.InMessage
import org.bigbluebutton.core.api.MessageOutGateway
import scala.collection.mutable.ArrayBuffer

class PollApp(meetingID: String, recorded: Boolean, outGW: MessageOutGateway) {
  import org.bigbluebutton.core.apps.poll.messages._
  
  private val polls = new HashMap[String, Poll]()
	
  def handleMessage(msg: InMessage):Unit = {
    msg match {
      case createPoll: CreatePoll => handleCreatePoll(createPoll)
      case updatePoll: UpdatePoll => handleUpdatePoll(updatePoll)
      case destroyPoll: DestroyPoll => handleDestroyPoll(destroyPoll)
      case removePoll: RemovePoll => handleRemovePoll(removePoll)
      case sharePoll: SharePoll => handleSharePoll(sharePoll)
      case stopPoll: StopPoll => handleStopPoll(stopPoll)
      case startPoll: StartPoll => handleStartPoll(startPoll)
      case clearPoll: ClearPoll => handleClearPoll(clearPoll)
      case getPolls: GetPolls => handleGetPolls(getPolls)
    }    
  }
  
  private def handleGetPolls(msg: GetPolls) {
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
    
    outGW.send(new GetPollsReplyOutMsg(meetingID, recorded, msg.requesterID, poll.toArray))
  }
  
  private def handleClearPoll(msg: ClearPoll) {
    polls.get(msg.pollID) match {
      case None => // send poll not found message
      case Some(p) => {
        p.clear
        outGW.send(new PollClearedOutMsg(meetingID, recorded, msg.pollID))
      }
    }
  }
  
  private def handleStartPoll(msg: StartPoll) {
    polls.get(msg.pollID) match {
      case None => // send poll not found message
      case Some(p) => {
        p.activate
        outGW.send(new PollStartedOutMsg(meetingID, recorded, msg.pollID))
      }
    }    
  }
  
  private def handleStopPoll(msg: StopPoll) {
    polls.get(msg.pollID) match {
      case None => // send poll not found message
      case Some(p) => {
        p.deactivate
        outGW.send(new PollStoppedOutMsg(meetingID, recorded, msg.pollID))
      }
    }     
  }
  
  private def handleSharePoll(msg: SharePoll) {
    
  }
  
  private def handleRemovePoll(msg: RemovePoll) {
    polls.get(msg.pollID) match {
      case None => // send poll not found message
      case Some(p) => {
        polls -= p.id
        outGW.send(new PollRemovedOutMsg(meetingID, recorded, msg.pollID))
      }
    }     
  }
  
  private def handleDestroyPoll(msg: DestroyPoll) {
    
  }
  
  private def handleUpdatePoll(msg: UpdatePoll) {
	polls.get(msg.poll.id) match {
      case None => // send poll not found message
      case Some(p) => {
	    val pollVO = msg.poll
	    
	    val questions = new ArrayBuffer[Question]
	    
	    pollVO.questions.foreach(qv => {
	           
	      val responses = new ArrayBuffer[Response]
	      
	      qv.responses.foreach(rv => {
	    	  val response = new Response(rv.id, rv.text)
	    	  responses += response
	      })
	      
	      questions += new Question(qv.id, qv.multiResponse, qv.question, responses.toArray)
	    })
	        
	    val poll = new Poll(msg.poll.id, msg.poll.title, questions.toArray)
	    
	    polls += poll.id -> poll    
	    
	    outGW.send(new PollUpdatedOutMsg(meetingID, recorded, poll.id, pollVO))
      }
    } 
  }
  
  private def handleCreatePoll(msg: CreatePoll) {
    val pollVO = msg.poll
    
    val questions = new ArrayBuffer[Question]
    
    pollVO.questions.foreach(qv => {
           
      val responses = new ArrayBuffer[Response]
      
      qv.responses.foreach(rv => {
    	  val response = new Response(rv.id, rv.text)
    	  responses += response
      })
      
      questions += new Question(qv.id, qv.multiResponse, qv.question, responses.toArray)
    })
       
    val poll = new Poll(msg.poll.id, msg.poll.title, questions.toArray)
    
    polls += poll.id -> poll
    
    outGW.send(new PollCreatedOutMsg(meetingID, recorded, poll.id, pollVO))
  }
}