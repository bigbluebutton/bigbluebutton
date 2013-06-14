package org.bigbluebutton.core.api

object Role extends Enumeration {
	type Role = Value
	val MODERATOR = Value("MODERATOR")
	val VIEWER = Value("VIEWER")
}

case class Presenter(presenterID: String, presenterName: String, assignedBy: String)
case class UserVO(userID: String, externUserID: String, name: String, role: String, raiseHand: Boolean, presenter: Boolean, hasStream: Boolean)