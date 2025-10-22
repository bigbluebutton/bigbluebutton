package org.bigbluebutton.core.apps.mediagroups

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

object MediaGroupApp {
  def createMediaGroup(
      id:          String,
      createdBy:   String,
      mediaType:   String,
      locked:      Boolean,
      record:      Boolean,
      senders:     Vector[MediaGroupParticipant],
      receivers:   Vector[MediaGroupParticipant],
      mediaGroups: MediaGroups
  ): MediaGroup = {
    val newSenders = senders.toSet
    val newReceivers = receivers.toSet
    new MediaGroup(id, createdBy, mediaType, locked, record, newSenders, newReceivers)
  }

  def addMediaGroup(
      mg:          MediaGroup,
      mediaGroups: MediaGroups
  ): MediaGroups = {
    mediaGroups.add(mg)
  }

  def findMediaGroup(id: String, mediaGroups: MediaGroups): Option[MediaGroup] = {
    mediaGroups.find(id)
  }

  def deleteMediaGroup(id: String, mediaGroups: MediaGroups): MediaGroups = {
    mediaGroups.remove(id)
  }

  def addMediaGroupParticipants(
      id:          String,
      senders:     Vector[MediaGroupParticipant],
      receivers:   Vector[MediaGroupParticipant],
      mediaGroups: MediaGroups
  ): MediaGroups = {
    mediaGroups.find(id) match {
      case Some(mg) =>
        val updatedMg = mg.addSenders(senders).addReceivers(receivers)
        mediaGroups.update(updatedMg)
      case None =>
        mediaGroups
    }
  }

  def addMediaGroupParticipant(
      id:          String,
      participant: MediaGroupParticipant,
      mediaGroups: MediaGroups
  ): MediaGroups = {
    mediaGroups.find(id) match {
      case Some(mg) =>
        val updatedMg = {
          val withSender = if (participant.sender) mg.addSender(participant) else mg
          if (participant.receiver) withSender.addReceiver(participant) else withSender
        }
        mediaGroups.update(updatedMg)
      case None =>
        mediaGroups
    }
  }

  def updateMediaGroupParticipant(
      id:          String,
      participant: MediaGroupParticipant,
      mediaGroups: MediaGroups
  ): MediaGroups = {
    mediaGroups.find(id) match {
      case Some(mg) =>
        val updatedMg = mg.updateParticipant(participant)
        mediaGroups.update(updatedMg)
      case None =>
        mediaGroups
    }
  }

  def removeMediaGroupParticipants(
      id:          String,
      userIds:     Vector[String],
      mediaGroups: MediaGroups
  ): MediaGroups = {
    mediaGroups.find(id) match {
      case Some(mg) =>
        val updatedMg = mg.removeSenders(userIds).removeReceivers(userIds)
        mediaGroups.update(updatedMg)
      case None =>
        mediaGroups
    }
  }

  def removeMediaGroupParticipant(
      id:                String,
      participantUserId: String,
      mediaGroups:       MediaGroups
  ): MediaGroups = {
    mediaGroups.find(id) match {
      case Some(mg) =>
        val updatedMg = mg.removeParticipant(participantUserId)
        mediaGroups.update(updatedMg)
      case None =>
        mediaGroups
    }
  }

  def removeUserFromAllMediaGroups(
      userId:      String,
      mediaGroups: MediaGroups
  ): MediaGroups = {
    mediaGroups.findAllMediaGroups().foldLeft(mediaGroups) { (groups, mg) =>
      val updatedMg = mg.removeSender(userId).removeReceiver(userId)
      groups.update(updatedMg)
    }
  }

  def handleMediaGroupUpdated(
      mgId:        String,
      mediaGroups: MediaGroups,
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter
  ): Unit = {
    def broadcastEvent(mg: MediaGroup): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId,
        mg.createdBy
      )
      val envelope = BbbCoreEnvelope(MediaGroupUpdatedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(MediaGroupUpdatedEvtMsg.NAME, liveMeeting.props.meetingProp.intId, mg.createdBy)
      val body = MediaGroupUpdatedEvtMsgBody(mg.id, mg.createdBy, mg.mediaType, mg.locked, mg.record, mg.findAllSenders(), mg.findAllReceivers())
      val event = MediaGroupUpdatedEvtMsg(header, body)
      val respMsg = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(respMsg)
    }

    mediaGroups.find(mgId) match {
      case Some(mg) =>
        broadcastEvent(mg)
      case _ =>
    }
  }
}
