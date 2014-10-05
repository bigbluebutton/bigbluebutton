package org.bigbluebutton.core.apps.poll

import org.testng.annotations.BeforeClass
import org.testng.annotations.Test
import org.testng.annotations.BeforeMethod
import org.testng.Assert

class PollModelTests {
    val r1 = new ResponseVO("0", "Answer 1")
    val r2 = new ResponseVO("1", "Answer 2")
    val r3 = new ResponseVO("2", "Answer 3")
    val r4 = new ResponseVO("3", "Answer 4")
    
    var q = new QuestionVO("q1", true, "What is my name?", Array(r1, r2, r3))
	val pvo = new PollVO("pollID", "sample poll", Array(q))
  
  @BeforeMethod
  def setUp() {
		   
  }

  @Test(groups = Array[String]( "unit" ))
  def createPollTest(){

    val model = new PollModel   
	model.createPoll(pvo)
	
	assert(model.numPolls == 1, "Number of polls should be 1")
	assert(model.hasPoll("pollID"), "No poll with id=pollID")
  }
  
  @Test(groups = Array[String]( "unit" ))
  def updatePollTest(){

    val model = new PollModel   
	model.createPoll(pvo)
	
	assert(model.numPolls == 1, "Number of polls should be 1")
	assert(model.hasPoll("pollID"), "No poll with id=pollID")
	   
    var q = new QuestionVO("q1", true, "What is my name?", Array(r1, r2, r3, r4))
	val newpvo = new PollVO("pollID", "modified sample poll", Array(q))	
    
    model.updatePoll(newpvo)
    
	assert(model.numPolls == 1, "Number of polls should be 1")
	assert(model.hasPoll("pollID"), "No poll with id=pollID")   
	model.getPoll("pollID") match {
      case Some(spvo) => {
        assert(spvo.questions(0).responses.length == 4, "Number of questions doesn't match.")
      }
      case None => 
    }	
  }
  
  @Test(groups = Array[String]( "unit" ))
  def getPollsTest(){

    val model = new PollModel   
	model.createPoll(pvo)
	
	assert(model.numPolls == 1, "Number of polls should be 1")
	assert(model.hasPoll("pollID"), "No poll with id=pollID")
	   
    var q = new QuestionVO("q1", true, "What is my name?", Array(r1, r2, r3, r4))
	val newpvo = new PollVO("pollID-2", "modified sample poll", Array(q))	
    
    model.createPoll(newpvo)
    
	assert(model.numPolls == 2, "Number of polls should be 2")
	assert(model.hasPoll("pollID-2"), "No poll with id=pollID")   
	val polls = model.getPolls
	assert(polls.length == 2, "Number of polls should be 2")
    
  } 
  
  @Test(groups = Array[String]( "unit" ))
  def removePollsTest(){

    val model = new PollModel   
	model.createPoll(pvo)
	
	assert(model.numPolls == 1, "Number of polls should be 1")
	assert(model.hasPoll("pollID"), "No poll with id=pollID")
	   
    var q = new QuestionVO("q1", true, "What is my name?", Array(r1, r2, r3, r4))
	val newpvo = new PollVO("pollID-2", "modified sample poll", Array(q))	
    
    model.createPoll(newpvo)
    
	assert(model.numPolls == 2, "Number of polls should be 2")
	assert(model.hasPoll("pollID-2"), "No poll with id=pollID")   
	model.removePoll("pollID-2")
	assert(model.numPolls == 1, "Number of polls should be 1")
	assert(model.hasPoll("pollID"), "No poll with id=pollID")
    assert(model.hasPoll("pollID-2") == false, "pollID-2 shouldn't exist")
  } 
  
  @Test(groups = Array[String]( "unit" ))
  def respondPollsTest(){

    val model = new PollModel   
	model.createPoll(pvo)
	
	assert(model.numPolls == 1, "Number of polls should be 1")
	assert(model.hasPoll("pollID"), "No poll with id=pollID")
	   
	model.respondToQuestion("pollID", "q1", "1", new Responder("user1", "Juan Tamad"))
	model.respondToQuestion("pollID", "q1", "0", new Responder("user2", "Asyong Aksaya"))
	
	model.getPoll("pollID") match {
      case Some(spvo) => {
        assert(spvo.questions(0).responses(1).responders.length == 1, "Question has responders")
        assert(spvo.questions(0).responses(0).responders.length == 1, "Question has responders")
      }
      case None => 
    }
	
  }
}