package org.bigbluebutton.core.models
import org.bigbluebutton.common2.msgs.{ MediaGroupParticipant }
import org.bigbluebutton.core.util.RandomStringGenerator

case class MediaGroups(mediaGroups: collection.immutable.Map[String, MediaGroup]) {
  def find(id: String): Option[MediaGroup] = mediaGroups.get(id)
  def add(mediaGroup: MediaGroup): MediaGroups = copy(
    mediaGroups = mediaGroups + (mediaGroup.id -> mediaGroup)
  )
  def remove(id: String): MediaGroups = copy(mediaGroups = mediaGroups - id)
  def update(mediaGroup: MediaGroup): MediaGroups = copy(
    mediaGroups = mediaGroups + (mediaGroup.id -> mediaGroup)
  )
  def findAllMediaGroups(): Vector[MediaGroup] = mediaGroups.values.toVector
  def findAllMediaGroupsForUser(id: String): Vector[MediaGroup] = mediaGroups.values.toVector filter (
    c => c.isUserReceiving(id) || c.isUserSending(id) || c.isUserTransceiving(id)
  )
}

case class MediaGroup(
    id:        String,
    createdBy: String,
    mediaType: String, // One of: audio, camera, screenshare
    locked:    Boolean,
    record:    Boolean,
    senders:   Set[MediaGroupParticipant],
    receivers: Set[MediaGroupParticipant]
) {
  def addSender(sender: MediaGroupParticipant): MediaGroup = copy(senders = senders.filterNot(_.userId == sender.userId) + sender)
  def addSenders(newSenders: Vector[MediaGroupParticipant]): MediaGroup = newSenders.foldLeft(this)((mg, s) => mg.addSender(s))
  def findAllSenders(): Vector[MediaGroupParticipant] = senders.toVector
  def removeSender(userId: String): MediaGroup = copy(senders = senders.filterNot(_.userId == userId))
  def removeSenders(userIds: Vector[String]): MediaGroup = copy(senders = senders.filterNot(s => userIds.contains(s.userId)))
  def addReceiver(receiver: MediaGroupParticipant): MediaGroup = copy(receivers = receivers.filterNot(_.userId == receiver.userId) + receiver)
  def addReceivers(newReceivers: Vector[MediaGroupParticipant]): MediaGroup = newReceivers.foldLeft(this)((mg, r) => mg.addReceiver(r))
  def findAllReceivers(): Vector[MediaGroupParticipant] = receivers.toVector
  def removeReceiver(userId: String): MediaGroup = copy(receivers = receivers.filterNot(_.userId == userId))
  def removeReceivers(userIds: Vector[String]): MediaGroup = copy(receivers = receivers.filterNot(r => userIds.contains(r.userId)))
  def updateParticipant(participant: MediaGroupParticipant): MediaGroup = {
    val newSenders = if (participant.sender) {
      senders.filterNot(_.userId == participant.userId) + participant
    } else {
      senders.filterNot(_.userId == participant.userId)
    }
    val newReceivers = if (participant.receiver) {
      receivers.filterNot(_.userId == participant.userId) + participant
    } else {
      receivers.filterNot(_.userId == participant.userId)
    }
    copy(senders = newSenders, receivers = newReceivers)
  }
  def removeParticipant(userId: String): MediaGroup = {
    val newSenders = senders.filterNot(_.userId == userId)
    val newReceivers = receivers.filterNot(_.userId == userId)
    copy(senders = newSenders, receivers = newReceivers)
  }
  def findParticipant(userId: String): Option[MediaGroupParticipant] = {
    senders.toVector.find(_.userId == userId).orElse(receivers.toVector.find(_.userId == userId))
  }
  def findAllParticipants(): Vector[MediaGroupParticipant] = (senders union receivers).toVector
  def isUserReceiving(userId: String): Boolean = receivers.exists(_.userId == userId)
  def isUserSending(userId: String): Boolean = senders.exists(_.userId == userId)
  def isUserTransceiving(userId: String): Boolean = isUserReceiving(userId) && isUserSending(userId)
}
