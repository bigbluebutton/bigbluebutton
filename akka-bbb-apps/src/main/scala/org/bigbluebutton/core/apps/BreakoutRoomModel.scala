package org.bigbluebutton.core.apps

import scala.Vector

case class BreakoutUser(id: String, name: String)
case class BreakoutRoom(id: String, externalMeetingId: String, name: String, parentRoomId: String, sequence: Integer, voiceConfId: String,
  assignedUsers: Vector[String], users: Vector[BreakoutUser])

class BreakoutRoomModel {
  private var rooms = new collection.immutable.HashMap[String, BreakoutRoom]

  var pendingRoomsNumber: Integer = 0

  def add(room: BreakoutRoom): BreakoutRoom = {
    rooms += room.id -> room
    room
  }

  def remove(id: String) {
    rooms -= id
  }

  def createBreakoutRoom(parentRoomId: String, id: String, externalMeetingId: String, name: String, sequence: Integer, voiceConfId: String,
    assignedUsers: Vector[String]): BreakoutRoom = {
    val room = new BreakoutRoom(id, externalMeetingId, name, parentRoomId, sequence, voiceConfId, assignedUsers, Vector())
    add(room)
  }

  def getBreakoutRoom(id: String): Option[BreakoutRoom] = {
    rooms.get(id)
  }

  def getRoomWithExternalId(externalId: String): Option[BreakoutRoom] = {
    rooms.values find (r => r.externalMeetingId == externalId)
  }

  def getRooms(): Array[BreakoutRoom] = {
    rooms.values.toArray
  }

  def getNumberOfRooms(): Int = {
    rooms.size
  }

  def getAssignedUsers(breakoutMeetingId: String): Option[Vector[String]] = {
    for {
      room <- rooms.get(breakoutMeetingId)
    } yield room.assignedUsers
  }

  def updateBreakoutUsers(breakoutMeetingId: String, users: Vector[BreakoutUser]): Option[BreakoutRoom] = {
    for {
      room <- rooms.get(breakoutMeetingId)
      newroom = room.copy(users = users)
      room2 = add(newroom)
    } yield room2
  }
}
