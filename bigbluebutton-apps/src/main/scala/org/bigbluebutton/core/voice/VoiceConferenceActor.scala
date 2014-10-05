package org.bigbluebutton.core.voice

import scala.actors.Actor
import scala.actors.Actor._

case class MuteAllUsers(meetingId: String, except: Option[Seq[String]])
case class MuteUser(meetingId: String, userId: String)
case class UnmuteUser(meetingId: String, userId: String)
case class EjectVoiceUser(meetingId: String, userId: String)


class VoiceConferenceActor(val meetingId: String, 
                           val voiceConf: String) { //extends Actor {
  

}