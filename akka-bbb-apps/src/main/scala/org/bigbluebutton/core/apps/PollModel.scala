package org.bigbluebutton.core.apps

import scala.collection.mutable.ArrayBuffer
import scala.collection.mutable.HashMap

object PollModel {
  def getRunningPollThatStartsWith(pollId: String, model: PollModel): Option[PollVO] = {
    for {
      poll <- model.polls.values find { poll => poll.id.startsWith(pollId) && poll.isRunning() }
    } yield poll.toPollVO()

  }

  def numPolls(model: PollModel): Int = {
    model.polls.size
  }

  def addPoll(poll: Poll, model: PollModel) {
    model.polls += poll.id -> poll
  }

  def hasCurrentPoll(model: PollModel): Boolean = {
    model.currentPoll != None
  }

  def getCurrentPoll(model: PollModel): Option[PollVO] = {
    model.currentPoll
  }

  def getPolls(model: PollModel): Array[PollVO] = {
    val poll = new ArrayBuffer[PollVO]
    model.polls.values.foreach(p => {
      poll += p.toPollVO
    })

    poll.toArray
  }

  def clearPoll(pollID: String, model: PollModel): Boolean = {
    var success = false
    model.polls.get(pollID) match {
      case Some(p) => {
        p.clear
        success = true
      }
      case None => success = false
    }

    success
  }

  def startPoll(pollId: String, model: PollModel) {
    model.polls.get(pollId) foreach {
      p =>
        p.start()
        model.currentPoll = Some(p.toPollVO())
    }
  }

  def removePoll(pollID: String, model: PollModel): Boolean = {
    var success = false
    model.polls.get(pollID) match {
      case Some(p) => {
        model.polls -= p.id
        success = true
      }
      case None => success = false
    }

    success
  }

  def stopPoll(pollId: String, model: PollModel) {
    model.polls.get(pollId) foreach (p => p.stop())
  }

  def hasPoll(pollId: String, model: PollModel): Boolean = {
    model.polls.get(pollId) != None
  }

  def getSimplePoll(pollId: String, model: PollModel): Option[SimplePollOutVO] = {
    var pvo: Option[SimplePollOutVO] = None
    model.polls.get(pollId) foreach (p => pvo = Some(p.toSimplePollOutVO()))
    pvo
  }

  def getSimplePollResult(pollId: String, model: PollModel): Option[SimplePollResultOutVO] = {
    var pvo: Option[SimplePollResultOutVO] = None
    model.polls.get(pollId) foreach (p => pvo = Some(p.toSimplePollResultOutVO()))
    pvo
  }

  def getPoll(pollId: String, model: PollModel): Option[PollVO] = {
    var pvo: Option[PollVO] = None
    model.polls.get(pollId) foreach (p => pvo = Some(p.toPollVO()))
    pvo
  }

  def hidePollResult(pollId: String, model: PollModel) {
    model.polls.get(pollId) foreach {
      p =>
        p.hideResult()
        model.currentPoll = None
    }
  }

  def showPollResult(pollId: String, model: PollModel) {
    model.polls.get(pollId) foreach {
      p =>
        p.showResult
        model.currentPoll = Some(p.toPollVO())
    }
  }

  def respondToQuestion(pollId: String, questionID: Int, responseID: Int, responder: Responder, model: PollModel) {
    model.polls.get(pollId) match {
      case Some(p) => {
        p.respondToQuestion(questionID, responseID, responder)
      }
      case None =>
    }
  }

}

class PollModel {

  private val polls = new HashMap[String, Poll]()

  private var currentPoll: Option[PollVO] = None

}
