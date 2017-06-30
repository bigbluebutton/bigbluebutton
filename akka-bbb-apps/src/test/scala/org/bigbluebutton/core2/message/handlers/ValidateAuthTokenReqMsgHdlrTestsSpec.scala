package org.bigbluebutton.core2.message.handlers

import akka.actor.{ ActorSystem, Props }
import akka.testkit.{ DefaultTimeout, ImplicitSender, TestKit }
import com.typesafe.config.ConfigFactory
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core._
import org.bigbluebutton.core.bus._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting }
import org.bigbluebutton.core2.message.handlers.users.ValidateAuthTokenReqMsgHdlr
import org.bigbluebutton.core2.testdata.TestDataGen
import org.scalatest.{ Matchers, WordSpecLike }

import scala.concurrent.duration._

class ValidateAuthTokenReqMsgHdlrTestsSpec extends TestKit(ActorSystem("ValidateAuthTokenReqMsgHdlrTestsSpec",
  ConfigFactory.parseString(TestKitUsageSpec.config)))
    with DefaultTimeout with ImplicitSender with WordSpecLike
    with Matchers with StopSystemAfterAll with AppsTestFixtures with SystemConfiguration {

  // See: http://doc.akka.io/docs/akka/current/scala/testing.html
  // Setup dependencies
  val outgoingEventBus = new OutgoingEventBus
  val outBus2 = new OutEventBus2
  val recordBus = new RecordingEventBus

  val outGW = OutMessageGateway(outgoingEventBus, outBus2, recordBus)

  // Have the build in testActor receive messages coming from class under test
  outBus2.subscribe(testActor, outBbbMsgMsgChannel)

  "A MeetingActor" should {
    "Reject an invalid authToken because there is no registered users in the meeting" in {
      within(500 millis) {

        // Create actor under test Actor
        val meetingActorRef = system.actorOf(ValidateAuthTokenRespMsgTestActor.props(outGW, liveMeeting))

        def build(meetingId: String, userId: String, authToken: String): BbbCommonEnvCoreMsg = {
          val routing = collection.immutable.HashMap("sender" -> "bbb-apps")
          val envelope = BbbCoreEnvelope(CreateMeetingReqMsg.NAME, routing)
          val req = ValidateAuthTokenReqMsg(meetingId, userId, authToken)
          BbbCommonEnvCoreMsg(envelope, req)
        }

        // Send our message
        val msg = build(liveMeeting.props.meetingProp.intId, "unknown user", "fake auth token")
        meetingActorRef ! msg

        // Handle message expectations
        expectMsgPF() {
          case event: BbbCommonEnvCoreMsg =>
            assert(event.envelope.name == ValidateAuthTokenRespMsg.NAME)
            val outMsg = event.core.asInstanceOf[ValidateAuthTokenRespMsg]
            assert(outMsg.body.valid == false)
          // Can do more assertions here
        }
      }
    }
  }

  "A MeetingActor" should {
    "Reject an invalid authToken for a registered users in the meeting" in {
      within(500 millis) {

        val richard = TestDataGen.createRegisteredUser(liveMeeting.registeredUsers, "Richard", Roles.MODERATOR_ROLE,
          guest = false, authed = false, waitForApproval = false)

        // Create actor under test Actor
        val meetingActorRef = system.actorOf(ValidateAuthTokenRespMsgTestActor.props(outGW, liveMeeting))

        def build(meetingId: String, userId: String, authToken: String): BbbCommonEnvCoreMsg = {
          val routing = collection.immutable.HashMap("sender" -> "bbb-apps")
          val envelope = BbbCoreEnvelope(CreateMeetingReqMsg.NAME, routing)
          val req = ValidateAuthTokenReqMsg(meetingId, userId, authToken)
          BbbCommonEnvCoreMsg(envelope, req)
        }

        // Send our message
        val msg = build(liveMeeting.props.meetingProp.intId, richard.id, "wrong token")
        meetingActorRef ! msg

        // Handle message expectations
        expectMsgPF() {
          case event: BbbCommonEnvCoreMsg =>
            assert(event.envelope.name == ValidateAuthTokenRespMsg.NAME)
            val outMsg = event.core.asInstanceOf[ValidateAuthTokenRespMsg]
            assert(outMsg.body.valid == false)
          // Can do more assertions here
        }
      }
    }
  }

  "A MeetingActor" should {
    "Accept a valid authToken for a registered users in the meeting" in {
      within(500 millis) {

        val richard = TestDataGen.createRegisteredUser(liveMeeting.registeredUsers, "Richard", Roles.MODERATOR_ROLE,
          guest = false, authed = false, waitForApproval = false)

        // Create actor under test Actor
        val meetingActorRef = system.actorOf(ValidateAuthTokenRespMsgTestActor.props(outGW, liveMeeting))

        def build(meetingId: String, userId: String, authToken: String): BbbCommonEnvCoreMsg = {
          val routing = collection.immutable.HashMap("sender" -> "bbb-apps")
          val envelope = BbbCoreEnvelope(CreateMeetingReqMsg.NAME, routing)
          val req = ValidateAuthTokenReqMsg(meetingId, userId, authToken)
          BbbCommonEnvCoreMsg(envelope, req)
        }

        // Send our message
        val msg = build(liveMeeting.props.meetingProp.intId, richard.id, richard.authToken)
        meetingActorRef ! msg

        // Handle message expectations
        expectMsgPF() {
          case event: BbbCommonEnvCoreMsg =>
            assert(event.envelope.name == ValidateAuthTokenRespMsg.NAME)
            val outMsg = event.core.asInstanceOf[ValidateAuthTokenRespMsg]
            assert(outMsg.body.valid == true)
          // Can do more assertions here
        }
      }
    }
  }

  "A MeetingActor" should {
    "Accept a valid authToken for a registered users in the meeting and not wait for approval for none guests" in {
      within(500 millis) {

        // Set the guest policy to ask moderator
        GuestsWaiting.setGuestPolicy(liveMeeting.guestsWaiting, GuestPolicy(GuestPolicyType.ASK_MODERATOR, "SYSTEM"))

        // Register a user that is not a guest
        val richard = TestDataGen.createRegisteredUser(liveMeeting.registeredUsers, "Richard", Roles.MODERATOR_ROLE,
          guest = false, authed = false, waitForApproval = false)

        // Create actor under test Actor
        val meetingActorRef = system.actorOf(ValidateAuthTokenRespMsgTestActor.props(outGW, liveMeeting))

        def build(meetingId: String, userId: String, authToken: String): BbbCommonEnvCoreMsg = {
          val routing = collection.immutable.HashMap("sender" -> "bbb-apps")
          val envelope = BbbCoreEnvelope(CreateMeetingReqMsg.NAME, routing)
          val req = ValidateAuthTokenReqMsg(meetingId, userId, authToken)
          BbbCommonEnvCoreMsg(envelope, req)
        }

        // Send our message
        val msg = build(liveMeeting.props.meetingProp.intId, richard.id, richard.authToken)
        meetingActorRef ! msg

        // Handle message expectations
        expectMsgPF() {
          case event: BbbCommonEnvCoreMsg =>
            assert(event.envelope.name == ValidateAuthTokenRespMsg.NAME)
            val outMsg = event.core.asInstanceOf[ValidateAuthTokenRespMsg]
            assert(outMsg.body.valid == true)
            assert(outMsg.body.waitForApproval == false)
          // Can do more assertions here
        }
      }
    }
  }

  "A MeetingActor" should {
    "Accept a valid authToken for a registered users in the meeting and wait for approval for guests" in {
      within(500 millis) {

        // Set the guest policy to ask moderator
        GuestsWaiting.setGuestPolicy(liveMeeting.guestsWaiting, GuestPolicy(GuestPolicyType.ASK_MODERATOR, "SYSTEM"))

        // Register a user that is not a guest
        val richard = TestDataGen.createRegisteredUser(liveMeeting.registeredUsers, "Richard", Roles.MODERATOR_ROLE,
          guest = false, authed = false, waitForApproval = false)
        val fred = TestDataGen.createRegisteredUser(liveMeeting.registeredUsers, "Fred", Roles.MODERATOR_ROLE,
          guest = false, authed = false, waitForApproval = false)
        val anton = TestDataGen.createRegisteredUser(liveMeeting.registeredUsers, "Anton", Roles.VIEWER_ROLE,
          guest = false, authed = false, waitForApproval = false)

        val richardUser = TestDataGen.createUserFor(liveMeeting, richard, presenter = false)
        val fredUser = TestDataGen.createUserFor(liveMeeting, fred, presenter = false)
        val antonUser = TestDataGen.createUserFor(liveMeeting, anton, presenter = false)

        val chad = TestDataGen.createRegisteredUser(liveMeeting.registeredUsers, "Chad", Roles.VIEWER_ROLE,
          guest = true, authed = false, waitForApproval = true)

        // Create actor under test Actor
        val meetingActorRef = system.actorOf(ValidateAuthTokenRespMsgTestActor.props(outGW, liveMeeting))

        def build(meetingId: String, userId: String, authToken: String): BbbCommonEnvCoreMsg = {
          val routing = collection.immutable.HashMap("sender" -> "bbb-apps")
          val envelope = BbbCoreEnvelope(CreateMeetingReqMsg.NAME, routing)
          val req = ValidateAuthTokenReqMsg(meetingId, userId, authToken)
          BbbCommonEnvCoreMsg(envelope, req)
        }

        // Send our message
        val msg = build(liveMeeting.props.meetingProp.intId, chad.id, chad.authToken)
        meetingActorRef ! msg

        // Handle message expectations
        expectMsgPF() {
          case event: BbbCommonEnvCoreMsg =>
            assert(event.envelope.name == ValidateAuthTokenRespMsg.NAME)
            val outMsg = event.core.asInstanceOf[ValidateAuthTokenRespMsg]
            assert(outMsg.body.valid == true)
            assert(outMsg.body.waitForApproval == false)
          // Can do more assertions here
        }
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

class ValidateAuthTokenRespMsgTestActor(val outGW: OutMessageGateway,
  val liveMeeting: LiveMeeting)
    extends BaseMeetingActor with ValidateAuthTokenReqMsgHdlr {

  def receive = {
    case msg: BbbCommonEnvCoreMsg => handleBbbCommonEnvCoreMsg(msg)
  }

  private def handleBbbCommonEnvCoreMsg(msg: BbbCommonEnvCoreMsg): Unit = {
    msg.core match {
      case m: ValidateAuthTokenReqMsg => handleValidateAuthTokenReqMsg(m)
    }
  }
}

object ValidateAuthTokenRespMsgTestActor {
  def props(outGW: OutMessageGateway, liveMeeting: LiveMeeting): Props =
    Props(classOf[ValidateAuthTokenRespMsgTestActor], outGW, liveMeeting)
}
