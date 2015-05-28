package org.bigbluebutton.core.voice

import akka.actor._
import akka.actor.ActorLogging

case class MuteAllUsers(meetingId: String, except: Option[Seq[String]])
case class MuteUser(meetingId: String, userId: String)
case class UnmuteUser(meetingId: String, userId: String)
case class EjectVoiceUser(meetingId: String, userId: String)

class VoiceConferenceActor(val meetingId: String,
    val voiceConf: String) { //extends Actor {

}