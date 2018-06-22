package org.bigbluebutton.api2

import scala.collection.JavaConverters._
import akka.actor.ActorSystem
import akka.event.Logging
import org.bigbluebutton.api.messaging.converters.messages._
import org.bigbluebutton.api2.bus._
import org.bigbluebutton.api2.endpoint.redis.{AppsRedisSubscriberActor, MessageSender, RedisPublisher}
import org.bigbluebutton.api2.meeting.{OldMeetingMsgHdlrActor, RegisterUser}
import org.bigbluebutton.common2.domain._
import org.bigbluebutton.presentation.messages._

import scala.concurrent.duration._

class BbbWebApiGWApp(
  val oldMessageReceivedGW:        OldMessageReceivedGW,
  val screenshareRtmpServer:       String,
  val screenshareRtmpBroadcastApp: String,
  val screenshareConfSuffix:       String) extends IBbbWebApiGWApp with SystemConfiguration {

  implicit val system = ActorSystem("bbb-web-common")

  implicit val timeout = akka.util.Timeout(3 seconds)

  val log = Logging(system, getClass)

  log.debug("*********** meetingManagerChannel = " + meetingManagerChannel)

  private val jsonMsgToAkkaAppsBus = new JsonMsgToAkkaAppsBus
  private val redisPublisher = new RedisPublisher(system)
  private val msgSender: MessageSender = new MessageSender(redisPublisher)
  private val messageSenderActorRef = system.actorOf(MessageSenderActor.props(msgSender), "messageSenderActor")

  jsonMsgToAkkaAppsBus.subscribe(messageSenderActorRef, toAkkaAppsJsonChannel)

  private val receivedJsonMsgBus = new JsonMsgFromAkkaAppsBus
  private val oldMessageEventBus = new OldMessageEventBus
  private val msgFromAkkaAppsEventBus = new MsgFromAkkaAppsEventBus
  private val msgToAkkaAppsEventBus = new MsgToAkkaAppsEventBus

  /**
   * Not used for now as we will still user MeetingService for 2.0 (ralam july 4, 2017)
   */
  //private val meetingManagerActorRef = system.actorOf(
  //  MeetingsManagerActor.props(msgToAkkaAppsEventBus), "meetingManagerActor")
  //msgFromAkkaAppsEventBus.subscribe(meetingManagerActorRef, fromAkkaAppsChannel)

  private val oldMeetingMsgHdlrActor = system.actorOf(
    OldMeetingMsgHdlrActor.props(oldMessageReceivedGW), "oldMeetingMsgHdlrActor")
  msgFromAkkaAppsEventBus.subscribe(oldMeetingMsgHdlrActor, fromAkkaAppsChannel)

  private val msgToAkkaAppsToJsonActor = system.actorOf(
    MsgToAkkaAppsToJsonActor.props(jsonMsgToAkkaAppsBus), "msgToAkkaAppsToJsonActor")

  msgToAkkaAppsEventBus.subscribe(msgToAkkaAppsToJsonActor, toAkkaAppsChannel)

  private val appsRedisSubscriberActor = system.actorOf(
    AppsRedisSubscriberActor.props(receivedJsonMsgBus, oldMessageEventBus), "appsRedisSubscriberActor")

  private val receivedJsonMsgHdlrActor = system.actorOf(
    ReceivedJsonMsgHdlrActor.props(msgFromAkkaAppsEventBus), "receivedJsonMsgHdlrActor")

  receivedJsonMsgBus.subscribe(receivedJsonMsgHdlrActor, fromAkkaAppsJsonChannel)

  private val oldMessageJsonReceiverActor = system.actorOf(
    OldMessageJsonReceiverActor.props(oldMessageReceivedGW), "oldMessageJsonReceiverActor")

  oldMessageEventBus.subscribe(oldMessageJsonReceiverActor, fromAkkaAppsOldJsonChannel)

/*****
    * External APIs for Gateway
    */
  def send(channel: String, json: String): Unit = {
    log.debug("Sending msg. channel={} msg={}", channel, json)
    jsonMsgToAkkaAppsBus.publish(JsonMsgToAkkaAppsBusMsg(toAkkaAppsJsonChannel, new JsonMsgToSendToAkkaApps(channel, json)))
  }

  def createMeeting(meetingId: String, extMeetingId: String, parentMeetingId: String, meetingName: String,
                    recorded: java.lang.Boolean, voiceBridge: String, duration: java.lang.Integer,
                    autoStartRecording:      java.lang.Boolean,
                    allowStartStopRecording: java.lang.Boolean, webcamsOnlyForModerator: java.lang.Boolean, moderatorPass: String,
                    viewerPass: String, createTime: java.lang.Long, createDate: String, isBreakout: java.lang.Boolean,
                    sequence: java.lang.Integer,
                    freeJoin: java.lang.Boolean,
                    metadata: java.util.Map[String, String], guestPolicy: String,
                    welcomeMsgTemplate: String, welcomeMsg: String, modOnlyMessage: String,
                    dialNumber: String, maxUsers: java.lang.Integer, maxInactivityTimeoutMinutes: java.lang.Integer,
                    warnMinutesBeforeMax:                   java.lang.Integer,
                    meetingExpireIfNoUserJoinedInMinutes:   java.lang.Integer,
                    meetingExpireWhenLastUserLeftInMinutes: java.lang.Integer,
                    muteOnStart:                            java.lang.Boolean): Unit = {

    val meetingProp = MeetingProp(name = meetingName, extId = extMeetingId, intId = meetingId,
      isBreakout = isBreakout.booleanValue())
    val durationProps = DurationProps(
      duration = duration.intValue(),
      createdTime = createTime.longValue(), createDate,
      maxInactivityTimeoutMinutes = maxInactivityTimeoutMinutes.intValue(),
      warnMinutesBeforeMax = warnMinutesBeforeMax.intValue(),
      meetingExpireIfNoUserJoinedInMinutes = meetingExpireIfNoUserJoinedInMinutes.intValue(),
      meetingExpireWhenLastUserLeftInMinutes = meetingExpireWhenLastUserLeftInMinutes.intValue())

    val password = PasswordProp(moderatorPass = moderatorPass, viewerPass = viewerPass)
    val recordProp = RecordProp(record = recorded.booleanValue(), autoStartRecording = autoStartRecording.booleanValue(),
      allowStartStopRecording = allowStartStopRecording.booleanValue())
    val breakoutProps = BreakoutProps(parentId = parentMeetingId, sequence = sequence.intValue(), freeJoin = freeJoin.booleanValue(), breakoutRooms = Vector())
    val welcomeProp = WelcomeProp(welcomeMsgTemplate = welcomeMsgTemplate, welcomeMsg = welcomeMsg,
      modOnlyMessage = modOnlyMessage)
    val voiceProp = VoiceProp(telVoice = voiceBridge, voiceConf = voiceBridge, dialNumber = dialNumber, muteOnStart = muteOnStart.booleanValue())
    val usersProp = UsersProp(maxUsers = maxUsers.intValue(), webcamsOnlyForModerator = webcamsOnlyForModerator.booleanValue(),
      guestPolicy = guestPolicy)
    val metadataProp = MetadataProp(mapAsScalaMap(metadata).toMap)
    val screenshareProps = ScreenshareProps(
      screenshareConf = voiceBridge + screenshareConfSuffix,
      red5ScreenshareIp = screenshareRtmpServer,
      red5ScreenshareApp = screenshareRtmpBroadcastApp)

    val defaultProps = DefaultProps(meetingProp, breakoutProps, durationProps, password, recordProp, welcomeProp, voiceProp,
      usersProp, metadataProp, screenshareProps)

    //meetingManagerActorRef ! new CreateMeetingMsg(defaultProps)

    val event = MsgBuilder.buildCreateMeetingRequestToAkkaApps(defaultProps)
    msgToAkkaAppsEventBus.publish(MsgToAkkaApps(toAkkaAppsChannel, event))

  }

  def registerUser (meetingId: String, intUserId: String, name: String,
                    role: String, extUserId: String, authToken: String, avatarURL: String,
                    guest: java.lang.Boolean, authed: java.lang.Boolean,
                    guestStatus: String): Unit = {

    //    meetingManagerActorRef ! new RegisterUser(meetingId = meetingId, intUserId = intUserId, name = name,
    //      role = role, extUserId = extUserId, authToken = authToken, avatarURL = avatarURL,
    //     guest = guest, authed = authed)

    val regUser = new RegisterUser(meetingId = meetingId, intUserId = intUserId, name = name,
      role = role, extUserId = extUserId, authToken = authToken, avatarURL = avatarURL,
      guest = guest.booleanValue(), authed = authed.booleanValue(), guestStatus = guestStatus)

    val event = MsgBuilder.buildRegisterUserRequestToAkkaApps(regUser)
    msgToAkkaAppsEventBus.publish(MsgToAkkaApps(toAkkaAppsChannel, event))
  }

  def ejectDuplicateUser (meetingId: String, intUserId: String, name: String, extUserId: String): Unit = {
    val event = MsgBuilder.buildEjectDuplicateUserRequestToAkkaApps(meetingId, intUserId, name, extUserId)
    msgToAkkaAppsEventBus.publish(MsgToAkkaApps(toAkkaAppsChannel, event))
  }

  def destroyMeeting(msg: DestroyMeetingMessage): Unit = {
    val event = MsgBuilder.buildDestroyMeetingSysCmdMsg(msg)
    msgToAkkaAppsEventBus.publish(MsgToAkkaApps(toAkkaAppsChannel, event))
  }

  def endMeeting(msg: EndMeetingMessage): Unit = {
    val event = MsgBuilder.buildEndMeetingSysCmdMsg(msg)
    msgToAkkaAppsEventBus.publish(MsgToAkkaApps(toAkkaAppsChannel, event))
  }

  def sendKeepAlive(system: String, timestamp: java.lang.Long): Unit = {
    val event = MsgBuilder.buildCheckAlivePingSysMsg(system, timestamp.longValue())
    msgToAkkaAppsEventBus.publish(MsgToAkkaApps(toAkkaAppsChannel, event))

  }

  def publishRecording(msg: PublishRecordingMessage): Unit = {

  }

  def unpublishRecording(msg: UnpublishRecordingMessage): Unit = {

  }

  def deleteRecording(msg: DeleteRecordingMessage): Unit = {

  }

  def sendDocConversionMsg(msg: IDocConversionMsg): Unit = {
    if (msg.isInstanceOf[DocPageGeneratedProgress]) {
      val event = MsgBuilder.buildPresentationPageGeneratedPubMsg(msg.asInstanceOf[DocPageGeneratedProgress])
      msgToAkkaAppsEventBus.publish(MsgToAkkaApps(toAkkaAppsChannel, event))
    } else if (msg.isInstanceOf[OfficeDocConversionProgress]) {
      val event = MsgBuilder.buildPresentationConversionUpdateSysPubMsg(msg.asInstanceOf[OfficeDocConversionProgress])
      msgToAkkaAppsEventBus.publish(MsgToAkkaApps(toAkkaAppsChannel, event))
    } else if (msg.isInstanceOf[DocPageCompletedProgress]) {
      val event = MsgBuilder.buildPresentationConversionCompletedSysPubMsg(msg.asInstanceOf[DocPageCompletedProgress])
      msgToAkkaAppsEventBus.publish(MsgToAkkaApps(toAkkaAppsChannel, event))
    } else if (msg.isInstanceOf[DocPageCountFailed]) {
      val event = MsgBuilder.buildPresentationPageCountFailedSysPubMsg(msg.asInstanceOf[DocPageCountFailed])
      msgToAkkaAppsEventBus.publish(MsgToAkkaApps(toAkkaAppsChannel, event))
    } else if (msg.isInstanceOf[DocPageCountExceeded]) {
      val event = MsgBuilder.buildPresentationPageCountExceededSysPubMsg(msg.asInstanceOf[DocPageCountExceeded])
      msgToAkkaAppsEventBus.publish(MsgToAkkaApps(toAkkaAppsChannel, event))
    }
  }
}
