package org.bigbluebutton.api.pub

import java.util

import org.bigbluebutton.api.messaging.MessageSender
import org.bigbluebutton.web.services.turn.{StunServer, TurnEntry}


class RedisPublisherService(sender: MessageSender) extends IPublisherService {
  def destroyMeeting (meetingId: String):Unit = {

  }

  def createMeeting(meetingId: String, extMeetingId: String, parentMeetingId: String, meetingName: String,
                    recorded: java.lang.Boolean, voiceBridge: String, duration: java.lang.Integer, autoStartRecording: java.lang.Boolean,
                    allowStartStopRecording: java.lang.Boolean, webcamsOnlyForModerator: java.lang.Boolean, moderatorPass: String,
                    viewerPass: String, createTime: java.lang.Long, createDate: String, isBreakout: java.lang.Boolean, sequence: java.lang.Integer,
                    metadata: util.Map[String, String], guestPolicy: String): Unit = {

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
