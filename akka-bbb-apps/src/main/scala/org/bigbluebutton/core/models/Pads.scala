package org.bigbluebutton.core.models

import scala.collection.immutable.HashMap

object Pads {
  def hasGroup(pads: Pads, externalId: String): Boolean = pads.groups.contains(externalId)

  def addGroup(pads: Pads, externalId: String, model: String, name: String, userId: String): Unit = pads.addGroup(externalId, model, name, userId)

  def getGroup(pads: Pads, externalId: String): Option[PadGroup] = pads.groups.get(externalId)

  def setGroupId(pads: Pads, externalId: String, groupId: String): Unit = pads.setGroupId(externalId, groupId)

  def getGroupById(pads: Pads, groupId: String): Option[PadGroup] = pads.getGroupById(groupId)
}

class Pads {
  var groups: HashMap[String, PadGroup] = new HashMap[String, PadGroup]

  def addGroup(externalId: String, model: String, name: String, userId: String): Unit = groups += externalId -> new PadGroup(externalId, model, name, userId)

  def setGroupId(externalId: String, groupId: String): Unit = {
    groups.get(externalId) match {
      case Some(group) => groups += externalId -> new PadGroup(externalId, group.model, group.name, group.userId, groupId)
      case _           =>
    }
  }

  def getGroupById(groupId: String): Option[PadGroup] = groups.values.find(_.groupId == groupId)
}

class PadGroup(val externalId: String, val model: String, val name: String, val userId: String, val groupId: String = "")
