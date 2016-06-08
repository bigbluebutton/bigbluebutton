package org.bigbluebutton.core

import akka.actor.ActorSystem
import akka.testkit.{ DefaultTimeout, ImplicitSender, TestKit }
import com.typesafe.config.ConfigFactory
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.bus.{ IncomingEventBus, OutgoingEventBus }
import org.bigbluebutton.core.domain.{ MeetingExtensionProp, MeetingExtensionStatus }
import org.bigbluebutton.core.models._
import org.scalatest.{ Matchers, WordSpecLike }

import scala.concurrent.duration._

class MeetingActor2xTestsSpec extends TestKit(ActorSystem("MeetingActorTestsSpec",
  ConfigFactory.parseString(TestKitUsageSpec.config)))
    with DefaultTimeout with ImplicitSender with WordSpecLike
    with Matchers with StopSystemAfterAll with MeetingTestFixtures {

  val eventBus = new IncomingEventBus
  val outgoingEventBus = new OutgoingEventBus
  val outGW = new OutMessageGateway(outgoingEventBus)
  outgoingEventBus.subscribe(testActor, "outgoingMessageChannel")

  "A MeetingActor" should {
    "Send a DisconnectUser when receiving ValitadateAuthTokenCommand and there is no registered user" in {
      within(500 millis) {
        val state: MeetingStateModel = new MeetingStateModel(
          piliProps,
          abilities,
          registeredUsers,
          users,
          chats,
          layouts,
          polls,
          whiteboards,
          presentations,
          breakoutRooms,
          captions,
          new MeetingStatus)

        val meetingActorRef = system.actorOf(MeetingActor2x.props(piliProps, eventBus, outGW, state))
        meetingActorRef ! du30ValidateAuthTokenCommand
        expectMsgClass(classOf[DisconnectUser2x])
      }
    }
  }

  "A MeetingActor" should {
    "Send a UserRegisteredEvent when receiving UserRegisterCommand" in {
      within(500 millis) {
        val state: MeetingStateModel = new MeetingStateModel(piliProps,
          abilities,
          registeredUsers,
          users,
          chats,
          layouts,
          polls,
          whiteboards,
          presentations,
          breakoutRooms,
          captions,
          new MeetingStatus)
        val meetingActorRef = system.actorOf(MeetingActor2x.props(piliProps, eventBus, outGW, state))
        meetingActorRef ! du30RegisterUserCommand
        expectMsgClass(classOf[UserRegisteredEvent2x])
      }
    }
  }

  "A MeetingActor" should {
    "Send a ValidateAuthTokenReply when receiving ValitadateAuthTokenCommand and there is registered user" in {
      within(500 millis) {
        val state: MeetingStateModel = new MeetingStateModel(piliProps,
          abilities,
          registeredUsers,
          users,
          chats,
          layouts,
          polls,
          whiteboards,
          presentations,
          breakoutRooms,
          captions,
          new MeetingStatus)
        val meetingActorRef = system.actorOf(MeetingActor2x.props(piliProps, eventBus, outGW, state))
        meetingActorRef ! du30RegisterUserCommand
        expectMsgClass(classOf[UserRegisteredEvent2x])
        meetingActorRef ! du30ValidateAuthTokenCommand
        expectMsgClass(classOf[ValidateAuthTokenReply2x])
      }
    }
  }

  "A MeetingActor" should {
    "Send a UserJoinedEvent when receiving UserJoinCommand and there is registered user" in {
      within(500 millis) {
        val state: MeetingStateModel = new MeetingStateModel(piliProps,
          abilities,
          registeredUsers,
          users,
          chats,
          layouts,
          polls,
          whiteboards,
          presentations,
          breakoutRooms,
          captions,
          new MeetingStatus)
        val meetingActorRef = system.actorOf(MeetingActor2x.props(piliProps, eventBus, outGW, state))
        meetingActorRef ! du30RegisterUserCommand
        expectMsgClass(classOf[UserRegisteredEvent2x])
        meetingActorRef ! du30ValidateAuthTokenCommand
        expectMsgClass(classOf[ValidateAuthTokenReply2x])
        meetingActorRef ! du30UserJoinCommand
        expectMsgPF() {
          case event: UserJoinedEvent2x =>
            assert(event.meetingId == piliIntMeetingId)
        }
      }
    }
  }

  "A MeetingActor" should {
    "Eject the user when receiving eject user command" in {
      within(500 millis) {
        val testRegUsers = new RegisteredUsers2x
        testRegUsers.add(du30RegisteredUser)
        testRegUsers.add(mdsRegisteredUser)
        testRegUsers.add(marRegisteredUser)

        val testUsers = new Users3x
        testUsers.save(du30User)
        testUsers.save(mdsUser)
        testUsers.save(marUser)

        val state: MeetingStateModel = new MeetingStateModel(piliProps,
          abilities, testRegUsers, testUsers, chats, layouts,
          polls, whiteboards, presentations, breakoutRooms, captions,
          new MeetingStatus)

        val ejectUserMsg = new EjectUserFromMeeting(piliIntMeetingId, marIntUserId, du30IntUserId)

        val meetingActorRef = system.actorOf(MeetingActor2x.props(piliProps, eventBus, outGW, state))
        meetingActorRef ! ejectUserMsg
        //expectMsgAllClassOf(classOf[UserEjectedFromMeeting], classOf[DisconnectUser2x], classOf[UserLeft2x])
        expectMsgClass(classOf[UserEjectedFromMeeting])
        expectMsgClass(classOf[DisconnectUser2x])
        expectMsgClass(classOf[UserLeft2x])

        assert(state.users.toVector.length == 2)
        assert(state.registeredUsers.toVector.length == 2)
      }
    }
  }
}
