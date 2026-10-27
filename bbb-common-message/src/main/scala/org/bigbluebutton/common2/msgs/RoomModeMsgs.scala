package org.bigbluebutton.common2.msgs

import org.bigbluebutton.common2.domain.{ DefaultProps, LockSettingsProps }

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

/**
 * The settings a room mode controls, shaped like the room's base (the values it was
 * created with, meeting.roomBaseSettings), so the two can be compared field by field.
 */
case class RoomModeSettings(
    lockSettings:  LockSettingsProps,
    usersPolicies: RoomModeUsersPolicies,
    voiceSettings: RoomModeVoiceSettings
)
case class RoomModeUsersPolicies(webcamsOnlyForModerator: Boolean, guestPolicy: String, multiUserWhiteboardEnabled: Boolean)
case class RoomModeVoiceSettings(muteOnStart: Boolean)

object RoomModeSettings {
  def fromProps(props: DefaultProps): RoomModeSettings =
    RoomModeSettings(
      props.lockSettingsProps,
      RoomModeUsersPolicies(
        props.usersProp.webcamsOnlyForModerator,
        props.usersProp.guestPolicy,
        props.usersProp.multiUserWhiteboardEnabled
      ),
      RoomModeVoiceSettings(props.voiceProp.muteOnStart)
    )
}
