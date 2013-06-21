package org.bigbluebutton.core.apps.poll

import org.testng.annotations.BeforeClass
import org.testng.annotations.Test
import org.bigbluebutton.core.apps.poll.messages.PollVO
import com.google.gson.Gson
import com.google.gson.JsonParser
import org.bigbluebutton.core.apps.poll.messages.QuestionVO
import org.bigbluebutton.core.apps.poll.messages.ResponseVO
import org.bigbluebutton.core.util.RandomStringGenerator._
import scala.collection.mutable.ArrayBuffer

class PollMessageConverterTest {
  
	 @BeforeClass
	 def setUp() {
	   // code that will be invoked when this test is instantiated
	 }
	 
	 @Test(groups = Array[String]( "unit" ))
	 def convertCreatePollMessageTest(){
		val msg = "{\"title\":\"My sample poll\",\"questions\":[{\"type\":\"MULTI_CHOICE\",\"responses\":[\"Answer 1\",\"Answer 2\",\"Answer 3\"],\"question\":\"What is my name?\"}]}";

		val cut = new PollMessageConverter
		val pvp = cut.convertCreatePollMessage(msg)
		
		assert(pvp.title.equals("My sample poll"), "Title not the same.")
		assert(pvp.questions.length == 1, "Number of questions is wrong. Must be [" + pvp.questions.length + "]")
		assert(pvp.questions(0).question.equals("What is my name?"), "First questions is [" + pvp.questions(0).question + "]")
	}
	
	 @Test(groups = Array[String]( "unit" ))
	 def convertCreatePollMessage() {
   		val msg = "{\"title\":\"My sample poll\",\"questions\":[{\"type\":\"MULTI_CHOICE\",\"responses\":[\"Answer 1\",\"Answer 2\",\"Answer 3\"],\"question\":\"What is my name?\"}]}";

   		val gson = new Gson();
		val parser = new JsonParser();
		val obj = parser.parse(msg).getAsJsonObject();
		val title = gson.fromJson(obj.get("title"), classOf[String]);

		val questions = obj.get("questions").getAsJsonArray();

		assert(questions.size() == 1, "Number of questions = [" + questions.size() + "]")
		
		val cvoArray = ArrayBuffer[QuestionVO]()

		val iter = questions.iterator()
		var i = 0
		while(iter.hasNext()) {
			val aquestion = iter.next().getAsJsonObject();
			val questionText = gson.fromJson(aquestion.get("question"), classOf[String])
			
			assert(questionText.equals("What is my name?"), "Questions text is = [" + questionText + "]")
			
			val qType = gson.fromJson(aquestion.get("type"), classOf[String])

			val responses = aquestion.get("responses").getAsJsonArray();
			
			assert(responses.size() == 3, "Number of responses = [" + responses.size() + "]")
			val rvoArray = ArrayBuffer[ResponseVO]()

			var j = 0
			val respIter = responses.iterator()
			while(respIter.hasNext()) {
				val response = gson.fromJson(respIter.next(), classOf[String]);

				rvoArray += new ResponseVO(j.toString, response)

				j += 1
			}		

			val questionType = if (qType.equalsIgnoreCase(QuestionType.MULTI_CHOICE.toString())) QuestionType.MULTI_CHOICE else QuestionType.MULTI_REPONSE

			cvoArray += new QuestionVO(i.toString, questionType, questionText, rvoArray.toArray)

			i += 1
		}

		assert(cvoArray.length == 1, "Number of questions = [" + cvoArray.length + "]")
		
		val pvp = new PollVO(randomAlphanumericString(12), title, cvoArray.toArray)	
			 
		assert(pvp.title.equals("My sample poll"), "Title not the same.")
		assert(pvp.questions.length == 1, "Number of questions is wrong. Must be [" + pvp.questions.length + "]")
	 }
}