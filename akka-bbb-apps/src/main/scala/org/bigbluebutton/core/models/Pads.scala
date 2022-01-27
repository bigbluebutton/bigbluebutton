package org.bigbluebutton.core.models

import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core2.{ MeetingStatus2x }
import scala.collection.immutable.HashMap

object Pads {
  def hasCaptionsAccess(liveMeeting: LiveMeeting, userId: String, captions: String): Boolean = {
    // Is user a moderator AND
    // Is user the captions' owner
    Users2x.findWithIntId(liveMeeting.users2x, userId) match {
      case Some(user) => user.role == "MODERATOR" && liveMeeting.captionModel.isUserCaptionOwner(userId, captions)
      case _          => false
    }
  }

  def hasNotesAccess(liveMeeting: LiveMeeting, userId: String): Boolean = {
    // Is user a moderator OR
    // Are notes unlocked OR
    // Is user unlocked
    Users2x.findWithIntId(liveMeeting.users2x, userId) match {
      case Some(user) => user.role == "MODERATOR" || !MeetingStatus2x.areNotesDisabled(liveMeeting.status) || !user.locked
      case _          => false
    }
  }

  def hasAccess(liveMeeting: LiveMeeting, externalId: String, userId: String): Boolean = {
    getGroup(liveMeeting.pads, externalId) match {
      case Some(group) => {
        group.model match {
          case "captions" => hasCaptionsAccess(liveMeeting, userId, group.name)
          case "notes"    => hasNotesAccess(liveMeeting, userId)
          case _          => false
        }
      }
      case _ => false
    }
  }

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
