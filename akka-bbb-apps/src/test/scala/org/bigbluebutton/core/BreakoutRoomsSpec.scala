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

class BreakoutRoomsSpec extends TestKit(ActorSystem("BreakoutRoomsSpec"))
    with DefaultTimeout with ImplicitSender with WordSpecLike
    with Matchers with BeforeAndAfterAll
    with MeetingManagerTestFixtures {

  val outGWActor = TestProbe()

  val eventBus = new IncomingEventBus
  val outgoingEventBus = new OutgoingEventBus
  val outGW = new OutMessageGateway(outgoingEventBus)

  outgoingEventBus.subscribe(outGWActor.ref, "outgoingMessageChannel")

  val runningMeetingActor = TestActorRef[MeetingActor](
    MeetingActor.props(
      mProps, eventBus, outGW))

  override def afterAll {
    shutdown(system)
  }

  "A MeetingActor" should {
    "Send CreateBreakoutRoom when requested to create breakout rooms" in {
      within(500 millis) {

        val room1 = new BreakoutRoom("foo", Vector("a", "b", "c"))
        val room2 = new BreakoutRoom("bar", Vector("x", "y", "z"))
        val room3 = new BreakoutRoom("baz", Vector("q", "r", "s"))

        runningMeetingActor ! new CreateBreakoutRooms(meetingId, 10, Vector(room1, room2, room3))

        outGWActor.expectMsgPF() {
          case resp: UserRegistered => {
            resp.meetingID == meetingId
          }

        }
      }
    }
  }

}