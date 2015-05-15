package org.bigbluebutton.endpoint

import akka.actor.ActorSystem
import akka.testkit.{DefaultTimeout, ImplicitSender, TestKit, TestProbe, TestActorRef}
import scala.concurrent.duration._
import org.scalatest.{WordSpecLike, BeforeAndAfterAll, Matchers}
import org.bigbluebutton.apps.AppsTestFixtures

class MessageUnmarshallingActorSpec extends 
  TestKit(ActorSystem("MessageUnmarshallingActorSpec"))
          with DefaultTimeout with ImplicitSender with WordSpecLike 
          with Matchers with BeforeAndAfterAll 
          with UsersMessageTestFixtures 
          with JsonMessagesFixtures with AppsTestFixtures {

  val messageHandlerProbe = TestProbe()
  val unmarshallingActor =  TestActorRef[MessageUnmarshallingActor](
                                   MessageUnmarshallingActor.props(
                                   messageHandlerProbe.ref))
  
  override def afterAll {
    shutdown(system)
  }
  
  "The MessageUnmarshallingActor" should {
    "Send a UserJoinRequest message when receiving a user join JSON message" in {
      unmarshallingActor ! UserJoinRequestJson
        
      messageHandlerProbe.expectMsgPF(500 millis) {
        case ujr:UserJoinRequestFormat => {
          ujr.payload.token should be ("user1-token-1") 
        }     
        case _ => fail("Should have returned UserJoinRequestMessage")
      }
    }
    
    "Send a UserLeave message when receiving a user leave JSON message" in {
      unmarshallingActor ! UserLeaveEventJson
        
      messageHandlerProbe.expectMsgPF(500 millis) {
        case ujr:UserLeaveMessage => {
          ujr.payload.user.id should be ("juanid")
        }        
        case _ => fail("Should have returned UserLeaveMessage")
      }
    }
    
    "Send a GetUsers message when receiving a get users JSON message" in {
      unmarshallingActor ! GetUsersRequestJson
        
      messageHandlerProbe.expectMsgPF(500 millis) {
        case ujr:GetUsersRequestMessage => {
          ujr.payload.requester.id should be ("juanid")
        }       
        case _ => fail("Should have returned GetUsersRequest")
      }
    }
    
    "Send an AssignPresenter message when receiving assign presenter JSON message" in {
      unmarshallingActor ! AssignPresenterRequestJson
        
      messageHandlerProbe.expectMsgPF(500 millis) {
        case ujr:AssignPresenterMessage => {
          ujr.payload.presenter.id should be ("user1")
        }     
        case _ => fail("Should have returned AssignPresenter")
      }
    }    
  }  
}