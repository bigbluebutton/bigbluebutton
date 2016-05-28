package org.bigbluebutton.core.models

import akka.actor.ActorRef
import org.bigbluebutton.core.domain.{ IntUserId, UserActorRef }

class UserActorRefs {
  private var userActorRefs = new collection.immutable.HashMap[IntUserId, UserActorRef]

  def save(userActorRef: UserActorRef): Unit = {
    userActorRefs += userActorRef.id -> userActorRef
  }

  def remove(id: IntUserId): Option[UserActorRef] = {
    val ref = userActorRefs.get(id)
    ref foreach (r => userActorRefs -= id)
    ref
  }

  def findWithId(id: IntUserId): Option[UserActorRef] = userActorRefs.values.find(r => r.id == id)

  def toVector: Vector[UserActorRef] = userActorRefs.values.toVector
}
