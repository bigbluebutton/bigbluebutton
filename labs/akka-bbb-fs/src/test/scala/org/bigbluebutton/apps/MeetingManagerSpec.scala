package org.bigbluebutton.apps

import akka.testkit.DefaultTimeout
import akka.testkit.ImplicitSender
import akka.testkit.TestKit
import scala.concurrent.duration._
import scala.collection.immutable
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.WordSpecLike
import org.scalatest.BeforeAndAfterAll
import org.scalatest.Matchers
import akka.actor.ActorSystem
import collection.mutable.Stack
import akka.actor.Props
import akka.testkit.TestProbe
import org.bigbluebutton.apps._


class MeetingManagerSpec extends 
  TestKit(ActorSystem("MeetingManagerSpec"))
  with DefaultTimeout with ImplicitSender with WordSpecLike 
  with Matchers with BeforeAndAfterAll with MeetingManagerTestFixtures {
  
  val pubsub = TestProbe()
  val meetingMgrRef = system.actorOf(Props(classOf[MeetingManager], pubsub.ref))
  
  override def afterAll {
    shutdown(system)
  }
  
  "An MeetingManagerActor" should {
    "Respond with the Meeting created" in {
      within(500 millis) {
        val createMsg = generateCreateMeetingMessage()
        
        meetingMgrRef ! createMsg
        
        expectMsgPF() {
          case resp:CreateMeetingResponse => {
            resp.success shouldBe true
            resp.message shouldBe "Meeting successfully created."
          }            
        }
        
        pubsub.expectMsgPF(500 millis) {
          case pubMsg:MeetingCreated => {
            pubMsg.meeting.id shouldBe createMsg.descriptor.id
          }
        }
      }
    }
  }

}