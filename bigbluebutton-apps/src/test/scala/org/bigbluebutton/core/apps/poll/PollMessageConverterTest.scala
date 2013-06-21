package org.bigbluebutton.core.apps.poll

import org.testng.annotations.BeforeClass
import org.testng.annotations.Test

class PollMessageConverterTest {
  
	 @BeforeClass
	 def setUp() {
	   // code that will be invoked when this test is instantiated
	 }
	 
	 @Test(groups = Array[String]( "unit" ))
	 def createPoll(){
		val msg = "{\"title\":\"My sample poll\",\"questions\":[{\"type\":\"MULTI_CHOICE\",\"responses\":[\"Answer 1\",\"Answer 2\",\"Answer 3\"],\"question\":\"What is my name?\"}]}";

		val cut = new PollMessageConverter
		val pvp = cut.convertCreatePollMessage(msg)
		
		assert(pvp.title.equals("My sample poll"), "Title not the same.")
	}
}