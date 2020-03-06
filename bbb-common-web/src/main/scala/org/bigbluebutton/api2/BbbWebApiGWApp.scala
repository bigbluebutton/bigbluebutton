package org.bigbluebutton.api2

import scala.collection.JavaConverters._
import akka.actor.ActorSystem
import akka.event.Logging
import org.bigbluebutton.api.domain.{ BreakoutRoomsParams, LockSettingsParams }
import org.bigbluebutton.api.messaging.converters.messages._
import org.bigbluebutton.api2.bus._
import org.bigbluebutton.api2.endpoint.redis.WebRedisSubscriberActor
import org.bigbluebutton.common2.redis.MessageSender
import org.bigbluebutton.api2.meeting.{ OldMeetingMsgHdlrActor, RegisterUser }
import org.bigbluebutton.common2.domain._
import org.bigbluebutton.common2.util.JsonUtil
import org.bigbluebutton.presentation.messages._

import scala.concurrent.duration._
import org.bigbluebutton.common2.redis._
import org.bigbluebutton.common2.bus._

class BbbWebApiGWApp(
    val oldMessageReceivedGW:        OldMessageReceivedGW,
    val screenshareRtmpServer:       String,
    val screenshareRtmpBroadcastApp: String,
    val screenshareConfSuffix:       String,
    redisHost:                       String,
    redisPort:                       Int,
    redisPassword:                   String,
    redisExpireKey:                  Int
) extends IBbbWebApiGWApp with SystemConfiguration {

  implicit val system = ActorSystem("bbb-web-common")

  implicit val timeout = akka.util.Timeout(3 seconds)

  val log = Logging(system, getClass)

  private val jsonMsgToAkkaAppsBus = new JsonMsgToAkkaAppsBus

  val redisPass = if (redisPassword != "") Some(redisPassword) else None
  val redisConfig = RedisConfig(redisHost, redisPort, redisPass, redisExpireKey)

  var redisStorage = new RedisStorageService()
  redisStorage.setHost(redisConfig.host)
  redisStorage.setPort(redisConfig.port)
  val redisPassStr = redisConfig.password match {
    case Some(pass) => pass
    case None       => ""
  }
  redisStorage.setPassword(redisPassStr)
  redisStorage.setExpireKey(redisConfig.expireKey)
  redisStorage.setClientName("BbbWebRedisStore")
  redisStorage.start()

  private val redisPublisher = new RedisPublisher(system, "BbbWebPub", redisConfig)

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
    OldMeetingMsgHdlrActor.props(oldMessageReceivedGW), "oldMeetingMsgHdlrActor"
  )
  msgFromAkkaAppsEventBus.subscribe(oldMeetingMsgHdlrActor, fromAkkaAppsChannel)

  private val msgToAkkaAppsToJsonActor = system.actorOf(
    MsgToAkkaAppsToJsonActor.props(jsonMsgToAkkaAppsBus), "msgToAkkaAppsToJsonActor"
  )

  msgToAkkaAppsEventBus.subscribe(msgToAkkaAppsToJsonActor, toAkkaAppsChannel)

  // Not used but needed by internal class (ralam april 4, 2019)
  val incomingJsonMessageBus = new IncomingJsonMessageBus

  val channelsToSubscribe = Seq(fromAkkaAppsRedisChannel)
  private val appsRedisSubscriberActor = system.actorOf(
    WebRedisSubscriberActor.props(
      system,
      receivedJsonMsgBus,
      oldMessageEventBus,
      incomingJsonMessageBus,
      redisConfig,
      channelsToSubscribe,
      Nil,
      fromAkkaAppsJsonChannel,
      fromAkkaAppsOldJsonChannel
    ),
    "appsRedisSubscriberActor"
  )

  private val receivedJsonMsgHdlrActor = system.actorOf(
    ReceivedJsonMsgHdlrActor.props(msgFromAkkaAppsEventBus), "receivedJsonMsgHdlrActor"
  )

  receivedJsonMsgBus.subscribe(receivedJsonMsgHdlrActor, fromAkkaAppsJsonChannel)

  private val oldMessageJsonReceiverActor = system.actorOf(
    OldMessageJsonReceiverActor.props(oldMessageReceivedGW), "oldMessageJsonReceiverActor"
  )

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
                    userInactivityInspectTimerInMinutes:    java.lang.Integer,
                    userInactivityThresholdInMinutes:       java.lang.Integer,
                    userActivitySignResponseDelayInMinutes: java.lang.Integer,
                    muteOnStart:                            java.lang.Boolean,
                    allowModsToUnmuteUsers:                 java.lang.Boolean,
                    keepEvents:                             java.lang.Boolean,
                    breakoutParams:                         BreakoutRoomsParams,
                    lockSettingsParams:                     LockSettingsParams): Unit = {

    val meetingProp = MeetingProp(name = meetingName, extId = extMeetingId, intId = meetingId,
      isBreakout = isBreakout.booleanValue())
    val durationProps = DurationProps(
      duration = duration.intValue(),
      createdTime = createTime.longValue(), createDate,
      maxInactivityTimeoutMinutes = maxInactivityTimeoutMinutes.intValue(),
      warnMinutesBeforeMax = warnMinutesBeforeMax.intValue(),
      meetingExpireIfNoUserJoinedInMinutes = meetingExpireIfNoUserJoinedInMinutes.intValue(),
      meetingExpireWhenLastUserLeftInMinutes = meetingExpireWhenLastUserLeftInMinutes.intValue(),
      userInactivityInspectTimerInMinutes = userInactivityInspectTimerInMinutes.intValue(),
      userInactivityThresholdInMinutes = userInactivityThresholdInMinutes.intValue(),
      userActivitySignResponseDelayInMinutes = userActivitySignResponseDelayInMinutes.intValue()
    )

    val password = PasswordProp(moderatorPass = moderatorPass, viewerPass = viewerPass)
    val recordProp = RecordProp(record = recorded.booleanValue(), autoStartRecording = autoStartRecording.booleanValue(),
      allowStartStopRecording = allowStartStopRecording.booleanValue(), keepEvents = keepEvents.booleanValue())

    val breakoutProps = BreakoutProps(
      parentId = parentMeetingId,
      sequence = sequence.intValue(),
      freeJoin = freeJoin.booleanValue(),
      breakoutRooms = Vector(),
      enabled = breakoutParams.enabled.booleanValue(),
      record = breakoutParams.record.booleanValue(),
      privateChatEnabled = breakoutParams.privateChatEnabled.booleanValue()
    )

    val welcomeProp = WelcomeProp(welcomeMsgTemplate = welcomeMsgTemplate, welcomeMsg = welcomeMsg,
      modOnlyMessage = modOnlyMessage)
    val voiceProp = VoiceProp(telVoice = voiceBridge, voiceConf = voiceBridge, dialNumber = dialNumber, muteOnStart = muteOnStart.booleanValue())
    val usersProp = UsersProp(maxUsers = maxUsers.intValue(), webcamsOnlyForModerator = webcamsOnlyForModerator.booleanValue(),
      guestPolicy = guestPolicy, allowModsToUnmuteUsers = allowModsToUnmuteUsers.booleanValue())
    val metadataProp = MetadataProp(mapAsScalaMap(metadata).toMap)
    val screenshareProps = ScreenshareProps(
      screenshareConf = voiceBridge + screenshareConfSuffix,
      red5ScreenshareIp = screenshareRtmpServer,
      red5ScreenshareApp = screenshareRtmpBroadcastApp
    )

    val lockSettingsProps = LockSettingsProps(
      disableCam = lockSettingsParams.disableCam.booleanValue(),
      disableMic = lockSettingsParams.disableMic.booleanValue(),
      disablePrivateChat = lockSettingsParams.disablePrivateChat.booleanValue(),
      disablePublicChat = lockSettingsParams.disablePublicChat.booleanValue(),
      disableNote = lockSettingsParams.disableNote.booleanValue(),
      hideUserList = lockSettingsParams.hideUserList.booleanValue(),
      lockedLayout = lockSettingsParams.lockedLayout.booleanValue(),
      lockOnJoin = lockSettingsParams.lockOnJoin.booleanValue(),
      lockOnJoinConfigurable = lockSettingsParams.lockOnJoinConfigurable.booleanValue()
    )

    val defaultProps = DefaultProps(
      meetingProp,
      breakoutProps,
      durationProps,
      password,
      recordProp,
      welcomeProp,
      voiceProp,
      usersProp,
      metadataProp,
      screenshareProps,
      lockSettingsProps
    )

    //meetingManagerActorRef ! new CreateMeetingMsg(defaultProps)

    val event = MsgBuilder.buildCreateMeetingRequestToAkkaApps(defaultProps)
    msgToAkkaAppsEventBus.publish(MsgToAkkaApps(toAkkaAppsChannel, event))

  }

  def registerUser(meetingId: String, intUserId: String, name: String,
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

  def ejectDuplicateUser(meetingId: String, intUserId: String, name: String, extUserId: String): Unit = {
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

  def publishedRecording(msg: PublishedRecordingMessage): Unit = {
    val event = MsgBuilder.buildPublishedRecordingSysMsg(msg)
    // Probably violating something here, but a new event bus looks just too much for this
    msgSender.send(fromBbbWebRedisChannel, JsonUtil.toJson(event))
  }

  def unpublishedRecording(msg: UnpublishedRecordingMessage): Unit = {
    val event = MsgBuilder.buildUnpublishedRecordingSysMsg(msg)
    // Probably violating something here, but a new event bus looks just too much for this
    msgSender.send(fromBbbWebRedisChannel, JsonUtil.toJson(event))
  }

  def deletedRecording(msg: DeletedRecordingMessage): Unit = {
    val event = MsgBuilder.buildDeletedRecordingSysMsg(msg)
    // Probably violating something here, but a new event bus looks just too much for this
    msgSender.send(fromBbbWebRedisChannel, JsonUtil.toJson(event))
  }

  def sendDocConversionMsg(msg: IDocConversionMsg): Unit = {
    if (msg.isInstanceOf[DocPageGeneratedProgress]) {
      val event = MsgBuilder.buildPresentationPageGeneratedPubMsg(msg.asInstanceOf[DocPageGeneratedProgress])
      msgToAkkaAppsEventBus.publish(MsgToAkkaApps(toAkkaAppsChannel, event))

      // Send new event with page urls
      val newEvent = MsgBuilder.buildPresentationPageConvertedSysMsg(msg.asInstanceOf[DocPageGeneratedProgress])
      msgToAkkaAppsEventBus.publish(MsgToAkkaApps(toAkkaAppsChannel, newEvent))
    } else if (msg.isInstanceOf[OfficeDocConversionProgress]) {
      val event = MsgBuilder.buildPresentationConversionUpdateSysPubMsg(msg.asInstanceOf[OfficeDocConversionProgress])
      msgToAkkaAppsEventBus.publish(MsgToAkkaApps(toAkkaAppsChannel, event))
    } else if (msg.isInstanceOf[DocPageCompletedProgress]) {
      val event = MsgBuilder.buildPresentationConversionCompletedSysPubMsg(msg.asInstanceOf[DocPageCompletedProgress])
      msgToAkkaAppsEventBus.publish(MsgToAkkaApps(toAkkaAppsChannel, event))

      // Send new event with page urls
      val newEvent = MsgBuilder.buildPresentationConversionEndedSysMsg(msg.asInstanceOf[DocPageCompletedProgress])
      msgToAkkaAppsEventBus.publish(MsgToAkkaApps(toAkkaAppsChannel, newEvent))

    } else if (msg.isInstanceOf[DocPageCountFailed]) {
      val event = MsgBuilder.buildPresentationPageCountFailedSysPubMsg(msg.asInstanceOf[DocPageCountFailed])
      msgToAkkaAppsEventBus.publish(MsgToAkkaApps(toAkkaAppsChannel, event))
    } else if (msg.isInstanceOf[DocPageCountExceeded]) {
      val event = MsgBuilder.buildPresentationPageCountExceededSysPubMsg(msg.asInstanceOf[DocPageCountExceeded])
      msgToAkkaAppsEventBus.publish(MsgToAkkaApps(toAkkaAppsChannel, event))
    } else if (msg.isInstanceOf[PdfConversionInvalid]) {
      val event = MsgBuilder.buildPdfConversionInvalidErrorSysPubMsg(msg.asInstanceOf[PdfConversionInvalid])
      msgToAkkaAppsEventBus.publish(MsgToAkkaApps(toAkkaAppsChannel, event))
    } else if (msg.isInstanceOf[DocConversionRequestReceived]) {
      val event = MsgBuilder.buildPresentationConversionRequestReceivedSysMsg(msg.asInstanceOf[DocConversionRequestReceived])
      msgToAkkaAppsEventBus.publish(MsgToAkkaApps(toAkkaAppsChannel, event))
    } else if (msg.isInstanceOf[DocPageConversionStarted]) {
      val event = MsgBuilder.buildPresentationPageConversionStartedSysMsg(msg.asInstanceOf[DocPageConversionStarted])
      msgToAkkaAppsEventBus.publish(MsgToAkkaApps(toAkkaAppsChannel, event))
    }
  }

/*** Caption API ***/
  def generateSingleUseCaptionToken(recordId: String, caption: String, expirySeconds: Long): String = {
    redisStorage.generateSingleUseCaptionToken(recordId, caption, expirySeconds)
  }

  def validateSingleUseCaptionToken(token: String, meetingId: String, caption: String): Boolean = {
    redisStorage.validateSingleUseCaptionToken(token, meetingId, caption)
  }
}
