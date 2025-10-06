package org.bigbluebutton.core.apps.audiogroups

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

object AudioGroupApp {
  val MAIN_AUDIO_GROUP = "MAIN-AUDIO-GROUP"

  def createAudioGroup(
      id:          String,
      createdBy:   String,
      senders:     Vector[AudioGroupParticipant],
      receivers:   Vector[AudioGroupParticipant],
      audioGroups: AudioGroups
  ): AudioGroup = {
    val newSenders = senders.toSet
    val newReceivers = receivers.toSet
    new AudioGroup(id, createdBy, newSenders, newReceivers)
  }

  def addAudioGroup(
      ag:          AudioGroup,
      audioGroups: AudioGroups
  ): AudioGroups = {
    audioGroups.add(ag)
  }

  def findAudioGroup(id: String, audioGroups: AudioGroups): Option[AudioGroup] = {
    audioGroups.find(id)
  }

  def deleteAudioGroup(id: String, audioGroups: AudioGroups): AudioGroups = {
    audioGroups.remove(id)
  }

  def addAudioGroupParticipants(
      id:          String,
      senders:     Vector[AudioGroupParticipant],
      receivers:   Vector[AudioGroupParticipant],
      audioGroups: AudioGroups
  ): AudioGroups = {
    audioGroups.find(id) match {
      case Some(ag) =>
        val updatedAg = ag.addSenders(senders).addReceivers(receivers)
        audioGroups.update(updatedAg)
      case None =>
        audioGroups
    }
  }

  def addAudioGroupParticipant(
      id:          String,
      participant: AudioGroupParticipant,
      audioGroups: AudioGroups
  ): AudioGroups = {
    audioGroups.find(id) match {
      case Some(ag) =>
        val updatedAg = participant.participantType match {
          case AudioGroupParticipantType.SEND_ONLY =>
            ag.addSender(participant)
          case AudioGroupParticipantType.RECV_ONLY =>
            ag.addReceiver(participant)
          case AudioGroupParticipantType.SEND_RECV =>
            ag.addSender(participant).addReceiver(participant)
          case _ =>
            ag
        }
        audioGroups.update(updatedAg)
      case None =>
        audioGroups
    }
  }

  def updateAudioGroupParticipant(
      id:          String,
      participant: AudioGroupParticipant,
      audioGroups: AudioGroups
  ): AudioGroups = {
    audioGroups.find(id) match {
      case Some(ag) =>
        val updatedAg = ag.updateParticipant(participant)
        audioGroups.update(updatedAg)
      case None =>
        audioGroups
    }
  }

  def removeAudioGroupParticipants(
      id:          String,
      senders:     Vector[String],
      receivers:   Vector[String],
      audioGroups: AudioGroups
  ): AudioGroups = {
    audioGroups.find(id) match {
      case Some(ag) =>
        val updatedAg = ag.removeSenders(senders).removeReceivers(receivers)
        audioGroups.update(updatedAg)
      case None =>
        audioGroups
    }
  }

  def removeAudioGroupParticipant(
      id:                String,
      participantUserId: String,
      audioGroups:       AudioGroups
  ): AudioGroups = {
    audioGroups.find(id) match {
      case Some(ag) =>
        val updatedAg = ag.removeParticipant(participantUserId)
        audioGroups.update(updatedAg)
      case None =>
        audioGroups
    }
  }

  def removeUserFromAllAudioGroups(
      userId:      String,
      audioGroups: AudioGroups
  ): AudioGroups = {
    audioGroups.findAllAudioGroups().foldLeft(audioGroups) { (groups, ag) =>
      val updatedAg = ag.removeSender(userId).removeReceiver(userId)
      groups.update(updatedAg)
    }
  }

  def isParticipantTypeValid(participantType: String): Boolean = {
    participantType match {
      case AudioGroupParticipantType.SEND_ONLY | AudioGroupParticipantType.RECV_ONLY | AudioGroupParticipantType.SEND_RECV =>
        true
      case _ =>
        false
    }
  }

  def handleAudioGroupUpdated(
      agId:        String,
      audioGroups: AudioGroups,
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter
  ): Unit = {
    def broadcastEvent(ag: AudioGroup): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId,
        ag.createdBy
      )
      val envelope = BbbCoreEnvelope(AudioGroupUpdatedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(AudioGroupUpdatedEvtMsg.NAME, liveMeeting.props.meetingProp.intId, ag.createdBy)
      val body = AudioGroupUpdatedEvtMsgBody(ag.id, ag.createdBy, ag.findAllSenders(), ag.findAllReceivers())
      val event = AudioGroupUpdatedEvtMsg(header, body)
      val respMsg = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(respMsg)
    }

    audioGroups.find(agId) match {
      case Some(ag) =>
        broadcastEvent(ag)
      case _ =>
    }
  }
}
