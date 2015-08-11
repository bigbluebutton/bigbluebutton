package org.bigbluebutton.core.apps

import scala.collection.mutable.ArrayBuffer
import scala.collection.mutable.HashMap

class PollModel {

  private val polls = new HashMap[String, Poll]()

  private var currentPoll: Option[PollVO] = None

  def getRunningPollThatStartsWith(pollId: String): Option[PollVO] = {
    for {
      poll <- polls.values find { poll => poll.id.startsWith(pollId) && poll.isRunning() }
    } yield poll.toPollVO()

  }

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

}