package org.bigbluebutton.core.messages

abstract class Message

case class CreateMeeting(id: String) extends Message
case class UserJoin(id: String, name: String) extends Message
case class UserLeft(id: String) extends Message

