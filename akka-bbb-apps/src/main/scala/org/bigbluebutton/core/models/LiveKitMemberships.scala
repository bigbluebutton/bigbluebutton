package org.bigbluebutton.core.models

import org.bigbluebutton.common2.msgs.{ LiveKitGrant, LiveKitParticipantMetadata, LiveKitRoomRef }
import org.bigbluebutton.core.db.UserLivekitRoomDAO

// Grants and metadata are kept in-memory only to issue token refreshes. Not used
// by the client.
case class LiveKitMembership(
    userId:   String,
    roomName: String,
    purpose:  String,
    grant:    LiveKitGrant,
    metadata: LiveKitParticipantMetadata,
    token:    Option[String],
    // Identifies the mint request that created this membership, so a stale
    // mint-timeout cannot clear a newer membership for the same (user, room).
    mintNonce: Long = 0L
) {
  def roomRef: LiveKitRoomRef = LiveKitRoomRef(roomName, purpose)
}

object LiveKitMemberships {
  def add(memberships: LiveKitMemberships, m: LiveKitMembership): Vector[LiveKitMembership] = {
    memberships.save(m)
  }

  def removeByRoom(memberships: LiveKitMemberships, userId: String, roomName: String): Option[LiveKitMembership] = {
    memberships.delete(userId, roomName)
  }

  def removeByUser(memberships: LiveKitMemberships, userId: String): Vector[LiveKitMembership] = {
    memberships.deleteByUser(userId)
  }

  def removeByRoomAll(memberships: LiveKitMemberships, roomName: String): Vector[LiveKitMembership] = {
    memberships.deleteByRoom(roomName)
  }

  def findByUserAndRoom(memberships: LiveKitMemberships, userId: String, roomName: String): Option[LiveKitMembership] =
    memberships.find(userId, roomName)

  def findByUser(memberships: LiveKitMemberships, userId: String): Vector[LiveKitMembership] =
    memberships.findByUser(userId)

  def findByUserAndPurpose(memberships: LiveKitMemberships, userId: String, purpose: String): Vector[LiveKitMembership] =
    memberships.findByUser(userId).filter(_.purpose == purpose)

  def findByRoom(memberships: LiveKitMemberships, roomName: String): Vector[LiveKitMembership] =
    memberships.findByRoom(roomName)

  def setToken(
      memberships: LiveKitMemberships,
      userId:      String,
      roomName:    String,
      token:       String
  ): Option[LiveKitMembership] =
    memberships.setToken(userId, roomName, token)
}

class LiveKitMemberships(meetingId: String) {
  // Indexed by (userId, roomName), where roomName is LiveKit's room.name prop.
  // We assign roomName as the meetingId of the BBB meeting that the LK room is associated with.
  private var memberships = collection.immutable.HashMap.empty[(String, String), LiveKitMembership]

  private[models] def save(m: LiveKitMembership): Vector[LiveKitMembership] = {
    memberships = memberships + ((m.userId, m.roomName) -> m)
    UserLivekitRoomDAO.upsert(UserLivekitRoomDAO.toUserLivekitRoomDbModel(meetingId, m))
    memberships.values.toVector
  }

  private[models] def delete(userId: String, roomName: String): Option[LiveKitMembership] = {
    val v = memberships.get((userId, roomName))
    memberships = memberships - ((userId, roomName))
    if (v.isDefined) UserLivekitRoomDAO.delete(meetingId, userId, roomName)
    v
  }

  private[models] def deleteByUser(userId: String): Vector[LiveKitMembership] = {
    val removed = memberships.values.filter(_.userId == userId).toVector
    memberships = memberships.filterNot { case ((u, _), _) => u == userId }
    if (removed.nonEmpty) UserLivekitRoomDAO.deleteByUser(meetingId, userId)
    removed
  }

  private[models] def deleteByRoom(roomName: String): Vector[LiveKitMembership] = {
    val removed = memberships.values.filter(_.roomName == roomName).toVector
    memberships = memberships.filterNot { case ((_, r), _) => r == roomName }
    if (removed.nonEmpty) UserLivekitRoomDAO.deleteByRoom(meetingId, roomName)
    removed
  }

  private[models] def setToken(userId: String, roomName: String, token: String): Option[LiveKitMembership] = {
    memberships.get((userId, roomName)).map { m =>
      val updated = m.copy(token = Some(token))
      memberships = memberships + ((userId, roomName) -> updated)
      UserLivekitRoomDAO.setToken(meetingId, userId, roomName, token)
      updated
    }
  }

  private[models] def find(userId: String, roomName: String): Option[LiveKitMembership] =
    memberships.get((userId, roomName))

  private[models] def findByUser(userId: String): Vector[LiveKitMembership] =
    memberships.values.filter(_.userId == userId).toVector

  private[models] def findByRoom(roomName: String): Vector[LiveKitMembership] =
    memberships.values.filter(_.roomName == roomName).toVector
}
