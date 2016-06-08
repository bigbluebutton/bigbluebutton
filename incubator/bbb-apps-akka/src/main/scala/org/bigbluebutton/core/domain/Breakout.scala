package org.bigbluebutton.core.domain

case class BreakoutId(value: String) extends AnyVal

case class BreakoutUser(id: String, name: String)

case class BreakoutRoom(
  id: String,
  name: String,
  voiceConfId: String,
  assignedUsers: Vector[String],
  users: Vector[BreakoutUser],
  defaultPresentationURL: String)
