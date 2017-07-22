package org.bigbluebutton.core

import org.bigbluebutton.core.bus._
import org.bigbluebutton.core.api._

import scala.collection.JavaConversions._
import akka.actor.ActorSystem
import org.bigbluebutton.common.messages.IBigBlueButtonMessage
import org.bigbluebutton.common.messages.PubSubPingMessage
import org.bigbluebutton.messages._
import akka.event.Logging
import org.bigbluebutton.SystemConfiguration

import scala.collection.JavaConverters

class BigBlueButtonInGW(
    val system: ActorSystem,
    eventBus:   InternalEventBus,
    bbbMsgBus:  BbbMsgRouterEventBus,
    outGW:      OutMessageGateway
) extends IBigBlueButtonInGW with SystemConfiguration {

  val log = Logging(system, getClass)
  val bbbActor = system.actorOf(BigBlueButtonActor.props(system, eventBus, bbbMsgBus, outGW), "bigbluebutton-actor")
  eventBus.subscribe(bbbActor, meetingManagerChannel)

  /** For OLD Messaged **/
  eventBus.subscribe(bbbActor, "meeting-manager")

  def handleBigBlueButtonMessage(message: IBigBlueButtonMessage) {
    message match {
      case msg: PubSubPingMessage => {
        eventBus.publish(
          BigBlueButtonEvent("meeting-manager", new PubSubPing(msg.payload.system, msg.payload.timestamp))
        )
      }

      case msg: CreateMeetingRequest => {
        /*val policy = msg.payload.guestPolicy.toUpperCase() match {
          case "ALWAYS_ACCEPT" => GuestPolicyType.ALWAYS_ACCEPT
          case "ALWAYS_DENY"   => GuestPolicyType.ALWAYS_DENY
          case "ASK_MODERATOR" => GuestPolicyType.ASK_MODERATOR
          //default
          case undef           => GuestPolicyType.ASK_MODERATOR
        }*/
        /*
        val mProps = new MeetingProperties(
          msg.payload.id,
          msg.payload.externalId,
          msg.payload.parentId,
          msg.payload.name,
          msg.payload.record,
          msg.payload.voiceConfId,
          msg.payload.voiceConfId + "-DESKSHARE", // WebRTC Desktop conference id
          msg.payload.durationInMinutes,
          msg.payload.autoStartRecording,
          msg.payload.allowStartStopRecording,
          msg.payload.webcamsOnlyForModerator,
          msg.payload.moderatorPassword,
          msg.payload.viewerPassword,
          msg.payload.createTime,
          msg.payload.createDate,
          red5DeskShareIP, red5DeskShareApp,
          msg.payload.isBreakout,
          msg.payload.sequence,
          mapAsScalaMap(msg.payload.metadata).toMap, // Convert to scala immutable map
          policy
        )

        eventBus.publish(BigBlueButtonEvent("meeting-manager", new CreateMeeting(msg.payload.id, mProps)))
        */
      }
    }
  }

  def destroyMeeting(meetingID: String) {
    eventBus.publish(
      BigBlueButtonEvent(
        "meeting-manager",
        new DestroyMeetingInternalMsg(
          meetingID
        )
      )
    )
  }

  def getAllMeetings(meetingID: String) {
    eventBus.publish(BigBlueButtonEvent("meeting-manager", new GetAllMeetingsRequest("meetingId")))
  }

  def isAliveAudit(aliveId: String) {
    eventBus.publish(BigBlueButtonEvent("meeting-manager", new KeepAliveMessage(aliveId)))
  }

  def statusMeetingAudit(meetingID: String) {

  }

  def endMeeting(meetingId: String) {
    eventBus.publish(BigBlueButtonEvent(meetingId, new EndMeeting(meetingId)))
  }

  def endAllMeetings() {

  }

  def activityResponse(meetingId: String) {
    eventBus.publish(BigBlueButtonEvent(meetingId, new ActivityResponse(meetingId)))
  }

  /**
   * ***********************************************************
   * Message Interface for Users
   * ***********************************************************
   */

  def setRecordingStatus(meetingId: String, userId: String, recording: java.lang.Boolean) {
    eventBus.publish(BigBlueButtonEvent(meetingId, new SetRecordingStatus(meetingId, userId, recording.booleanValue())))
  }

  def getRecordingStatus(meetingId: String, userId: String) {
    eventBus.publish(BigBlueButtonEvent(meetingId, new GetRecordingStatus(meetingId, userId)))
  }

  /**
   * *******************************************************************
   * Message Interface for DeskShare
   * *****************************************************************
   */
  def deskShareStarted(confId: String, callerId: String, callerIdName: String) {
    println("____BigBlueButtonInGW::deskShareStarted " + confId + callerId + "    " +
      callerIdName)
    eventBus.publish(BigBlueButtonEvent(confId, new DeskShareStartedRequest(confId, callerId,
      callerIdName)))
  }

  def deskShareStopped(meetingId: String, callerId: String, callerIdName: String) {
    eventBus.publish(BigBlueButtonEvent(meetingId, new DeskShareStoppedRequest(meetingId, callerId, callerIdName)))
  }

  def deskShareRTMPBroadcastStarted(meetingId: String, streamname: String, videoWidth: Int, videoHeight: Int, timestamp: String) {
    eventBus.publish(BigBlueButtonEvent(meetingId, new DeskShareRTMPBroadcastStartedRequest(meetingId, streamname, videoWidth, videoHeight, timestamp)))
  }

  def deskShareRTMPBroadcastStopped(meetingId: String, streamname: String, videoWidth: Int, videoHeight: Int, timestamp: String) {
    eventBus.publish(BigBlueButtonEvent(meetingId, new DeskShareRTMPBroadcastStoppedRequest(meetingId, streamname, videoWidth, videoHeight, timestamp)))
  }

  def deskShareGetInfoRequest(meetingId: String, requesterId: String, replyTo: String): Unit = {
    eventBus.publish(BigBlueButtonEvent(meetingId, new DeskShareGetDeskShareInfoRequest(meetingId, requesterId, replyTo)))
  }
}
