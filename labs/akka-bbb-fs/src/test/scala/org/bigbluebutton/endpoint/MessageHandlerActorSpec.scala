package org.bigbluebutton.endpoint
import akka.actor.ActorSystem
import akka.testkit.{DefaultTimeout, ImplicitSender, TestKit, TestProbe, TestActorRef}
import scala.concurrent.duration._
import org.scalatest.{WordSpecLike, BeforeAndAfterAll, Matchers}
import org.bigbluebutton.apps.users.messages.UserJoinRequest

class MessageHandlerActorSpec extends 
  TestKit(ActorSystem("MessageHandlerActorSpec")) with DefaultTimeout with ImplicitSender with WordSpecLike with Matchers with BeforeAndAfterAll with UsersMessageTestFixtures {

  val messageMarshallerProbe = TestProbe()
  val bbbAppsProbe = TestProbe()
  val messageHandlerActor = TestActorRef[MessageHandlerActor](
                                   MessageHandlerActor.props(
                                   bbbAppsProbe.ref, messageMarshallerProbe.ref))
  
  override def afterAll {
    shutdown(system)
  }
  
  "The MessageHandlerActor"should {
    "Send a UserJoinResponseMessage message when receiving a user join request message" in {
      messageHandlerActor ! userJoinRequestMessage
        
      bbbAppsProbe.expectMsgPF(500 millis) {
        case ujr:UserJoinRequest => {
          ujr.token shouldBe juanUserToken
          bbbAppsProbe.reply(userJoinSuccessResponse)
        }            
        case _ => fail("Expected a UserJoinRequest message.")
      }
      
      messageMarshallerProbe.expectMsgPF(500 millis) {
        case ujr:UserJoinResponseMessage => {
          ujr.response.result.success shouldBe true
        }            
        case _ => fail("Expected a UserJoinResponseMessage message.")
      }
    }
  }  
}