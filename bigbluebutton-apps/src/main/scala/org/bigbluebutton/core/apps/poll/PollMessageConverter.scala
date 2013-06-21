package org.bigbluebutton.core.apps.poll

import org.bigbluebutton.core.apps.poll.messages.PollVO
import com.google.gson.Gson
import com.google.gson.JsonParser
import org.bigbluebutton.core.apps.poll.messages.QuestionVO
import org.bigbluebutton.core.apps.poll.messages.ResponseVO
import org.bigbluebutton.core.util.RandomStringGenerator._

class PollMessageConverter {

  def convertCreatePollMessage(msg:String):PollVO = {
	val gson = new Gson();
	val parser = new JsonParser();
	val obj = parser.parse(msg).getAsJsonObject();
	val title = gson.fromJson(obj.get("title"), classOf[String]);
		
	val questions = obj.get("questions").getAsJsonArray();
	
	var cvoArray = Array[QuestionVO]()
	
	var i = 0
	for (i <- 0 to questions.size() - 1) {
		val aquestion = questions.get(i).getAsJsonObject();
		val questionText = gson.fromJson(aquestion.get("question"), classOf[String])
		val qType = gson.fromJson(aquestion.get("type"), classOf[String])
			
		val responses = aquestion.get("responses").getAsJsonArray();
		val rvoArray = Array[ResponseVO]()
		
		var j = 0
		for (j  <- 0 to responses.size() - 1) {
			val response = gson.fromJson(responses.get(0), classOf[String]);
				rvoArray :+ new ResponseVO(j.toString, response)
		}		
		
		val questionType = if (qType.equalsIgnoreCase(QuestionType.MultiChoice.toString())) QuestionType.MultiChoice else QuestionType.MultiResponse
		
		cvoArray :+ new QuestionVO(i.toString, questionType, questionText, rvoArray)
	}
	
	new PollVO(randomAlphanumericString(12), title, cvoArray)	
  }
  

}