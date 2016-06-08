package org.bigbluebutton.core

import akka.actor._
import akka.actor.ActorLogging
import akka.util.Timeout
import scala.concurrent.duration._
import org.bigbluebutton.core.bus._
import org.bigbluebutton.core.api._
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.core.domain._

object BigBlueButtonActor extends SystemConfiguration {
  def props(system: ActorSystem,
    eventBus: IncomingEventBus,
    outGW: OutMessageGateway): Props =
    Props(classOf[BigBlueButtonActor], system, eventBus, outGW)
}

class BigBlueButtonActor(val system: ActorSystem,
    eventBus: IncomingEventBus, outGW: OutMessageGateway) extends Actor with ActorLogging {

  implicit def executionContext = system.dispatcher
  implicit val timeout = Timeout(5 seconds)

  private var meetings = new collection.immutable.HashMap[String, RunningMeeting]

  def receive = {
    case msg: CreateMeeting2x => handleCreateMeeting(msg)
    case msg: DestroyMeeting => handleDestroyMeeting(msg)
    case msg: KeepAliveMessage => handleKeepAliveMessage(msg)
    case msg: PubSubPing => handlePubSubPingMessage(msg)
    case msg: ValidateAuthToken => handleValidateAuthToken(msg)
    case msg: GetAllMeetingsRequest => handleGetAllMeetingsRequest(msg)
    // case _ => // do nothing
  }

  private def handleValidateAuthToken(msg: ValidateAuthToken) {
    meetings.get(msg.meetingId.value) foreach (m => m.actorRef ! msg)
  }

  private def handleKeepAliveMessage(msg: KeepAliveMessage): Unit = {
    outGW.send(new KeepAliveMessageReply(msg.aliveID))
  }

  private def handlePubSubPingMessage(msg: PubSubPing): Unit = {
    outGW.send(new PubSubPong(msg.system, msg.timestamp))
  }

  private def handleDestroyMeeting(msg: DestroyMeeting) {
    log.info("Received DestroyMeeting message for meetingId={}", msg.meetingId)
    meetings.get(msg.meetingId.value) match {
      case None => log.info("Could not find meetingId={}", msg.meetingId.value)
      case Some(m) => {
        meetings -= msg.meetingId.value
        log.info("Kick everyone out on meetingId={}", msg.meetingId)
        //        if (m.mProps.isBreakout) {
        //          log.info("Informing parent meeting {} that a breakout room has been ended{}", m.mProps.extId, m.mProps.id)
        //          eventBus.publish(BigBlueButtonEvent(m.mProps.extId.value,
        //            BreakoutRoomEnded(m.mProps.extId.value, m.mProps.id.value)))
        //        }
        //        outGW.send(new EndAndKickAll(msg.meetingId, m.mProps.recorded))
        //        outGW.send(new DisconnectAllUsers(msg.meetingId))
        //        log.info("Destroyed meetingId={}", msg.meetingId)
        //        outGW.send(new MeetingDestroyed(msg.meetingId))

        /** Unsubscribe to meeting and voice events. **/
        //        eventBus.unsubscribe(m.actorRef, m.mProps.id.value)
        //        eventBus.unsubscribe(m.actorRef, m.mProps.voiceConf.value)

        // Stop the meeting actor.
        context.stop(m.actorRef)
      }
    }
  }

  private def handleCreateMeeting(msg: CreateMeeting2x): Unit = {
    meetings.get(msg.meetingId.value) match {
      case None =>
        log.info("Create meeting request. meetingId={}", msg.mProps.id)

        val m = RunningMeeting(msg.mProps, outGW, eventBus)

        /** Subscribe to meeting and voice events. **/
        eventBus.subscribe(m.actorRef, m.mProps.id.value)
        eventBus.subscribe(m.actorRef, m.mProps.voiceConf.value)

        meetings += m.mProps.id.value -> m

        outGW.send(new MeetingCreated(m.mProps.id, m.mProps))

      case Some(m) =>
        log.info("Meeting already created. meetingID={}", msg.mProps.id)
      // do nothing

    }
  }

  private def handleGetAllMeetingsRequest(msg: GetAllMeetingsRequest) {

  }

}