package org.bigbluebutton.common2.msgs

/**
 * Message from a moderator to set what the room is set up as (e.g. "class").
 * An empty roomMode means the room is not configured.
 */
object SetRoomModeCmdMsg { val NAME = "SetRoomModeCmdMsg" }
case class SetRoomModeCmdMsg(
    header: BbbClientMsgHeader,
    body:   SetRoomModeCmdMsgBody
) extends StandardMsg
case class SetRoomModeCmdMsgBody(roomMode: String, setBy: String)

/**
 * Message sent to all clients that the room mode has been changed.
 */
object RoomModeChangedEvtMsg { val NAME = "RoomModeChangedEvtMsg" }
case class RoomModeChangedEvtMsg(
    header: BbbClientMsgHeader,
    body:   RoomModeChangedEvtMsgBody
) extends BbbCoreMsg
case class RoomModeChangedEvtMsgBody(roomMode: String, setBy: String)
