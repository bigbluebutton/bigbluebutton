package org.bigbluebutton.core.messages

abstract class Message

case class CreateMeeting(id: String) extends Message
case class UserJoin(id: String, name: String) extends Message
case class UserLeft(id: String) extends Message

// Poll Messages
case class CreatePoll(id: String, title: String) extends Message
case class StopPoll(id: String) extends Message
case class UpdatePoll(id: String) extends Message
case class StartPoll(id: String) extends Message