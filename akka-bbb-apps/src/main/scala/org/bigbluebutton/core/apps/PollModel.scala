package org.bigbluebutton.core.apps

import scala.collection.mutable.ArrayBuffer
import scala.collection.mutable.HashMap

class PollModel {

  private val polls = new HashMap[String, Poll]()

  /**
   * *
   * Uncomment to create sample polls for manual testing purposes
   */
  //createSamplePoll

  def numPolls(): Int = {
    polls.size
  }

  def createPoll(pollVO: PollVO) {
    val questions = new ArrayBuffer[Question]
    /*   
    pollVO.questions.foreach(qv => {
      val responses = new ArrayBuffer[Answer]
      qv.responses.foreach(rv => {
        val response = new Answer(rv.id, rv.text)
        responses += response
      })
      questions += new Question(qv.id, qv.multiResponse, qv.question, responses.toArray)
    })

    val poll = new Poll(pollVO.id, pollVO.title, questions.toArray)
    polls += poll.id -> poll
   
    */
  }

  def updatePoll(pollVO: PollVO): Boolean = {
    var success = false
    /*
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
*/
    success
  }

  def getPolls(): Array[PollVO] = {
    val poll = new ArrayBuffer[PollVO]
    polls.values.foreach(p => {
      poll += p.toPollVO
    })

    poll.toArray
  }

  def clearPoll(pollID: String): Boolean = {
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

  def startPoll(pollID: String): Boolean = {
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

  def removePoll(pollID: String): Boolean = {
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

  def stopPoll(pollID: String): Boolean = {
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

  def hasPoll(pollID: String): Boolean = {
    var present = false
    polls.get(pollID) match {
      case Some(p) => {
        present = true
      }
      case None => present = false
    }

    present
  }

  def getPoll(pollID: String): Option[PollVO] = {
    var poll: Option[PollVO] = None

    /*    
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
*/
    poll
  }

  def hidePollResult(pollID: String) {
    polls.get(pollID) match {
      case Some(p) => p.hideResult
      case None => // do nothing
    }
  }

  def showPollResult(pollID: String) {
    polls.get(pollID) match {
      case Some(p) => p.showResult
      case None => // do nothing
    }
  }

  def respondToQuestion(pollID: String, questionID: String, responseID: Int, responder: Responder) {
    polls.get(pollID) match {
      case Some(p) => {
        p.respondToQuestion(questionID, responseID, responder)
      }
      case None =>
    }
  }

  /**
   * ******************************************************
   * Some pre-created polls for testing and simulation so we don't have
   * to manually generate polls when testing the UI.
   */
  /*
  def createSamplePoll() {
    addSamplePoll1()
    addSamplePoll2()
    addSamplePoll3()
  }

  def addSamplePoll1() {
    val r1 = new ResponseVO("0", "Visa")
    val r2 = new ResponseVO("1", "MasterCard")
    val r3 = new ResponseVO("2", "AmEx")
    val r4 = new ResponseVO("3", "Diners Club")

    var q = new QuestionVO("q1", false, "What type of credit card do you prefer?", Array(r1, r2, r3, r4))
    val pvo = new PollVO("pollID-101", "Preferred Credit Card", Array(q))

    createPoll(pvo)

    respondToQuestion("pollID-101", "q1", "1", new Responder("user1", "Juan Tamad"))
    respondToQuestion("pollID-101", "q1", "0", new Responder("user2", "Asyong Aksaya"))
  }

  def addSamplePoll2() {
    val r1 = new ResponseVO("0", "Visa")
    val r2 = new ResponseVO("1", "MasterCard")
    val r3 = new ResponseVO("2", "AmEx")
    val r4 = new ResponseVO("3", "Diners Club")

    var q = new QuestionVO("q1", true, "Which credit cards do you own?", Array(r1, r2, r3, r4))
    val pvo = new PollVO("pollID-102", "Owned Credit Cards", Array(q))

    createPoll(pvo)

    respondToQuestion("pollID-102", "q1", "1", new Responder("user1", "Juan Tamad"))
    respondToQuestion("pollID-102", "q1", "0", new Responder("user2", "Asyong Aksaya"))
  }

  def addSamplePoll3() {
    val r1 = new ResponseVO("0", "Dumaguete")
    val r2 = new ResponseVO("1", "Cebu")
    val r3 = new ResponseVO("2", "Zamboanga")
    val r4 = new ResponseVO("3", "None of the above")

    var q = new QuestionVO("q1", true, "What is the capital of the Philippines?", Array(r1, r2, r3, r4))
    val pvo = new PollVO("pollID-103", "Philippine Capital", Array(q))

    createPoll(pvo)

    respondToQuestion("pollID-103", "q1", "1", new Responder("user1", "Juan Tamad"))
    respondToQuestion("pollID-103", "q1", "0", new Responder("user2", "Asyong"))
    respondToQuestion("pollID-103", "q1", "2", new Responder("user3", "Pedro"))
    respondToQuestion("pollID-103", "q1", "3", new Responder("user4", "Aksaya"))
  }
  */

}