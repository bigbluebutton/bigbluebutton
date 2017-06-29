package org.bigbluebutton.common2.msgs

import org.bigbluebutton.common2.domain.UserVO



  // In messages
  object GetCurrentLayoutMsg { val NAME = "GetCurrentLayoutMsg" }
  case class GetCurrentLayoutMsg(header: BbbClientMsgHeader, body: GetCurrentLayoutMsgBody) extends BbbCoreMsg
  case class GetCurrentLayoutMsgBody(meetingId: String, requesterId: String)

  object LockLayoutMsg { val NAME = "LockLayoutMsg" }
  case class LockLayoutMsg(header: BbbClientMsgHeader, body: LockLayoutMsgBody) extends BbbCoreMsg
  case class LockLayoutMsgBody(meetingId: String, setById: String, lock: Boolean, viewersOnly: Boolean,
                               layout: Option[String])

  object BroadcastLayoutMsg { val NAME = "BroadcastLayoutMsg" }
  case class BroadcastLayoutMsg(header: BbbClientMsgHeader, body: BroadcastLayoutMsgBody) extends BbbCoreMsg
  case class BroadcastLayoutMsgBody(meetingId: String, requesterId: String, layout: String)

  // Out messages
  object GetCurrentLayoutEvtMsg { val NAME = "GetCurrentLayoutEvtMsg" }
  case class GetCurrentLayoutEvtMsg(header: BbbClientMsgHeader, body: GetCurrentLayoutEvtMsgBody) extends BbbCoreMsg
  case class GetCurrentLayoutEvtMsgBody(meetingId: String, recorded: Boolean, requesterId: String, layoutId: String,
                                        locked: Boolean, setByUserId: String)

  object BroadcastLayoutEvtMsg { val NAME = "BroadcastLayoutEvtMsg" }
  case class BroadcastLayoutEvtMsg(header: BbbClientMsgHeader, body: BroadcastLayoutEvtMsgBody) extends BbbCoreMsg
  case class BroadcastLayoutEvtMsgBody(meetingId: String, recorded: Boolean, requesterId: String,
                                       layoutId: String, locked: Boolean, setByUserId: String, applyTo: Vector[String])

  object LockLayoutEvtMsg { val NAME = "LockLayoutEvtMsg" }
  case class LockLayoutEvtMsg(header: BbbClientMsgHeader, body: LockLayoutEvtMsgBody) extends BbbCoreMsg
  case class LockLayoutEvtMsgBody(meetingId: String, recorded: Boolean, setById: String, locked: Boolean,
                                  applyTo: Vector[String])

