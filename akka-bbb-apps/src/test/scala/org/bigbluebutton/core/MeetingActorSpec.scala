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
import akka.testkit.TestActorRef
import org.bigbluebutton.core._
import org.bigbluebutton.core.bus._
import org.bigbluebutton.core.api._

class RunningMeetingActorSpec extends TestKit(ActorSystem("MeetingManagerSpec"))
    with DefaultTimeout with ImplicitSender with WordSpecLike
    with Matchers with BeforeAndAfterAll
    with MeetingManagerTestFixtures {

  val outGWActor = TestProbe()
  val eventBus = new IncomingEventBus
  val outgoingEventBus = new OutgoingEventBus
  val outGW = new OutMessageGateway(outgoingEventBus)

  outgoingEventBus.subscribe(outGWActor.ref, "outgoingMessageChannel")

  val runningMeetingActor = TestActorRef[MeetingActor](
    MeetingActor.props(mProps, eventBus, outGW))

  override def afterAll {
    shutdown(system)
  }

  "A MeetingActor" should {
    "Respond with UserRegistered.'" in {
      within(500 millis) {

        runningMeetingActor ! new RegisterUser(meetingId, "user1", "User 1", Role.MODERATOR, "extUser1", "myToken")

        //        outGWActor.expectMsgPF() {
        //          case gvu: GetUsersInVoiceConference => {
        ///            gvu.meetingID == meetingId
        //          }
        //        }

        outGWActor.expectMsgPF() {
          case resp: UserRegistered => {
            resp.meetingID == meetingId
          }

        }
      }
    }
  }

}