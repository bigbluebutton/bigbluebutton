package org.bigbluebutton.core.apps.poll

import org.testng.annotations.BeforeClass
import org.testng.annotations.Test

class PollTests {
  var samplePoll:Poll = null
  
  @BeforeClass
  def setUp() {
	  val r1 = new Response("0", "Answer 1")
	  val r2 = new Response("1", "Answer 2")
	  val r3 = new Response("2", "Answer 3")

	  val q = new Question("1", true, "What is my name?", Array(r1, r2, r3))

	  samplePoll = new Poll("pollID", "Sample Poll", Array(q))	  
  }
	 
  @Test(groups = Array[String]( "unit" ))
  def createPollTest(){
	  
  }
}