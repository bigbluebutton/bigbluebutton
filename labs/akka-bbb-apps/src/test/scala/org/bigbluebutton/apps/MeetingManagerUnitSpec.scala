package org.bigbluebutton.apps

import akka.testkit.TestKit
import org.scalatest.BeforeAndAfterAll
import org.scalatest.Matchers
import akka.actor.ActorSystem
import akka.actor.Props
import akka.testkit.TestProbe
import akka.testkit.TestActorRef
import org.scalatest.FlatSpecLike

class MeetingManagerUnitSpec extends 
          TestKit(ActorSystem("MeetingManagerUnitSpec"))
          with FlatSpecLike with Matchers with BeforeAndAfterAll 
          with AppsTestFixtures {

  val pubsub = TestProbe()

  val actorRef = TestActorRef[MeetingManager](Props(classOf[MeetingManager], pubsub.ref))
  val actor = actorRef.underlyingActor
  
  "The MeetingManager" should "return false when a meeting doesn't exist" in {
      assert(actor.meetingExist("no-meeting") === false)
  }
/*  
  it should "return true when a meeting exist" in {
    val internalId = "testMeetingId"
    val sessionId = actor.getValidSession("testMeetingId")
//    val meeting = actor.createMeeting(meetingConfig, internalId)
    assert(actor.meetingExist(internalId) === true)
    val m = actor.getMeeting(internalId)
    
    m should be ('defined)
   
//    m.map { n => 
//      n.config should have (
//          'name (meetingConfig.name))
//    }
  }
  
  */
}