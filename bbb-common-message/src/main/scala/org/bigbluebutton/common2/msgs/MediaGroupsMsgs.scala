
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

object MediaGroupAddParticipantsReqMsg { val NAME = "MediaGroupAddParticipantsReqMsg" }
case class MediaGroupAddParticipantsReqMsg(header: BbbClientMsgHeader, body: MediaGroupAddParticipantsReqMsgBody) extends StandardMsg
case class MediaGroupAddParticipantsReqMsgBody(
    id:        String,
    mediaType: String,
    senders:   Vector[MediaGroupParticipant],
    receivers: Vector[MediaGroupParticipant]
)

object MediaGroupParticipantsAddedEvtMsg { val NAME = "MediaGroupParticipantsAddedEvtMsg" }
case class MediaGroupParticipantsAddedEvtMsg(header: BbbClientMsgHeader, body: MediaGroupParticipantsAddedEvtMsgBody) extends BbbCoreMsg
case class MediaGroupParticipantsAddedEvtMsgBody(
    id:          String,
    mediaType:   String,
    requesterId: String,
    senders:     Vector[MediaGroupParticipant],
    receivers:   Vector[MediaGroupParticipant]
)

object MediaGroupRemoveParticipantsReqMsg { val NAME = "MediaGroupRemoveParticipantsReqMsg" }
case class MediaGroupRemoveParticipantsReqMsg(header: BbbClientMsgHeader, body: MediaGroupRemoveParticipantsReqMsgBody) extends StandardMsg
case class MediaGroupRemoveParticipantsReqMsgBody(
    id:        String,
    mediaType: String,
    userIds:   Vector[String]
)

object MediaGroupParticipantsRemovedEvtMsg { val NAME = "MediaGroupParticipantsRemovedEvtMsg" }
case class MediaGroupParticipantsRemovedEvtMsg(header: BbbClientMsgHeader, body: MediaGroupParticipantsRemovedEvtMsgBody) extends BbbCoreMsg
case class MediaGroupParticipantsRemovedEvtMsgBody(
    id:          String,
    mediaType:   String,
    requesterId: String,
    userIds:     Vector[String]
)

object JoinMediaGroupReqMsg { val NAME = "JoinMediaGroupReqMsg" }
case class JoinMediaGroupReqMsg(header: BbbClientMsgHeader, body: JoinMediaGroupReqMsgBody) extends StandardMsg
case class JoinMediaGroupReqMsgBody(
    id:          String,
    mediaType:   String,
    participant: MediaGroupParticipant
)

object MediaGroupParticipantJoinedEvtMsg { val NAME = "MediaGroupParticipantJoinedEvtMsg" }
case class MediaGroupParticipantJoinedEvtMsg(header: BbbClientMsgHeader, body: MediaGroupParticipantJoinedEvtMsgBody) extends BbbCoreMsg
case class MediaGroupParticipantJoinedEvtMsgBody(
    id:          String,
    mediaType:   String,
    participant: MediaGroupParticipant
)

object LeaveMediaGroupReqMsg { val NAME = "LeaveMediaGroupReqMsg" }
case class LeaveMediaGroupReqMsg(header: BbbClientMsgHeader, body: LeaveMediaGroupReqMsgBody) extends StandardMsg
case class LeaveMediaGroupReqMsgBody(
    id:        String,
    mediaType: String,
    userId:    String
)

object MediaGroupParticipantLeftEvtMsg { val NAME = "MediaGroupParticipantLeftEvtMsg" }
case class MediaGroupParticipantLeftEvtMsg(header: BbbClientMsgHeader, body: MediaGroupParticipantLeftEvtMsgBody) extends BbbCoreMsg
case class MediaGroupParticipantLeftEvtMsgBody(
    id:          String,
    mediaType:   String,
    requesterId: String,
    userId:      String
)

object MediaGroupUpdateParticipantReqMsg { val NAME = "MediaGroupUpdateParticipantReqMsg" }
case class MediaGroupUpdateParticipantReqMsg(header: BbbClientMsgHeader, body: MediaGroupUpdateParticipantReqMsgBody) extends StandardMsg
case class MediaGroupUpdateParticipantReqMsgBody(
    id:          String,
    mediaType:   String,
    participant: MediaGroupParticipant
)

object MediaGroupParticipantUpdatedEvtMsg { val NAME = "MediaGroupParticipantUpdatedEvtMsg" }
case class MediaGroupParticipantUpdatedEvtMsg(header: BbbClientMsgHeader, body: MediaGroupParticipantUpdatedEvtMsgBody) extends BbbCoreMsg
case class MediaGroupParticipantUpdatedEvtMsgBody(
    id:          String,
    mediaType:   String,
    participant: MediaGroupParticipant
)
