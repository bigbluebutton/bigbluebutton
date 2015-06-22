package org.bigbluebutton.core.apps

import scala.collection.mutable.ArrayBuffer
import scala.collection.mutable.HashMap

class PollModel {

  private val polls = new HashMap[String, Poll]()

  private var currentPoll: Option[PollVO] = None

  /**
   * *
   * Uncomment to create sample polls for manual testing purposes
   */
  //createSamplePoll

  def numPolls(): Int = {
    polls.size
  }

  def addPoll(poll: Poll) {
    polls += poll.id -> poll
  }

  def hasCurrentPoll(): Boolean = {
    currentPoll != None
  }

  def getCurrentPoll(): Option[PollVO] = {
    currentPoll
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

  def startPoll(pollId: String) {
    polls.get(pollId) foreach {
      p =>
        p.start()
        currentPoll = Some(p.toPollVO())
    }
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

  def stopPoll(pollId: String) {
    polls.get(pollId) foreach (p => p.stop())
  }

  def hasPoll(pollId: String): Boolean = {
    polls.get(pollId) != None
  }

  def getSimplePoll(pollId: String): Option[SimplePollOutVO] = {
    var pvo: Option[SimplePollOutVO] = None
    polls.get(pollId) foreach (p => pvo = Some(p.toSimplePollOutVO()))
    pvo
  }

  def getSimplePollResult(pollId: String): Option[SimplePollResultOutVO] = {
    var pvo: Option[SimplePollResultOutVO] = None
    polls.get(pollId) foreach (p => pvo = Some(p.toSimplePollResultOutVO()))
    pvo
  }

  def getPoll(pollId: String): Option[PollVO] = {
    var pvo: Option[PollVO] = None
    polls.get(pollId) foreach (p => pvo = Some(p.toPollVO()))
    pvo
  }

  def hidePollResult(pollId: String) {
    polls.get(pollId) foreach {
      p =>
        p.hideResult()
        currentPoll = None
    }
  }

  def showPollResult(pollId: String) {
    polls.get(pollId) foreach {
      p =>
        p.showResult
        currentPoll = Some(p.toPollVO())
    }
  }

  def respondToQuestion(pollId: String, questionID: Int, responseID: Int, responder: Responder) {
    polls.get(pollId) match {
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