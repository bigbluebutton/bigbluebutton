package org.bigbluebutton.core.models
import org.bigbluebutton.common2.msgs.{ AudioGroupParticipant, AudioGroupParticipantType }
import org.bigbluebutton.core.util.RandomStringGenerator

case class AudioGroups(audioGroups: collection.immutable.Map[String, AudioGroup]) {
  def find(id: String): Option[AudioGroup] = audioGroups.get(id)
  def add(audioGroup: AudioGroup): AudioGroups = copy(
    audioGroups = audioGroups + (audioGroup.id -> audioGroup)
  )
  def remove(id: String): AudioGroups = copy(audioGroups = audioGroups - id)
  def update(audioGroup: AudioGroup): AudioGroups = copy(
    audioGroups = audioGroups + (audioGroup.id -> audioGroup)
  )
  def findAllAudioGroups(): Vector[AudioGroup] = audioGroups.values.toVector
  def findAllAudioGroupsForUser(id: String): Vector[AudioGroup] = audioGroups.values.toVector filter (
    c => c.isUserReceiving(id) || c.isUserSending(id) || c.isUserTransceiving(id)
  )
}

case class AudioGroup(
    id:        String,
    createdBy: String,
    senders:   Set[AudioGroupParticipant],
    receivers: Set[AudioGroupParticipant]
) {
  def addSender(sender: AudioGroupParticipant): AudioGroup = copy(senders = senders + sender)
  def addSenders(newSenders: Vector[AudioGroupParticipant]): AudioGroup = copy(senders = senders ++ newSenders)
  def findAllSenders(): Vector[AudioGroupParticipant] = senders.toVector
  def removeSender(userId: String): AudioGroup = copy(senders = senders.filterNot(_.id == userId))
  def removeSenders(userIds: Vector[String]): AudioGroup = copy(senders = senders.filterNot(s => userIds.contains(s.id)))
  def addReceiver(receiver: AudioGroupParticipant): AudioGroup = copy(receivers = receivers + receiver)
  def addReceivers(newReceivers: Vector[AudioGroupParticipant]): AudioGroup = copy(receivers = receivers ++ newReceivers)
  def findAllReceivers(): Vector[AudioGroupParticipant] = receivers.toVector
  def removeReceiver(userId: String): AudioGroup = copy(receivers = receivers.filterNot(_.id == userId))
  def removeReceivers(userIds: Vector[String]): AudioGroup = copy(receivers = receivers.filterNot(r => userIds.contains(r.id)))
  def updateParticipant(participant: AudioGroupParticipant): AudioGroup = {
    val newSenders = senders.filterNot(_.id == participant.id) + participant
    val newReceivers = receivers.filterNot(_.id == participant.id) + participant
    copy(senders = newSenders, receivers = newReceivers)
  }
  def removeParticipant(userId: String): AudioGroup = {
    val newSenders = senders.filterNot(_.id == userId)
    val newReceivers = receivers.filterNot(_.id == userId)
    copy(senders = newSenders, receivers = newReceivers)
  }
  def findParticipant(userId: String): Option[AudioGroupParticipant] = {
    senders.toVector.find(_.id == userId).orElse(receivers.toVector.find(_.id == userId))
  }
  def findAllParticipants(): Vector[AudioGroupParticipant] = senders.toVector ++ receivers.toVector
  def isUserReceiving(userId: String): Boolean = receivers.exists(_.id == userId)
  def isUserSending(userId: String): Boolean = senders.exists(_.id == userId)
  def isUserTransceiving(userId: String): Boolean = isUserReceiving(userId) && isUserSending(userId)
}
