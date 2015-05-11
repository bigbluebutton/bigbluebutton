package org.bigbluebutton.apps

sealed abstract class InMsg

case class CreateMessageRequest(id: String) extends InMsg

