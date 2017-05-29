package org.bigbluebutton.api2

import java.util
import java.util.Map

import scala.collection.JavaConverters._
import akka.actor.ActorSystem
import org.bigbluebutton.api2.bus._
import org.bigbluebutton.api2.endpoint.redis.{AppsRedisSubscriberActor, MessageSender, RedisPublisher}
import org.bigbluebutton.api2.meeting.{CreateMeetingMsg, MeetingsManagerActor, RegisterUser}
import org.bigbluebutton.common2.domain._

import scala.concurrent.duration._

class BbbWebApiGWApp(val oldMessageReceivedGW: OldMessageReceivedGW) extends IBbbWebApiGWApp with SystemConfiguration{

  implicit val system = ActorSystem("bbb-web-common")
  implicit val timeout = akka.util.Timeout(3 seconds)

  private val jsonMsgToAkkaAppsBus = new JsonMsgToAkkaAppsBus
  private val redisPublisher = new RedisPublisher(system)
  private val msgSender: MessageSender = new MessageSender(redisPublisher)
  private val messageSenderActorRef = system.actorOf(
    MessageSenderActor.props(msgSender), "messageSenderActor")

  jsonMsgToAkkaAppsBus.subscribe(messageSenderActorRef, toAkkaAppsJsonChannel)

  private val receivedJsonMsgBus = new JsonMsgFromAkkaAppsBus
  private val oldMessageEventBus = new OldMessageEventBus
  private val msgFromAkkaAppsEventBus = new MsgFromAkkaAppsEventBus
  private val msgToAkkaAppsEventBus = new MsgToAkkaAppsEventBus

  private val meetingManagerActorRef = system.actorOf(
    MeetingsManagerActor.props(msgToAkkaAppsEventBus), "meetingManagerActor")
  msgFromAkkaAppsEventBus.subscribe(meetingManagerActorRef, fromAkkaAppsChannel)

  private val msgToAkkaAppsToJsonActor = system.actorOf(
    MsgToAkkaAppsToJsonActor.props(jsonMsgToAkkaAppsBus), "msgToAkkaAppsToJsonActor")

  msgToAkkaAppsEventBus.subscribe(msgToAkkaAppsToJsonActor, toAkkaAppsChannel)

  private val appsRedisSubscriberActor = system.actorOf(
    AppsRedisSubscriberActor.props(receivedJsonMsgBus,oldMessageEventBus), "appsRedisSubscriberActor")

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
    jsonMsgToAkkaAppsBus.publish(JsonMsgToAkkaAppsBusMsg(toAkkaAppsJsonChannel, new JsonMsgToSendToAkkaApps(channel, json)))
  }

  def createMeeting(meetingId: String, extMeetingId: String, parentMeetingId: String, meetingName: String,
                    recorded: java.lang.Boolean, voiceBridge: String, duration: java.lang.Integer,
                    autoStartRecording: java.lang.Boolean,
                    allowStartStopRecording: java.lang.Boolean, webcamsOnlyForModerator: java.lang.Boolean, moderatorPass: String,
                    viewerPass: String, createTime: java.lang.Long, createDate: String, isBreakout: java.lang.Boolean,
                    sequence: java.lang.Integer,
                    metadata: java.util.Map[String, String], guestPolicy: String,
                    welcomeMsgTemplate: String, welcomeMsg: String, modOnlyMessage: String,
                   dialNumber: String, maxUsers: java.lang.Integer): Unit = {

    val meetingProp = MeetingProp(name = meetingName, extId = extMeetingId, intId = meetingId,
      isBreakout = isBreakout.booleanValue())
    val durationProps = DurationProps(duration = duration, createdTime = createTime, createDate)
    val password = PasswordProp(moderatorPass = moderatorPass, viewerPass = viewerPass)
    val recordProp = RecordProp(record = recorded, autoStartRecording = autoStartRecording,
      allowStartStopRecording = allowStartStopRecording)
    val breakoutProps = BreakoutProps(parentId = parentMeetingId, sequence = sequence, breakoutRooms = Vector())
    val welcomeProp = WelcomeProp(welcomeMsgTemplate = welcomeMsgTemplate, welcomeMsg = welcomeMsg,
      modOnlyMessage = modOnlyMessage)
    val voiceProp = VoiceProp(telVoice = voiceBridge, voiceConf = voiceBridge, dialNumber = dialNumber)
    val usersProp = UsersProp(maxUsers = maxUsers, webcamsOnlyForModerator = webcamsOnlyForModerator,
      guestPolicy = guestPolicy)
    val metadataProp = MetadataProp(mapAsScalaMap(metadata).toMap)
    val screenshareProps = ScreenshareProps(screenshareConf = "FixMe!", red5ScreenshareIp = "fixMe!",
      red5ScreenshareApp = "fixMe!")

    val defaultProps = DefaultProps(meetingProp, breakoutProps, durationProps, password, recordProp, welcomeProp, voiceProp,
      usersProp, metadataProp, screenshareProps)

    meetingManagerActorRef ! new CreateMeetingMsg(defaultProps)
  }

  def registerUser (meetingId: String, intUserId: String, name: String,
                    role: String, extUserId: String, authToken: String, avatarURL: String,
                    guest: java.lang.Boolean, authed: java.lang.Boolean): Unit = {
    meetingManagerActorRef ! new RegisterUser(meetingId = meetingId, intUserId = intUserId, name = name,
      role = role, extUserId = extUserId, authToken = authToken, avatarURL = avatarURL,
      guest = guest, authed = authed)
  }
}
