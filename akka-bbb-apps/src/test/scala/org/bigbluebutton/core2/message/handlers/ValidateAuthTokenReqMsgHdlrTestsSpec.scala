package org.bigbluebutton.core2.message.handlers

import akka.actor.{ ActorContext, ActorSystem, Props }
import akka.testkit.{ DefaultTimeout, ImplicitSender, TestKit }
import com.typesafe.config.ConfigFactory
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core._
import org.bigbluebutton.core.apps.users.UsersApp
import org.bigbluebutton.core.bus._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core2.testdata.TestDataGen
import org.scalatest.{ Matchers, WordSpecLike }
import akka.testkit.TestActorRef
import scala.concurrent.duration._

class ValidateAuthTokenReqMsgHdlrTestsSpec extends TestKit(ActorSystem(
  "ValidateAuthTokenReqMsgHdlrTestsSpec",
  ConfigFactory.parseString(TestKitUsageSpec.config)
))
    with DefaultTimeout with ImplicitSender with WordSpecLike
    with Matchers with StopSystemAfterAll with AppsTestFixtures with SystemConfiguration {

  // See: http://doc.akka.io/docs/akka/current/scala/testing.html
  // Setup dependencies
  val outgoingEventBus = new OutgoingEventBus
  val outBus2 = new OutEventBus2
  val recordBus = new RecordingEventBus

  "A MeetingActor" should {
    "Reject an invalid authToken because there is no registered users in the meeting" in {
      within(500 millis) {

        val state = newLiveMeeting()
        val outGW = new OutMsgGWSeq()

        // Need to get an ActorContext
        val actorRef = TestActorRef[MockTestActor]
        val actor = actorRef.underlyingActor
        // Create actor under test Actor
        val meetingActorRef = new UsersApp(state, outGW)(actor.context)

        def build(meetingId: String, userId: String, authToken: String): ValidateAuthTokenReqMsg = {
          ValidateAuthTokenReqMsg(meetingId, userId, authToken)
        }

        // Send our message
        val msg = build(state.props.meetingProp.intId, "unknown user", "fake auth token")
        meetingActorRef.handleValidateAuthTokenReqMsg(msg)

        // Handle message expectations
        assert(outGW.msgs.length == 1)
      }
    }
  }

  "A MeetingActor" should {
    "Reject an invalid authToken for a registered users in the meeting" in {
      within(500 millis) {

        val state = newLiveMeeting()
        val outGW = new OutMsgGWSeq()
        val richard = TestDataGen.createRegisteredUser(state.registeredUsers, "Richard", Roles.MODERATOR_ROLE,
          guest = false, authed = false, waitForApproval = false)

        // Need to get an ActorContext
        val actorRef = TestActorRef[MockTestActor]
        val actor = actorRef.underlyingActor
        // Create actor under test Actor
        val meetingActorRef = new UsersApp(state, outGW)(actor.context)

        def build(meetingId: String, userId: String, authToken: String): ValidateAuthTokenReqMsg = {
          ValidateAuthTokenReqMsg(meetingId, userId, authToken)
        }

        // Send our message
        val msg = build(state.props.meetingProp.intId, richard.id, "wrong token")
        meetingActorRef.handleValidateAuthTokenReqMsg(msg)

        // Handle message expectations
        assert(outGW.msgs.length == 1)
      }
    }
  }

  "A MeetingActor" should {
    "Accept a valid authToken for a registered users in the meeting" in {
      within(500 millis) {
        val state = newLiveMeeting()
        val outGW = new OutMsgGWSeq()

        val richard = TestDataGen.createRegisteredUser(state.registeredUsers, "Richard", Roles.MODERATOR_ROLE,
          guest = false, authed = false, waitForApproval = false)

        // Need to get an ActorContext
        val actorRef = TestActorRef[MockTestActor]
        val actor = actorRef.underlyingActor
        // Create actor under test Actor
        val meetingActorRef = new UsersApp(state, outGW)(actor.context)

        def build(meetingId: String, userId: String, authToken: String): ValidateAuthTokenReqMsg = {
          ValidateAuthTokenReqMsg(meetingId, userId, authToken)
        }

        // Send our message
        val msg = build(state.props.meetingProp.intId, richard.id, richard.authToken)
        meetingActorRef.handleValidateAuthTokenReqMsg(msg)

        // Handle message expectations
        assert(outGW.msgs.length == 6)
      }
    }
  }

  "A MeetingActor" should {
    "Accept a valid authToken for a registered users in the meeting and not wait for approval for none guests" in {
      within(500 millis) {
        val state = newLiveMeeting()
        val outGW = new OutMsgGWSeq()

        // Set the guest policy to ask moderator
        GuestsWaiting.setGuestPolicy(state.guestsWaiting, GuestPolicy(GuestPolicyType.ASK_MODERATOR, "SYSTEM"))

        // Register a user that is not a guest
        val richard = TestDataGen.createRegisteredUser(state.registeredUsers, "Richard", Roles.MODERATOR_ROLE,
          guest = false, authed = false, waitForApproval = false)

        // Need to get an ActorContext
        val actorRef = TestActorRef[MockTestActor]
        val actor = actorRef.underlyingActor
        // Create actor under test Actor
        val meetingActorRef = new UsersApp(state, outGW)(actor.context)

        def build(meetingId: String, userId: String, authToken: String): ValidateAuthTokenReqMsg = {
          ValidateAuthTokenReqMsg(meetingId, userId, authToken)
        }

        // Send our message
        val msg = build(state.props.meetingProp.intId, richard.id, richard.authToken)
        meetingActorRef.handleValidateAuthTokenReqMsg(msg)

        // Handle message expectations
        // Handle message expectations
        assert(outGW.msgs.length == 6)

      }
    }
  }

  "A MeetingActor" should {
    "Accept a valid authToken for a registered users in the meeting and wait for approval for guests" in {
      within(500 millis) {

        val registeredUsers = new RegisteredUsers
        val users2x = new Users2x
        val state = new LiveMeeting(defaultProps, meetingStatux2x, deskshareModel, chatModel, layoutModel, layouts,
          registeredUsers, polls2x, wbModel, presModel, breakoutRooms, captionModel,
          notesModel, webcams, voiceUsers, users2x, guestsWaiting)

        // Set the guest policy to ask moderator
        GuestsWaiting.setGuestPolicy(state.guestsWaiting, GuestPolicy(GuestPolicyType.ASK_MODERATOR, "SYSTEM"))

        // Register a user that is not a guest
        val richard = TestDataGen.createRegisteredUser(state.registeredUsers, "Richard", Roles.MODERATOR_ROLE,
          guest = false, authed = false, waitForApproval = false)
        val fred = TestDataGen.createRegisteredUser(state.registeredUsers, "Fred", Roles.MODERATOR_ROLE,
          guest = false, authed = false, waitForApproval = false)
        val anton = TestDataGen.createRegisteredUser(state.registeredUsers, "Anton", Roles.VIEWER_ROLE,
          guest = false, authed = false, waitForApproval = false)

        val richardUser = TestDataGen.createUserFor(state, richard, presenter = false)
        val fredUser = TestDataGen.createUserFor(state, fred, presenter = false)
        val antonUser = TestDataGen.createUserFor(state, anton, presenter = false)

        val chad = TestDataGen.createRegisteredUser(state.registeredUsers, "Chad", Roles.VIEWER_ROLE,
          guest = true, authed = false, waitForApproval = true)

        val outGW = new OutMsgGWSeq()

        // Need to get an ActorContext
        val actorRef = TestActorRef[MockTestActor]
        val actor = actorRef.underlyingActor
        // Create actor under test Actor
        val meetingActorRef = new UsersApp(state, outGW)(actor.context)

        def build(meetingId: String, userId: String, authToken: String): ValidateAuthTokenReqMsg = {
          ValidateAuthTokenReqMsg(meetingId, userId, authToken)
        }

        println("****** Sending validate msg test")

        val msg = build(state.props.meetingProp.intId, chad.id, chad.authToken)
        meetingActorRef.handleValidateAuthTokenReqMsg(msg)

        println("******* Asserting message length ")
        assert(outGW.msgs.length == 3)

      }
    }
  }

  def setupState(liveMeeting: LiveMeeting): LiveMeeting = {
    val richard = TestDataGen.createRegisteredUser(liveMeeting.registeredUsers, "Richard", Roles.MODERATOR_ROLE,
      guest = false, authed = false, waitForApproval = false)
    val fred = TestDataGen.createRegisteredUser(liveMeeting.registeredUsers, "Fred", Roles.MODERATOR_ROLE,
      guest = false, authed = false, waitForApproval = false)
    val anton = TestDataGen.createRegisteredUser(liveMeeting.registeredUsers, "Anton", Roles.VIEWER_ROLE,
      guest = false, authed = false, waitForApproval = false)

    val chad = TestDataGen.createRegisteredUser(liveMeeting.registeredUsers, "Chad", Roles.VIEWER_ROLE,
      guest = true, authed = false, waitForApproval = true)

    liveMeeting
  }
}

