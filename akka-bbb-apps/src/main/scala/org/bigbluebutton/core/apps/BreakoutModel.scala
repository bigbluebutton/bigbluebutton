package org.bigbluebutton.core.apps

import org.bigbluebutton.core.domain.{ BreakoutRoom2x, BreakoutUser }

object BreakoutModel {
  def create(
      parentId:      String,
      id:            String,
      externalId:    String,
      name:          String,
      sequence:      Integer,
      shortName:     String,
      isDefaultName: Boolean,
      freeJoin:      Boolean,
      voiceConf:     String,
      assignedUsers: Vector[String],
      captureNotes:  Boolean,
      captureSlides: Boolean,
      captureNotesFilename: String,
      captureSlidesFilename: String,
      allPages: Boolean,
      presId: String,
      sourcePresentationFilename: String,
  ): BreakoutRoom2x = {
    new BreakoutRoom2x(id, externalId, name, parentId, sequence, shortName, isDefaultName, freeJoin, voiceConf, assignedUsers, Vector(), Vector(), None, false,
      captureNotes, captureSlides, captureNotesFilename, captureSlidesFilename, allPages, presId, sourcePresentationFilename)
  }

}

case class BreakoutModel(
    startedOn:         Option[Long],
    durationInSeconds: Int,
    rooms:             Map[String, BreakoutRoom2x],
    sendInviteToModerators: Boolean,
) {

  def find(id: String): Option[BreakoutRoom2x] = {
    rooms.get(id)
  }

  def findWithExternalId(externalId: String): Option[BreakoutRoom2x] = {
    rooms.values find (r => r.externalId == externalId)
  }

  def getRooms(): Vector[BreakoutRoom2x] = {
    rooms.values.toVector
  }

  def getNumberOfRooms(): Int = {
    rooms.size
  }

  def started(room: BreakoutRoom2x, startedOnInMillis: Long): BreakoutRoom2x = {
    room.copy(started = true, startedOn = Some(startedOnInMillis))
  }

  def hasAllStarted(): Boolean = {
    rooms.values.filter(r => r.started).size == rooms.values.size
  }

  def update(room: BreakoutRoom2x): BreakoutModel = {
    copy(rooms = rooms + (room.id -> room))
  }

  def getAssignedUsers(breakoutMeetingId: String): Option[Vector[String]] = {
    for {
      room <- rooms.get(breakoutMeetingId)
    } yield room.assignedUsers
  }

  def updateBreakoutUsers(breakoutMeetingId: String, users: Vector[BreakoutUser]): BreakoutModel = {
    val model = for {
      room <- rooms.get(breakoutMeetingId)
    } yield {
      val newRoom = room.copy(users = users)
      copy(rooms = rooms + (newRoom.id -> newRoom))
    }

    model match {
      case Some(m) => m
      case None    => copy()
    }
  }

  def removeRoom(id: String): BreakoutModel = {
    copy(rooms = rooms - id)
  }

  def setTime(newDurationInSeconds: Int): BreakoutModel = {
    copy(durationInSeconds = newDurationInSeconds)
  }

}
