package org.bigbluebutton.core.apps

import scala.collection.immutable.HashMap
import scala.collection.immutable.Set
import scala.util.Random
import org.bigbluebutton.SystemConfiguration

case class Question(
    questionId: String,
    userName:   String,
    text:       String,
    timestamp:  Long
) {
  private var approved: Boolean = false
  private var answered: Boolean = false
  private var upvoters: Set[String] = Set[String]()
  private var answerText: String = ""

  def setApproved(): Boolean = {
    approved = !approved
    approved
  }

  def setAnswered(): Boolean = {
    answered = true
    answered
  }

  def setAnswerText(value: String): Unit = {
    answerText = value
  }

  def getNumUpvotes(): Int = {
    upvoters.size
  }

  def upvoted(upvoterId: String): Boolean = {
    upvoters contains upvoterId
  }

  def addUpvoter(upvoterId: String): Unit = {
    upvoters += upvoterId;
  }

  def removeUpvoter(upvoterId: String): Unit = {
    upvoters -= upvoterId;
  }

  def getApproved(): Boolean = {
    approved
  }
}

object QuestionsModel {
  def createQuestion(
      model:     QuestionsModel,
      userName:  String,
      text:      String,
      timestamp: Long
  ): String = {
    val questionId: String = Random.alphanumeric.take(12).mkString
    val question: Question = new Question(questionId, userName, text, timestamp)
    model.questions += questionId -> question
    if (model.autoApprove) {
      question.setApproved()
    }
    questionId
  }

  def deleteQuestion(
      model:      QuestionsModel,
      questionId: String
  ): Unit = {
    model.questions - questionId
  }

  def getQuestion(
      model:      QuestionsModel,
      questionId: String
  ): Option[Question] = {
    model.questions.get(questionId)
  }

  def getAutoApproveQuestions(
      model:      QuestionsModel,
  ): Boolean = {
    model.autoApprove
  }

  def setAutoApproveQuestions(
      model:      QuestionsModel,
      autoApprove: Boolean
  ): Unit = {
    model.autoApprove = autoApprove
  }
}

class QuestionsModel extends SystemConfiguration {
  private var questions: HashMap[String, Question] = new HashMap[String, Question]()
  private var autoApprove: Boolean = questionsAutoApproveDefault;
}