package org.bigbluebutton.common2.msgs

/* Sent to livekit-controller to generate a new LiveKit token
 */

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

sealed trait TrackSource { def no: Int }
case object UnknownTrackSource extends TrackSource { val no = 0 }
case object CameraTrackSource extends TrackSource { val no = 1 }
case object MicrophoneTrackSource extends TrackSource { val no = 2 }
case object ScreenShareTrackSource extends TrackSource { val no = 3 }
case object ScreenShareAudioTrackSource extends TrackSource { val no = 4 }

object TrackSource {
    def fromInt(no: Int): TrackSource = no match {
        case 0 => UnknownTrackSource
        case 1 => CameraTrackSource
        case 2 => MicrophoneTrackSource
        case 3 => ScreenShareTrackSource
        case 4 => ScreenShareAudioTrackSource
    }
}

/*
 * A LiveKit token requires a grant with all of its paremeters fully specified.
 * The required parameters are:
 *
 *  agent?: boolean;
    canPublish?: boolean;
    canPublishData?: boolean;
    canPublishSources?: TrackSource[];
    canSubscribe?: boolean;
    canUpdateOwnMetadata?: boolean;
    hidden?: boolean;
    ingressAdmin?: boolean;
    recorder?: boolean;
    room?: string;
    roomAdmin?: boolean;
    roomCreate?: boolean;
    roomJoin?: boolean;
    roomList?: boolean;
    roomRecord?: boolean;
 */

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

object GenerateLiveKitTokenReqMsg { val NAME = "GenerateLiveKitTokenReqMsg" }
case class GenerateLiveKitTokenReqMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   GenerateLiveKitTokenReqMsgBody
) extends BbbCoreMsg
case class GenerateLiveKitTokenReqMsgBody(
    userId:       String,
    userName:     String,
    grant:        LiveKitGrant,
    metadata:     LiveKitParticipantMetadata,
)

object GenerateLiveKitTokenRespMsg { val NAME = "GenerateLiveKitTokenRespMsg" }
case class GenerateLiveKitTokenRespMsg(
    header: BbbClientMsgHeader,
    body:   GenerateLiveKitTokenRespMsgBody
) extends StandardMsg
case class GenerateLiveKitTokenRespMsgBody(
    token: String,
    grant: LiveKitGrant,
)

object LiveKitParticipantLeftEvtMsg { val NAME = "LiveKitParticipantLeftEvtMsg" }
case class LiveKitParticipantLeftEvtMsg(
    header: BbbClientMsgHeader,
    body:   LiveKitParticipantLeftEvtMsgBody
) extends StandardMsg
case class LiveKitParticipantLeftEvtMsgBody(
    userId: String,
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
