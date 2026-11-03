package org.bigbluebutton.core.models

import org.bigbluebutton.core.db.MeetingUsersPoliciesDAO

object GuestsWaiting {
  def findWithIntId(guests: GuestsWaiting, intId: String): Option[GuestWaiting] = {
    guests.toVector find (u => u.intId == intId)
  }

  def findAll(guests: GuestsWaiting): Vector[GuestWaiting] = guests.toVector

  def add(guests: GuestsWaiting, user: GuestWaiting): Option[GuestWaiting] = {
    guests.save(user)
    Some(user)
  }

  def remove(guests: GuestsWaiting, intId: String): Option[GuestWaiting] = {
    guests.remove(intId)
  }

  def getGuestPolicy(guest: GuestsWaiting): GuestPolicy = {
    guest.guestPolicy
  }

  def setGuestPolicy(meetingId: String, guests: GuestsWaiting, policy: GuestPolicy): Unit = {
    guests.setGuestPolicy(policy)
    MeetingUsersPoliciesDAO.update(meetingId, policy)
  }

  def setGuestLobbyMessage(guests: GuestsWaiting, message: String): Unit = {
    guests.setGuestLobbyMessage(message)
  }

  def setPrivateGuestLobbyMessage(guests: GuestsWaiting, guestId: String, message: String): Unit = {
    guests.setPrivateGuestLobbyMessage(guestId, message)
  }
}

class GuestsWaiting {
  private var guests: collection.immutable.HashMap[String, GuestWaiting] = new collection.immutable.HashMap[String, GuestWaiting]

  private var guestPolicy = GuestPolicy(GuestPolicyType.ALWAYS_ACCEPT, SystemUser.ID)

  private var guestLobbyMessage = ""

  private var guestsWithPrivateGuestLobbyMessages: collection.mutable.HashMap[String, String] = new collection.mutable.HashMap[String, String]

  private def toVector: Vector[GuestWaiting] = guests.values.toVector

  private def save(user: GuestWaiting): GuestWaiting = {
    guests += user.intId -> user
    user
  }

  private def remove(id: String): Option[GuestWaiting] = {
    for {
      user <- guests.get(id)
    } yield {
      guests -= id
      user
    }
  }

  def getGuestPolicy(): GuestPolicy = guestPolicy
  def setGuestPolicy(policy: GuestPolicy) = guestPolicy = policy

  def setGuestLobbyMessage(message: String) = {
    guestLobbyMessage = message
  }

  def setPrivateGuestLobbyMessage(intId: String, message: String): Unit = {
    guestsWithPrivateGuestLobbyMessages.put(intId, message);
  }
}

case class GuestWaiting(intId: String, name: String, role: String, guest: Boolean, avatar: String, webcamBackground: String, color: String, authenticated: Boolean, registeredOn: Long)
case class GuestPolicy(policy: String, setBy: String)

object GuestPolicyType {
  val ALWAYS_ACCEPT = "ALWAYS_ACCEPT"
  val ALWAYS_DENY = "ALWAYS_DENY"
  val ASK_MODERATOR = "ASK_MODERATOR"

  val policyTypes = Set(ALWAYS_ACCEPT, ALWAYS_DENY, ASK_MODERATOR)
}

object GuestStatus {
  val ALLOW = "ALLOW"
  val DENY = "DENY"
  val WAIT = "WAIT"
}
