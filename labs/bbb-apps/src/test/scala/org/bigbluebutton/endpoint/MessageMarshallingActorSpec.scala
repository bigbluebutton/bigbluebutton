package org.bigbluebutton.endpoint
import akka.actor.ActorSystem
import akka.testkit.{DefaultTimeout, ImplicitSender, TestKit, TestProbe, TestActorRef}
import scala.concurrent.duration._
import org.scalatest.{WordSpecLike, BeforeAndAfterAll, Matchers}
import spray.json._
import spray.json.DefaultJsonProtocol._
import org.bigbluebutton.endpoint.redis.JsonMessage

class MessageMarshallingActorSpec extends 
  TestKit(ActorSystem("MessageMarshallingActorSpec"))
          with DefaultTimeout with ImplicitSender with WordSpecLike 
          with Matchers with BeforeAndAfterAll 
          with UsersMessageTestFixtures {

  val pubsubProbe = TestProbe()
  val marshallingActor =  TestActorRef[MessageMarshallingActor](
                                   MessageMarshallingActor.props(
                                   pubsubProbe.ref))
  
  override def afterAll {
    shutdown(system)
  }
  
  "The MessageMarshallingActor" should {
    "Send a UserJoinResponse message when receiving a user join JSON message" in {
      marshallingActor ! userJoinResponseMessage
        
      pubsubProbe.expectMsgPF(500 millis) {
        case ujr:JsonMessage => {
          ujr.message should include (juanExtUserId)
        }            
        case _ => fail("Expected a JsonMessage message.")
      }
    }
       
  }  
}