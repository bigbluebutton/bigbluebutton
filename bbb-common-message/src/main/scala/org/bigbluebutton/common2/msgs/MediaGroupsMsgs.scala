
package org.bigbluebutton.common2.msgs

case class MediaGroupParticipant(
    userId: String,
    sender: Boolean,
    receiver: Boolean,
    active: Boolean,
)

case class MediaGroupInfo(
    id:        String,
    createdBy: String,
    mediaType: String,
    locked:    Boolean,
    record:    Boolean,
    senders:   Vector[MediaGroupParticipant],
    receivers: Vector[MediaGroupParticipant]
)

case class MediaGroupEntry(
    groupId:   String,
    mediaType: String,
    sender:    Boolean,
    receiver:  Boolean,
    active:    Boolean
)

case class MediaGroupEntryError(
    groupId:   String,
    mediaType: String,
    reason:    String
)

object CreateMediaGroupReqMsg { val NAME = "CreateMediaGroupReqMsg" }
case class CreateMediaGroupReqMsg(header: BbbClientMsgHeader, body: CreateMediaGroupReqMsgBody) extends StandardMsg
case class CreateMediaGroupReqMsgBody(
    id:        String,
    mediaType: String, // One of: audio, camera, screenshare
    locked:    Boolean,
    record:    Boolean,
    senders:   Vector[MediaGroupParticipant],
    receivers: Vector[MediaGroupParticipant]
)

object MediaGroupCreatedEvtMsg { val NAME = "MediaGroupCreatedEvtMsg" }
case class MediaGroupCreatedEvtMsg(header: BbbClientMsgHeader, body: MediaGroupCreatedEvtMsgBody) extends BbbCoreMsg
case class MediaGroupCreatedEvtMsgBody(
    id:        String,
    createdBy: String,
    mediaType: String,
    locked:    Boolean,
    record:    Boolean,
    senders:   Vector[MediaGroupParticipant],
    receivers: Vector[MediaGroupParticipant]
)

object MediaGroupUpdatedEvtMsg { val NAME = "MediaGroupUpdatedEvtMsg" }
case class MediaGroupUpdatedEvtMsg(header: BbbClientMsgHeader, body: MediaGroupUpdatedEvtMsgBody) extends BbbCoreMsg
case class MediaGroupUpdatedEvtMsgBody(
    id:        String,
    createdBy: String,
    mediaType: String,
    locked:    Boolean,
    record:    Boolean,
    senders:   Vector[MediaGroupParticipant],
    receivers: Vector[MediaGroupParticipant]
)

object DestroyMediaGroupReqMsg { val NAME = "DestroyMediaGroupReqMsg" }
case class DestroyMediaGroupReqMsg(header: BbbClientMsgHeader, body: DestroyMediaGroupReqMsgBody) extends StandardMsg
case class DestroyMediaGroupReqMsgBody(
    id:        String,
    mediaType: String
)

object MediaGroupDestroyedEvtMsg { val NAME = "MediaGroupDestroyedEvtMsg" }
case class MediaGroupDestroyedEvtMsg(header: BbbClientMsgHeader, body: MediaGroupDestroyedEvtMsgBody) extends BbbCoreMsg
case class MediaGroupDestroyedEvtMsgBody(requesterId: String, id: String, mediaType: String)

object GetMediaGroupsReqMsg { val NAME = "GetMediaGroupsReqMsg" }
case class GetMediaGroupsReqMsg(header: BbbClientMsgHeader, body: GetMediaGroupsReqMsgBody) extends StandardMsg
case class GetMediaGroupsReqMsgBody()

object GetMediaGroupsRespMsg { val NAME = "GetMediaGroupsRespMsg" }
case class GetMediaGroupsRespMsg(header: BbbClientMsgHeader, body: GetMediaGroupsRespMsgBody) extends BbbCoreMsg
case class GetMediaGroupsRespMsgBody(mediaGroups: Vector[MediaGroupInfo])

object SetUserMediaGroupStateReqMsg { val NAME = "SetUserMediaGroupStateReqMsg" }
case class SetUserMediaGroupStateReqMsg(header: BbbClientMsgHeader, body: SetUserMediaGroupStateReqMsgBody) extends StandardMsg
case class SetUserMediaGroupStateReqMsgBody(
    userId:   String,
    entries:  Vector[MediaGroupEntry],
    // "all" = entries replace entire state (groups not listed are removed)
    // "byMediaType" = entries replace state per mediaType (only media types
    //      present in entries are affected; others are untouched)
    // "merge" = entries merge with existing state (groups not listed are
    //      untouched; sender=false + receiver=false = removal)
    scope:    String
)

object SetUserMediaGroupStateRespMsg { val NAME = "SetUserMediaGroupStateRespMsg" }
case class SetUserMediaGroupStateRespMsg(header: BbbClientMsgHeader, body: SetUserMediaGroupStateRespMsgBody) extends BbbCoreMsg
case class SetUserMediaGroupStateRespMsgBody(
    userId:       String,
    appliedState: Vector[MediaGroupEntry],
    errors:       Vector[MediaGroupEntryError]
)
