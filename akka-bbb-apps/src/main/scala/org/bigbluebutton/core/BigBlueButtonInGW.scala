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
import org.bigbluebutton.core.models.{ GuestPolicyType, Roles }

import scala.collection.JavaConverters

class BigBlueButtonInGW(
    val system: ActorSystem,
    eventBus:   IncomingEventBus,
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
        val policy = msg.payload.guestPolicy.toUpperCase() match {
          case "ALWAYS_ACCEPT" => GuestPolicyType.ALWAYS_ACCEPT
          case "ALWAYS_DENY"   => GuestPolicyType.ALWAYS_DENY
          case "ASK_MODERATOR" => GuestPolicyType.ASK_MODERATOR
          //default
          case undef           => GuestPolicyType.ASK_MODERATOR
        }
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

  def lockSettings(meetingID: String, locked: java.lang.Boolean,
                   lockSettings: java.util.Map[String, java.lang.Boolean]) {
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
  def validateAuthToken(meetingId: String, userId: String, token: String, correlationId: String, sessionId: String) {
    eventBus.publish(BigBlueButtonEvent(meetingId, new ValidateAuthToken(meetingId, userId, token, correlationId, sessionId)))
  }

  def registerUser(meetingID: String, userID: String, name: String, role: String, extUserID: String,
                   authToken: String, avatarURL: String, guest: java.lang.Boolean, authed: java.lang.Boolean): Unit = {
    val userRole = if (role == "MODERATOR") Roles.MODERATOR_ROLE else Roles.VIEWER_ROLE
    eventBus.publish(BigBlueButtonEvent(meetingID, new RegisterUser(meetingID, userID, name, userRole,
      extUserID, authToken, avatarURL, guest, authed)))
  }

  def sendLockSettings(meetingID: String, userId: String, settings: java.util.Map[String, java.lang.Boolean]) {
    // Convert java.util.Map to scala.collection.immutable.Map
    // settings.mapValues -> convaert java Map to scala mutable Map
    // v => v.booleanValue() -> convert java Boolean to Scala Boolean
    // toMap -> converts from scala mutable map to scala immutable map
    val s = settings.mapValues(v => v.booleanValue() /* convert java Boolean to Scala Boolean */ ).toMap
    val disableCam = s.getOrElse("disableCam", false)
    val disableMic = s.getOrElse("disableMic", false)
    val disablePrivChat = s.getOrElse("disablePrivateChat", false)
    val disablePubChat = s.getOrElse("disablePublicChat", false)
    val lockedLayout = s.getOrElse("lockedLayout", false)
    val lockOnJoin = s.getOrElse("lockOnJoin", false)
    val lockOnJoinConfigurable = s.getOrElse("lockOnJoinConfigurable", false)

    val permissions = new Permissions(
      disableCam = disableCam,
      disableMic = disableMic,
      disablePrivChat = disablePrivChat,
      disablePubChat = disablePubChat,
      lockedLayout = lockedLayout,
      lockOnJoin = lockOnJoin,
      lockOnJoinConfigurable = lockOnJoinConfigurable
    )

    eventBus.publish(BigBlueButtonEvent(meetingID, new SetLockSettings(meetingID, userId, permissions)))
  }

  def initLockSettings(meetingID: String, settings: java.util.Map[String, java.lang.Boolean]) {
    // Convert java.util.Map to scala.collection.immutable.Map
    // settings.mapValues -> convert java Map to scala mutable Map
    // v => v.booleanValue() -> convert java Boolean to Scala Boolean
    // toMap -> converts from scala mutable map to scala immutable map
    val s = settings.mapValues(v => v.booleanValue() /* convert java Boolean to Scala Boolean */ ).toMap
    val disableCam = s.getOrElse("disableCam", false)
    val disableMic = s.getOrElse("disableMic", false)
    val disablePrivChat = s.getOrElse("disablePrivateChat", false)
    val disablePubChat = s.getOrElse("disablePublicChat", false)
    val lockedLayout = s.getOrElse("lockedLayout", false)
    val lockOnJoin = s.getOrElse("lockOnJoin", false)
    val lockOnJoinConfigurable = s.getOrElse("lockOnJoinConfigurable", false)
    val permissions = new Permissions(
      disableCam = disableCam,
      disableMic = disableMic,
      disablePrivChat = disablePrivChat,
      disablePubChat = disablePubChat,
      lockedLayout = lockedLayout,
      lockOnJoin = lockOnJoin,
      lockOnJoinConfigurable = lockOnJoinConfigurable
    )

    eventBus.publish(BigBlueButtonEvent(meetingID, new InitLockSettings(meetingID, permissions)))
  }

  def getLockSettings(meetingId: String, userId: String) {
    eventBus.publish(BigBlueButtonEvent(meetingId, new GetLockSettings(meetingId, userId)))
  }

  def setRecordingStatus(meetingId: String, userId: String, recording: java.lang.Boolean) {
    eventBus.publish(BigBlueButtonEvent(meetingId, new SetRecordingStatus(meetingId, userId, recording.booleanValue())))
  }

  def getRecordingStatus(meetingId: String, userId: String) {
    eventBus.publish(BigBlueButtonEvent(meetingId, new GetRecordingStatus(meetingId, userId)))
  }

  // Users
  def userEmojiStatus(meetingId: String, userId: String, emojiStatus: String) {
    eventBus.publish(BigBlueButtonEvent(meetingId, new UserEmojiStatus(meetingId, userId, emojiStatus)))
  }

  def ejectUserFromMeeting(meetingId: String, userId: String, ejectedBy: String) {

  }

  def logoutEndMeeting(meetingId: String, userId: String) {
    eventBus.publish(BigBlueButtonEvent(meetingId, new LogoutEndMeeting(meetingId, userId)))
  }

  def shareWebcam(meetingId: String, userId: String, stream: String) {
    eventBus.publish(BigBlueButtonEvent(meetingId, new UserShareWebcam(meetingId, userId, stream)))
  }

  def unshareWebcam(meetingId: String, userId: String, stream: String) {
    eventBus.publish(BigBlueButtonEvent(meetingId, new UserUnshareWebcam(meetingId, userId, stream)))
  }

  def setUserStatus(meetingID: String, userID: String, status: String, value: Object) {
    eventBus.publish(BigBlueButtonEvent(meetingID, new ChangeUserStatus(meetingID, userID, status, value)))
  }

  def setUserRole(meetingID: String, userID: String, role: String) {

  }

  def getUsers(meetingID: String, requesterID: String) {
    eventBus.publish(BigBlueButtonEvent(meetingID, new GetUsers(meetingID, requesterID)))
  }

  def userLeft(meetingID: String, userID: String, sessionId: String): Unit = {
    eventBus.publish(BigBlueButtonEvent(meetingID, new UserLeaving(meetingID, userID, sessionId)))
  }

  def userJoin(meetingID: String, userID: String, authToken: String): Unit = {
    eventBus.publish(BigBlueButtonEvent(meetingID, new UserJoining(meetingID, userID, authToken)))
  }

  def checkIfAllowedToShareDesktop(meetingID: String, userID: String): Unit = {
    eventBus.publish(BigBlueButtonEvent(meetingID, AllowUserToShareDesktop(
      meetingID: String,
      userID: String
    )))
  }

  def assignPresenter(meetingID: String, newPresenterID: String, newPresenterName: String, assignedBy: String): Unit = {
    eventBus.publish(BigBlueButtonEvent(meetingID, new AssignPresenter(meetingID, newPresenterID, newPresenterName, assignedBy)))
  }

  def getCurrentPresenter(meetingID: String, requesterID: String): Unit = {
    // do nothing
  }

  /**
   * ***********************************************************************
   * Message Interface for Guest
   * *******************************************************************
   */

  def getGuestPolicy(meetingId: String, requesterId: String) {
    eventBus.publish(BigBlueButtonEvent(meetingId, new GetGuestPolicy(meetingId, requesterId)))
  }

  def setGuestPolicy(meetingId: String, guestPolicy: String, requesterId: String) {
    val policy = guestPolicy.toUpperCase() match {
      case "ALWAYS_ACCEPT" => GuestPolicyType.ALWAYS_ACCEPT
      case "ALWAYS_DENY"   => GuestPolicyType.ALWAYS_DENY
      case "ASK_MODERATOR" => GuestPolicyType.ASK_MODERATOR
      //default
      case undef           => GuestPolicyType.ASK_MODERATOR
    }
    eventBus.publish(BigBlueButtonEvent(meetingId, new SetGuestPolicy(meetingId, policy, requesterId)))
  }

  def responseToGuest(meetingId: String, userId: String, response: java.lang.Boolean, requesterId: String) {
    eventBus.publish(BigBlueButtonEvent(meetingId, new RespondToGuest(meetingId, userId, response, requesterId)))
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
