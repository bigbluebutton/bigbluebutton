package org.bigbluebutton.core.apps.poll

import com.google.gson.Gson
import com.google.gson.JsonParser
import org.bigbluebutton.core.util.RandomStringGenerator._
import scala.collection.mutable.ArrayBuffer

class PollMessageConverter {

  def convertCreatePollMessage(msg:String):PollVO = {
   		val gson = new Gson();
		val parser = new JsonParser();
		val obj = parser.parse(msg).getAsJsonObject();
		val title = gson.fromJson(obj.get("title"), classOf[String]);

		val questions = obj.get("questions").getAsJsonArray();
		val cvoArray = ArrayBuffer[QuestionVO]()

		val iter = questions.iterator()
		var i = 0
		while(iter.hasNext()) {
			val aquestion = iter.next().getAsJsonObject();
			val questionText = gson.fromJson(aquestion.get("question"), classOf[String])
					
			val qType = gson.fromJson(aquestion.get("questionType"), classOf[String])

			val responses = aquestion.get("responses").getAsJsonArray();
			
			val rvoArray = ArrayBuffer[ResponseVO]()

			var j = 0
			val respIter = responses.iterator()
			while(respIter.hasNext()) {
				val response = gson.fromJson(respIter.next(), classOf[String]);

				rvoArray += new ResponseVO(j.toString, response)

				j += 1
			}		

			val questionType = if (qType.equalsIgnoreCase(QuestionType.MULTI_CHOICE.toString())) true else false

			cvoArray += new QuestionVO(i.toString, questionType, questionText, rvoArray.toArray)

			i += 1
		}
		
		new PollVO(randomAlphanumericString(12), title, cvoArray.toArray)
		
		// Hardocde for now for testing
		//new PollVO("pollID", title, cvoArray.toArray)
  }
  
  def convertUpdatePollMessage(msg:String):PollVO = {
   		val gson = new Gson();
		val parser = new JsonParser();
		val obj = parser.parse(msg).getAsJsonObject();
		val title = gson.fromJson(obj.get("title"), classOf[String]);
		val pollID = gson.fromJson(obj.get("id"), classOf[String]);
		
		val questions = obj.get("questions").getAsJsonArray();
		
		val cvoArray = ArrayBuffer[QuestionVO]()

		val iter = questions.iterator()
		var i = 0
		while(iter.hasNext()) {
			val aquestion = iter.next().getAsJsonObject();
			val questionText = gson.fromJson(aquestion.get("question"), classOf[String])
									
			val responses = aquestion.get("responses").getAsJsonArray();
			
			val rvoArray = ArrayBuffer[ResponseVO]()

			var j = 0
			val respIter = responses.iterator()
			while(respIter.hasNext()) {
				val response = respIter.next().getAsJsonObject()
				
				val respID = gson.fromJson(response.get("id"), classOf[String])
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
  
  def convertStartPollMessage(msg: String):String = {
   		val gson = new Gson();
		val parser = new JsonParser();
		val obj = parser.parse(msg).getAsJsonObject();
		val pollID = gson.fromJson(obj.get("pollID"), classOf[String]);   
		
		pollID
  }
  
  def convertStopPollMessage(msg: String):String = {
   		val gson = new Gson();
		val parser = new JsonParser();
		val obj = parser.parse(msg).getAsJsonObject();
		val pollID = gson.fromJson(obj.get("pollID"), classOf[String]);   
		
		pollID
  }
    
  def convertRemovePollMessage(msg: String):String = {
   		val gson = new Gson();
		val parser = new JsonParser();
		val obj = parser.parse(msg).getAsJsonObject();
		val pollID = gson.fromJson(obj.get("pollID"), classOf[String]);   
		
		pollID
  }
}