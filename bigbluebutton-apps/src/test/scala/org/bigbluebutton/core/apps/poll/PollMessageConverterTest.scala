package org.bigbluebutton.core.apps.poll

import org.testng.annotations.BeforeClass
import org.testng.annotations.Test
import org.bigbluebutton.core.apps.poll.messages.PollVO
import com.google.gson.Gson
import com.google.gson.JsonParser
import org.bigbluebutton.core.apps.poll.messages.QuestionVO
import org.bigbluebutton.core.apps.poll.messages.ResponseVO
import org.bigbluebutton.core.apps.poll.messages.R
import org.bigbluebutton.core.util.RandomStringGenerator._
import scala.collection.mutable.ArrayBuffer
import org.bigbluebutton.core.apps.poll.messages.Q
import org.bigbluebutton.core.apps.poll.messages.P

class PollMessageConverterTest {
  
  var samplePoll: P = null
  
	 @BeforeClass
	 def setUp() {
	 	val resps = new ArrayBuffer[R]()
	 	resps += new R("0", "Answer 1")
	 	resps += new R("1", "Answer 2")
	 	resps += new R("2", "Answer 3")
	 	
	 	val questions = new ArrayBuffer[Q]()
	 	questions += new Q("qID", "MULTI_CHOICE", "What is my name?", resps.toArray)
	 	
	 	samplePoll = new P("pollID", "My Sample Poll", questions.toArray)	   
	 }
	 
	 @Test(groups = Array[String]( "unit" ))
	 def convertCreatePollMessageTest(){
		val msg = "{\"title\":\"My sample poll\",\"questions\":[{\"type\":\"MULTI_CHOICE\",\"responses\":[\"Answer 1\",\"Answer 2\",\"Answer 3\"],\"question\":\"What is my name?\"}]}";

		val cut = new PollMessageConverter
		val pvp = cut.convertCreatePollMessage(msg)
		val gson = new Gson()
		
		assert(pvp.title.equals("My sample poll"), "Title not the same.")
		assert(pvp.questions.length == 1, "Number of questions is wrong. Must be [" + pvp.questions.length + "]")
		assert(pvp.questions(0).question.equals("What is my name?"), "First questions is [" + pvp.questions(0).question + "]")
	}

	@Test(groups = Array[String]( "unit" ))
	def convertFromClassMessageTest(){

	 	val gson = new Gson()
	 	assert("foo".equals("My sample"), gson.toJson(samplePoll))
	 	
	}
	
	 @Test(groups = Array[String]( "unit" ))
	 def convertUpdatePollMessageTest(){
/*	   
		val msg = "{\"id\":\"pollID\",\"title\":\"My sample poll\",\"questions\":[{\"id\":\"qID\",\"type\":\"MULTI_CHOICE\",\"responses\":[{\"id\":\"1\",\"text\":\"Answer 1\"},{\"id\":\"2\",\"text\":\"Answer 2\"},{\"id\":\"3\",\"Answer 3\"}],\"question\":\"What is my name?\"}]}";
		
	   val col = new java.util.HashMap[String, Object]()
	   col.put("id", "pollID")
	   col.put("title", "My sample poll")
	   
	   val questions = new java.util.ArrayList[java.util.HashMap[String, Object]]()
	   val q1 = new java.util.HashMap[String, Object]()
	   q1.put("id", "qID")
	   q1.put("type", "MULTI_CHOICE")
	   q1.put("question", "What is my name?")
	   
	   val responses = new java.util.ArrayList[java.util.HashMap[String, String]]()
	   val q1r1 = new java.util.HashMap[String, String]()
	   q1r1.put("id", "0")
	   q1r1.put("text", "Answer 1")

	   val q1r2 = new java.util.HashMap[String, String]()
	   q1r2.put("id", "1")
	   q1r2.put("text", "Answer 2")

	   val q1r3 = new java.util.HashMap[String, String]()
	   q1r3.put("id", "2")
	   q1r3.put("text", "Answer 3")
	   
	   responses.add(q1r1)
	   responses.add(q1r2)
	   responses.add(q1r3)
	   
	   q1.put("responses", responses)
	   
	   questions.add(q1)
	   
	   col.put("questions", questions)
	   
	   
	   assert("foo".equals("My sample"), gson.toJson(col))
*/	   
	   val gson = new Gson()
		val cut = new PollMessageConverter
		val pvp = cut.convertCreatePollMessage(gson.toJson(samplePoll))
		
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

			cvoArray += new QuestionVO(i.toString, qType, questionText, rvoArray.toArray)

			i += 1
		}

		assert(cvoArray.length == 1, "Number of questions = [" + cvoArray.length + "]")
		
		val pvp = new PollVO(randomAlphanumericString(12), title, cvoArray.toArray)	
		
		assert(pvp.id.equals("pollID"), "Poll id is [" + pvp.id + "]")
		assert(pvp.title.equals("My sample poll"), "Title not the same.")
		assert(pvp.questions.length == 1, "Number of questions is wrong. Must be [" + pvp.questions.length + "]")
	 }
}