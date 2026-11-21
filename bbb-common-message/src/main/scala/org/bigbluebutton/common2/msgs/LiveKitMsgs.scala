package org.bigbluebutton.common2.msgs

import com.fasterxml.jackson.annotation.{ JsonCreator, JsonValue }

/* A LiveKitTrackSource is a Scala enum ported from LiveKit's protobuf
 * definition.
 * proto3.util.setEnumType(TrackSource, "livekit.TrackSource", [
 *  { no: 0, name: "UNKNOWN" },
 *  { no: 1, name: "CAMERA" },
 *  { no: 2, name: "MICROPHONE" },
 *  { no: 3, name: "SCREEN_SHARE" },
 *  { no: 4, name: "SCREEN_SHARE_AUDIO" },
 * ]);
 */

sealed trait TrackSource { @JsonValue def no: Int }
case object UnknownTrackSource extends TrackSource { val no = 0 }
case object CameraTrackSource extends TrackSource { val no = 1 }
case object MicrophoneTrackSource extends TrackSource { val no = 2 }
case object ScreenShareTrackSource extends TrackSource { val no = 3 }
case object ScreenShareAudioTrackSource extends TrackSource { val no = 4 }

object TrackSource {
    @JsonCreator
    def fromInt(no: Int): TrackSource = no match {
        case 0 => UnknownTrackSource
        case 1 => CameraTrackSource
        case 2 => MicrophoneTrackSource
        case 3 => ScreenShareTrackSource
        case 4 => ScreenShareAudioTrackSource
    }
}

case class LiveKitGrant(
    agent:                Boolean,
    canPublish:           Boolean,
    canPublishData:       Boolean,
    canPublishSources:    List[TrackSource],
    canSubscribe:         Boolean,
    canUpdateOwnMetadata: Boolean,
    hidden:               Boolean,
    ingressAdmin:         Boolean,
    recorder:             Boolean,
    room:                 String,
    roomAdmin:            Boolean,
    roomCreate:           Boolean,
    roomJoin:             Boolean,
    roomList:             Boolean,
    roomRecord:           Boolean,
)

case class LiveKitParticipantMetadata(
    meetingId: String,
    voiceConf: String,
)

/*
 * Identifies the membership slot a token req/resp refers to, letting one
 * user session hold several LK rooms (e.g. breakout listen-in).
 * `roomName` matches `LiveKitGrant.room` (the owning meeting's internal id);
 * `purpose` is a free-form use-case tag: 'primary', 'breakout-listen', ...
 */
case class LiveKitRoomRef(
    roomName: String,
    purpose:  String,
)

object GenerateLiveKitTokenReqMsg { val NAME = "GenerateLiveKitTokenReqMsg" }
case class GenerateLiveKitTokenReqMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   GenerateLiveKitTokenReqMsgBody
) extends BbbCoreMsg
case class GenerateLiveKitTokenReqMsgBody(
    userId:   String,
    userName: String,
    roomRef:  LiveKitRoomRef,
    grant:    LiveKitGrant,
    metadata: LiveKitParticipantMetadata,
)

object GenerateLiveKitTokenRespMsg { val NAME = "GenerateLiveKitTokenRespMsg" }
case class GenerateLiveKitTokenRespMsg(
    header: BbbClientMsgHeader,
    body:   GenerateLiveKitTokenRespMsgBody
) extends StandardMsg
case class GenerateLiveKitTokenRespMsgBody(
    roomRef: LiveKitRoomRef,
    token:   String,
    grant:   LiveKitGrant,
    // Token TTL as configured on the controller side (bbb-webrtc-sfu),
    ttlSec:  Int,
)

object LiveKitParticipantLeftEvtMsg { val NAME = "LiveKitParticipantLeftEvtMsg" }
case class LiveKitParticipantLeftEvtMsg(
    header: BbbClientMsgHeader,
    body:   LiveKitParticipantLeftEvtMsgBody
) extends StandardMsg
case class LiveKitParticipantLeftEvtMsgBody(
    userId:   String,
    roomName: String,
)

object RemoveLiveKitParticipantSysMsg { val NAME = "RemoveLiveKitParticipantSysMsg" }
case class RemoveLiveKitParticipantSysMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   RemoveLiveKitParticipantSysMsgBody
) extends BbbCoreMsg
case class RemoveLiveKitParticipantSysMsgBody(
    roomName: String,
    userId:   String,
)

/**
 * Re-applies a participant's LiveKit permissions on their live session, keyed by
 * BBB intId (the LiveKit identity for web users). LiveKit writes the change into
 * the participant's claim grants and refreshes the client's token, so it survives
 * an ordinary SDK reconnect. Idempotent.
 */
object UpdateLiveKitParticipantPermissionsSysMsg { val NAME = "UpdateLiveKitParticipantPermissionsSysMsg" }
case class UpdateLiveKitParticipantPermissionsSysMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   UpdateLiveKitParticipantPermissionsSysMsgBody
) extends BbbCoreMsg
case class UpdateLiveKitParticipantPermissionsSysMsgBody(
    userId: String,
    grant:  LiveKitGrant,
)

/**
 * Outcome of a media-stack action that akka-apps requested to bbb-webrtc-sfu
 */
object MediaActionOutcome {
  val APPLIED = "applied"
  val ROOM_ABSENT = "roomAbsent"
  val PARTICIPANT_ABSENT = "participantAbsent"
  val FAILED = "failed"
}

/**
 * Acknowledges an UpdateLiveKitParticipantPermissionsSysMsg
 */
object UpdateLiveKitParticipantPermissionsRespMsg { val NAME = "UpdateLiveKitParticipantPermissionsRespMsg" }
case class UpdateLiveKitParticipantPermissionsRespMsg(
    header: BbbClientMsgHeader,
    body:   UpdateLiveKitParticipantPermissionsRespMsgBody
) extends StandardMsg
case class UpdateLiveKitParticipantPermissionsRespMsgBody(
    grant:   LiveKitGrant,
    outcome: String,
)

/**
 * Acknowledges an EjectUserFromVoiceConfSysMsg. Only the LiveKit bridge sends it;
 * the FreeSWITCH path reports a leave event instead (as always).
 */
object EjectUserFromVoiceConfRespMsg { val NAME = "EjectUserFromVoiceConfRespMsg" }
case class EjectUserFromVoiceConfRespMsg(
    header: BbbClientMsgHeader,
    body:   EjectUserFromVoiceConfRespMsgBody
) extends StandardMsg
case class EjectUserFromVoiceConfRespMsgBody(
    voiceConf:   String,
    voiceUserId: String,
    outcome:     String,
)
