package org.bigbluebutton.common2.msgs

object AudioGroupParticipantType {
  val SEND_ONLY = "SENDONLY"
  val RECV_ONLY = "RECVONLY"
  val SEND_RECV = "SENDRECV"
}

case class AudioGroupParticipant(id: String, participantType: String, active: Boolean)

case class AudioGroupInfo(
    id:        String,
    createdBy: String,
    senders:   Vector[AudioGroupParticipant],
    receivers: Vector[AudioGroupParticipant]
)

object CreateAudioGroupReqMsg { val NAME = "CreateAudioGroupReqMsg" }
case class CreateAudioGroupReqMsg(header: BbbClientMsgHeader, body: CreateAudioGroupReqMsgBody) extends StandardMsg
case class CreateAudioGroupReqMsgBody(
    id:        String,
    senders:   Vector[AudioGroupParticipant],
    receivers: Vector[AudioGroupParticipant]
)

object AudioGroupCreatedEvtMsg { val NAME = "AudioGroupCreatedEvtMsg" }
case class AudioGroupCreatedEvtMsg(header: BbbClientMsgHeader, body: AudioGroupCreatedEvtMsgBody) extends BbbCoreMsg
case class AudioGroupCreatedEvtMsgBody(
    id:        String,
    createdBy: String,
    senders:   Vector[AudioGroupParticipant],
    receivers: Vector[AudioGroupParticipant]
)

object DestroyAudioGroupReqMsg { val NAME = "DestroyAudioGroupReqMsg" }
case class DestroyAudioGroupReqMsg(header: BbbClientMsgHeader, body: DestroyAudioGroupReqMsgBody) extends StandardMsg
case class DestroyAudioGroupReqMsgBody(id: String)

object AudioGroupDestroyedEvtMsg { val NAME = "AudioGroupDestroyedEvtMsg" }
case class AudioGroupDestroyedEvtMsg(header: BbbClientMsgHeader, body: AudioGroupDestroyedEvtMsgBody) extends BbbCoreMsg
case class AudioGroupDestroyedEvtMsgBody(requesterId: String, id: String)

object GetAudioGroupsReqMsg { val NAME = "GetAudioGroupsReqMsg" }
case class GetAudioGroupsReqMsg(header: BbbClientMsgHeader, body: GetAudioGroupsReqMsgBody) extends StandardMsg
case class GetAudioGroupsReqMsgBody()

object GetAudioGroupsRespMsg { val NAME = "GetAudioGroupsRespMsg" }
case class GetAudioGroupsRespMsg(header: BbbClientMsgHeader, body: GetAudioGroupsRespMsgBody) extends BbbCoreMsg
case class GetAudioGroupsRespMsgBody(audioGroups: Vector[AudioGroupInfo])

object AudioGroupAddParticipantsReqMsg { val NAME = "AudioGroupAddParticipantsReqMsg" }
case class AudioGroupAddParticipantsReqMsg(header: BbbClientMsgHeader, body: AudioGroupAddParticipantsReqMsgBody) extends StandardMsg
case class AudioGroupAddParticipantsReqMsgBody(
    id:        String,
    senders:   Vector[AudioGroupParticipant],
    receivers: Vector[AudioGroupParticipant]
)

object AudioGroupParticipantsAddedEvtMsg { val NAME = "AudioGroupParticipantsAddedEvtMsg" }
case class AudioGroupParticipantsAddedEvtMsg(header: BbbClientMsgHeader, body: AudioGroupParticipantsAddedEvtMsgBody) extends BbbCoreMsg
case class AudioGroupParticipantsAddedEvtMsgBody(
    id:          String,
    requesterId: String,
    senders:     Vector[AudioGroupParticipant],
    receivers:   Vector[AudioGroupParticipant]
)

object AudioGroupRemoveParticipantsReqMsg { val NAME = "AudioGroupRemoveParticipantsReqMsg" }
case class AudioGroupRemoveParticipantsReqMsg(header: BbbClientMsgHeader, body: AudioGroupRemoveParticipantsReqMsgBody) extends StandardMsg
case class AudioGroupRemoveParticipantsReqMsgBody(
    id:        String,
    senders:   Vector[String],
    receivers: Vector[String]
)

object AudioGroupParticipantsRemovedEvtMsg { val NAME = "AudioGroupParticipantsRemovedEvtMsg" }
case class AudioGroupParticipantsRemovedEvtMsg(header: BbbClientMsgHeader, body: AudioGroupParticipantsRemovedEvtMsgBody) extends BbbCoreMsg
case class AudioGroupParticipantsRemovedEvtMsgBody(
    id:          String,
    requesterId: String,
    senders:     Vector[AudioGroupParticipant],
    receivers:   Vector[AudioGroupParticipant]
)

object JoinAudioGroupReqMsg { val NAME = "JoinAudioGroupReqMsg" }
case class JoinAudioGroupReqMsg(header: BbbClientMsgHeader, body: JoinAudioGroupReqMsgBody) extends StandardMsg
case class JoinAudioGroupReqMsgBody(
    id:          String,
    participant: AudioGroupParticipant
)

object AudioGroupParticipantJoinedEvtMsg { val NAME = "AudioGroupParticipantJoinedEvtMsg" }
case class AudioGroupParticipantJoinedEvtMsg(header: BbbClientMsgHeader, body: AudioGroupParticipantJoinedEvtMsgBody) extends BbbCoreMsg
case class AudioGroupParticipantJoinedEvtMsgBody(
    id:          String,
    participant: AudioGroupParticipant
)

object LeaveAudioGroupReqMsg { val NAME = "LeaveAudioGroupReqMsg" }
case class LeaveAudioGroupReqMsg(header: BbbClientMsgHeader, body: LeaveAudioGroupReqMsgBody) extends StandardMsg
case class LeaveAudioGroupReqMsgBody(
    id:     String,
    userId: String
)

object AudioGroupParticipantLeftEvtMsg { val NAME = "AudioGroupParticipantLeftEvtMsg" }
case class AudioGroupParticipantLeftEvtMsg(header: BbbClientMsgHeader, body: AudioGroupParticipantLeftEvtMsgBody) extends BbbCoreMsg
case class AudioGroupParticipantLeftEvtMsgBody(
    id:          String,
    requesterId: String,
    userId:      String
)

object AudioGroupUpdateParticipantReqMsg { val NAME = "AudioGroupUpdateParticipantReqMsg" }
case class AudioGroupUpdateParticipantReqMsg(header: BbbClientMsgHeader, body: AudioGroupUpdateParticipantReqMsgBody) extends StandardMsg
case class AudioGroupUpdateParticipantReqMsgBody(
    id:          String,
    participant: AudioGroupParticipant
)

object AudioGroupParticipantUpdatedEvtMsg { val NAME = "AudioGroupParticipantUpdatedEvtMsg" }
case class AudioGroupParticipantUpdatedEvtMsg(header: BbbClientMsgHeader, body: AudioGroupParticipantUpdatedEvtMsgBody) extends BbbCoreMsg
case class AudioGroupParticipantUpdatedEvtMsgBody(
    id:          String,
    participant: AudioGroupParticipant
)
