package org.bigbluebutton.core

import akka.actor.Actor
import akka.actor.ActorLogging
import akka.actor.Props
import org.bigbluebutton.core.bus._
import org.bigbluebutton.core.api._
import scala.concurrent.duration._
import org.bigbluebutton.core.domain._
import org.bigbluebutton.core.models._

object MeetingActorInternal {
  def props(mProps: MeetingProperties,
    eventBus: IncomingEventBus,
    outGW: OutMessageGateway): Props =
    Props(classOf[MeetingActorInternal], mProps, eventBus, outGW)
}

// This actor is an internal audit actor for each meeting actor that
// periodically sends messages to the meeting actor
class MeetingActorInternal(val mProps: MeetingProperties,
  val eventBus: IncomingEventBus, val outGW: OutMessageGateway)
    extends Actor with ActorLogging {

  import context.dispatcher
  context.system.scheduler.schedule(2 seconds, 30 seconds, self, "MonitorNumberOfWebUsers")

  // Query to get voice conference users
  outGW.send(new GetUsersInVoiceConference(mProps.id, mProps.recorded, mProps.voiceConf))

  if (mProps.isBreakout) {
    // This is a breakout room. Inform our parent meeting that we have been successfully created.
    eventBus.publish(BigBlueButtonEvent(
      mProps.extId.value,
      BreakoutRoomCreated(mProps.extId.value, mProps.id.value)))
  }

  def receive = {
    case "MonitorNumberOfWebUsers" => handleMonitorNumberOfWebUsers()
  }

  def handleMonitorNumberOfWebUsers() {
    eventBus.publish(BigBlueButtonEvent(mProps.id.value,
      MonitorNumberOfUsers(mProps.id)))

    // Trigger updating users of time remaining on meeting.
    eventBus.publish(BigBlueButtonEvent(mProps.id.value,
      SendTimeRemainingUpdate(mProps.id)))

    if (mProps.isBreakout) {
      // This is a breakout room. Update the main meeting with list of users in this breakout room.
      eventBus.publish(BigBlueButtonEvent(mProps.id.value,
        SendBreakoutUsersUpdate(mProps.id)))
    }

  }
}

object MeetingActor {
  def props(
    props: MeetingProperties,
    bus: IncomingEventBus,
    outGW: OutMessageGateway): Props =
    Props(classOf[MeetingActor], props, bus, outGW)
}

class MeetingActor(
    val props: MeetingProperties,
    val bus: IncomingEventBus,
    val outGW: OutMessageGateway) extends Actor with ActorLogging {

  val chatModel = new ChatModel()
  val layoutModel = new LayoutModel()
  val pollModel = new PollModel()
  val wbModel = new WhiteboardModel()
  val presModel = new PresentationModel()
  val breakoutModel = new BreakoutRoomModel()
  val captionModel = new CaptionModel()

  // We extract the meeting handlers into this class so it is easy to test.
  val liveMeeting = new LiveMeeting(props, bus, outGW, chatModel, layoutModel, pollModel,
    wbModel, presModel, breakoutModel, captionModel)

  /**
   * Put the internal message injector into another actor so this actor is easy to test.
   */
  var actorMonitor = context.actorOf(MeetingActorInternal.props(props, bus, outGW))

  def receive = {
    case msg: MonitorNumberOfUsers => liveMeeting.handleMonitorNumberOfWebUsers(msg)

    case _ => // do nothing
  }

}
