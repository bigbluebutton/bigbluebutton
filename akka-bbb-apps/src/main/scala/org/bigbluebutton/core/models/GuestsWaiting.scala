package org.bigbluebutton.core.models

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

  def setGuestPolicy(guests: GuestsWaiting, policy: GuestPolicy): Unit = {
    guests.setGuestPolicy(policy)
  }

}

class GuestsWaiting {
  private var guests: collection.immutable.HashMap[String, GuestWaiting] = new collection.immutable.HashMap[String, GuestWaiting]

  private var guestPolicy = GuestPolicy(GuestPolicyType.ASK_MODERATOR, "SYSTEM")

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
}

case class GuestWaiting(intId: String, name: String, role: String)
case class GuestPolicy(policy: String, setBy: String)

object GuestPolicyType {
  val ALWAYS_ACCEPT = "ALWAYS_ACCEPT"
  val ALWAYS_DENY = "ALWAYS_DENY"
  val ASK_MODERATOR = "ASK_MODERATOR"

  val policyTypes = Set(ALWAYS_ACCEPT, ALWAYS_ACCEPT, ASK_MODERATOR)
}