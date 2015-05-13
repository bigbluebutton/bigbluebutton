package org.bigbluebutton.core.apps.poll

import com.google.gson.Gson
import com.google.gson.JsonParser
import org.bigbluebutton.core.util.RandomStringGenerator._
import scala.collection.mutable.ArrayBuffer

class PollMessageConverter {

  def convertPreCreatedPollMessage(msg: String): PollVO = {
    val gson = new Gson();
    val parser = new JsonParser();
    val obj = parser.parse(msg).getAsJsonObject();
    val title = gson.fromJson(obj.get("title"), classOf[String]);

    val question = gson.fromJson(obj.get("question"), classOf[String]);
    val qType = gson.fromJson(obj.get("questionType"), classOf[String])

    val cvoArray = ArrayBuffer[QuestionVO]()

    val responses = obj.get("answers").getAsJsonArray();

    val rvoArray = ArrayBuffer[ResponseVO]()

    var j = 0
    val respIter = responses.iterator()
    while (respIter.hasNext()) {
      val response = gson.fromJson(respIter.next(), classOf[String]);

      rvoArray += new ResponseVO(j.toString, response)

      j += 1
    }

    val questionType = if (qType.equalsIgnoreCase(QuestionType.MULTI_CHOICE.toString())) true else false

    cvoArray += new QuestionVO(0.toString, questionType, question, rvoArray.toArray)

    new PollVO(randomAlphanumericString(12), title, cvoArray.toArray)

  }

  def convertCreatePollMessage(msg: String): PollVO = {
    val gson = new Gson();
    val parser = new JsonParser();
    val obj = parser.parse(msg).getAsJsonObject();
    val title = gson.fromJson(obj.get("title"), classOf[String]);

    val questions = obj.get("questions").getAsJsonArray();
    val cvoArray = ArrayBuffer[QuestionVO]()

    val iter = questions.iterator()
    var i = 0
    while (iter.hasNext()) {
      val aquestion = iter.next().getAsJsonObject();
      val questionText = gson.fromJson(aquestion.get("question"), classOf[String])

      val qType = gson.fromJson(aquestion.get("questionType"), classOf[String])

      val responses = aquestion.get("responses").getAsJsonArray();

      val rvoArray = ArrayBuffer[ResponseVO]()

      var j = 0
      val respIter = responses.iterator()
      while (respIter.hasNext()) {
        val response = gson.fromJson(respIter.next(), classOf[String]);

        rvoArray += new ResponseVO(j.toString, response)

        j += 1
      }

      val questionType = if (!qType.equalsIgnoreCase(QuestionType.MULTI_CHOICE.toString())) true else false

      cvoArray += new QuestionVO(i.toString, questionType, questionText, rvoArray.toArray)

      i += 1
    }

    new PollVO(randomAlphanumericString(12), title, cvoArray.toArray)

  }

  def convertUpdatePollMessage(msg: String): PollVO = {
    val gson = new Gson();
    val parser = new JsonParser();
    val obj = parser.parse(msg).getAsJsonObject();
    val title = gson.fromJson(obj.get("title"), classOf[String]);
    val pollID = gson.fromJson(obj.get("id"), classOf[String]);

    val questions = obj.get("questions").getAsJsonArray();

    val cvoArray = ArrayBuffer[QuestionVO]()

    val iter = questions.iterator()
    var i = 0
    while (iter.hasNext()) {
      val aquestion = iter.next().getAsJsonObject();
      val questionText = gson.fromJson(aquestion.get("question"), classOf[String])

      val responses = aquestion.get("responses").getAsJsonArray();

      val rvoArray = ArrayBuffer[ResponseVO]()

      var j = 0
      val respIter = responses.iterator()
      while (respIter.hasNext()) {
        val response = respIter.next().getAsJsonObject()

        // Get the old response id
        val oldRespID = gson.fromJson(response.get("id"), classOf[String])
        // if the old response id is empty, then this is a new answer, create a new id
        val respID = if (oldRespID == "") j.toString() else oldRespID
        val respText = gson.fromJson(response.get("response"), classOf[String])

        rvoArray += new ResponseVO(respID, respText)

        j += 1
      }

      val qType = gson.fromJson(aquestion.get("questionType"), classOf[String])
      val qID = gson.fromJson(aquestion.get("id"), classOf[String])
      val questionType = if (qType.equalsIgnoreCase(QuestionType.MULTI_CHOICE.toString())) true else false

      cvoArray += new QuestionVO(qID, questionType, questionText, rvoArray.toArray)

      i += 1
    }

    new PollVO(pollID, title, cvoArray.toArray)
  }

  def convertStartPollMessage(msg: String): String = {
    val gson = new Gson();
    val parser = new JsonParser();
    val obj = parser.parse(msg).getAsJsonObject();
    val pollID = gson.fromJson(obj.get("pollID"), classOf[String]);

    pollID
  }

  def convertStopPollMessage(msg: String): String = {
    val gson = new Gson();
    val parser = new JsonParser();
    val obj = parser.parse(msg).getAsJsonObject();
    val pollID = gson.fromJson(obj.get("pollID"), classOf[String]);

    pollID
  }

  def convertRemovePollMessage(msg: String): String = {
    val gson = new Gson();
    val parser = new JsonParser();
    val obj = parser.parse(msg).getAsJsonObject();
    val pollID = gson.fromJson(obj.get("pollID"), classOf[String]);

    pollID
  }

  def convertTakePollMessage(msg: String): PollResponseVO = {
    val gson = new Gson();
    val parser = new JsonParser();
    val obj = parser.parse(msg).getAsJsonObject();
    val pollID = gson.fromJson(obj.get("pollID"), classOf[String]);
    val questions = obj.get("questions").getAsJsonArray();

    val qVO = ArrayBuffer[QuestionResponsesVO]();

    val iter = questions.iterator()
    while (iter.hasNext()) {
      val aquestion = iter.next().getAsJsonObject();
      val questionID = gson.fromJson(aquestion.get("questionID"), classOf[String])

      val responses = aquestion.get("responseIDs").getAsJsonArray();

      val rvoArray = ArrayBuffer[String]()

      val respIter = responses.iterator()
      while (respIter.hasNext()) {
        val response = gson.fromJson(respIter.next(), classOf[String]);
        rvoArray += response
      }

      qVO += new QuestionResponsesVO(questionID, rvoArray.toArray)
    }

    new PollResponseVO(pollID, qVO.toArray)
  }
}