package org.bigbluebutton.core

import akka.actor.ActorSystem
import akka.testkit.{ DefaultTimeout, ImplicitSender, TestKit }
import com.typesafe.config.ConfigFactory
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus._
import org.scalatest.{ Matchers, WordSpecLike }

import scala.concurrent.duration._

class BigBlueButtonActorTestsSpec extends TestKit(ActorSystem(
  "BigBlueButtonActorTestsSpec",
  ConfigFactory.parseString(TestKitUsageSpec.config)
))
    with DefaultTimeout with ImplicitSender with WordSpecLike
    with Matchers with StopSystemAfterAll with AppsTestFixtures with SystemConfiguration {

  // See: http://doc.akka.io/docs/akka/current/scala/testing.html

  // Setup dependencies
  val bbbMsgBus = new BbbMsgRouterEventBus
  val eventBus = new InMsgBusGW(new IncomingEventBusImp())
  val outBus2 = new OutEventBus2
  val recordBus = new RecordingEventBus

  //val outGW = OutMessageGatewayImp(outgoingEventBus, outBus2, recordBus)

  // Have the build in testActor receive messages coming from class under test (BigBlueButtonActor)
  outBus2.subscribe(testActor, outBbbMsgMsgChannel)

  "A BigBlueButtonActor" should {
    "Send a MeetingCreatedEvtMsg when receiving CreateMeetingReqMsg" in {
      within(500 millis) {

        val outGWSeq = new OutMsgGWSeq()
        // Create BigBlueButton Actor
        val bbbActorRef = system.actorOf(BigBlueButtonActor.props(
          system,
          eventBus, bbbMsgBus, outGWSeq
        ))

        // Send our create meeting request message
        val msg = buildCreateMeetingReqMsg(defaultProps)
        bbbActorRef ! msg

        //assert(outGWSeq.msgs.length == 2)

        // Expect a message from BigBlueButtonActor as a result of handling
        // the create meeting request message.
        //expectMsgClass(classOf[BbbCommonEnvCoreMsg])
        //     expectMsgPF() {
        //       case event: BbbCommonEnvCoreMsg =>
        //         assert(event.envelope.name == MeetingCreatedEvtMsg.NAME)
        // Can do more assertions here
        //     }
      }
    }
  }

  def buildCreateMeetingReqMsg(props: DefaultProps): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(CreateMeetingReqMsg.NAME, routing)
    val header = BbbCoreBaseHeader(CreateMeetingReqMsg.NAME)
    val body = CreateMeetingReqMsgBody(props)
    val req = CreateMeetingReqMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }
}