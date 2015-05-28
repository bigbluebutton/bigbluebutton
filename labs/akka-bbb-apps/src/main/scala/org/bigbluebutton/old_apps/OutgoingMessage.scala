package org.bigbluebutton.apps

sealed abstract class OutMsg

case class MeetingCreatedEvent(id: String) extends OutMsg