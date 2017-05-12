package org.bigbluebutton.api.pub

import java.util

import org.bigbluebutton.api.messaging.MessageSender
import org.bigbluebutton.common.messages.MessagingConstants
import org.bigbluebutton.common2.messages.{CreateMeetingReq, CreateMeetingReqBody, Header}
import org.bigbluebutton.common2.util.JsonUtil
import org.bigbluebutton.web.services.turn.{StunServer, TurnEntry}

import scala.collection.JavaConverters._

class RedisPublisherService(sender: MessageSender) extends IPublisherService {
  def destroyMeeting (meetingId: String):Unit = {

  }

  def createMeeting(meetingId: String, extMeetingId: String, parentMeetingId: String, meetingName: String,
                    recorded: java.lang.Boolean, voiceBridge: String, duration: java.lang.Integer, autoStartRecording: java.lang.Boolean,
                    allowStartStopRecording: java.lang.Boolean, webcamsOnlyForModerator: java.lang.Boolean, moderatorPass: String,
                    viewerPass: String, createTime: java.lang.Long, createDate: String, isBreakout: java.lang.Boolean, sequence: java.lang.Integer,
                    metadata: util.Map[String, String], guestPolicy: String): Unit = {

    val body: CreateMeetingReqBody = new CreateMeetingReqBody(meetingId, extMeetingId, parentMeetingId,
    meetingName, recorded.booleanValue(), voiceBridge, duration, autoStartRecording.booleanValue(),
    allowStartStopRecording.booleanValue(), webcamsOnlyForModerator.booleanValue(), moderatorPass,
    viewerPass, createTime, createDate, isBreakout.booleanValue(), sequence,
      mapAsScalaMapConverter(metadata).asScala.toMap, guestPolicy)

    val header: Header = new Header("CreateMeetingReq")
    val msg: CreateMeetingReq = new CreateMeetingReq(header, body)

    val json = JsonUtil.toJson(msg)
    println(json)
    sender.send("bbb:to-akka-apps", json)
  }

  def endMeeting(meetingId: String): Unit = {

  }

  def send(channel: String, message: String): Unit = {

  }

  def registerUser(meetingID: String, internalUserId: String, fullname: String, role: String, externUserID: String,
                   authToken: String, avatarURL: String, guest: java.lang.Boolean, authed: java.lang.Boolean): Unit = {

  }

  def sendKeepAlive(system: String, timestamp: java.lang.Long): Unit = {

  }

  def sendStunTurnInfo(meetingId: String, internalUserId: String, stuns: util.Set[StunServer],
                       turns: util.Set[TurnEntry]): Unit = {

  }
}
