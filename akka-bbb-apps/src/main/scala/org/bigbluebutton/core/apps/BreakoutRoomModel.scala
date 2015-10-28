package org.bigbluebutton.core.apps

import scala.collection.mutable.ArrayBuffer
import scala.collection.immutable.HashMap

case class BreakoutUser(id: String, name: String)
case class BreakoutRoom(id: String, name: String, voiceConfId: String,
  assignedUsers: Vector[String], users: Vector[BreakoutUser], defaultPresentationURL: String)

class BreakoutRoomModel {
  private var rooms = new collection.immutable.HashMap[String, BreakoutRoom]

  def add(room: BreakoutRoom) = {
    rooms += room.id -> room
  }

  def remove(id: String) {
    rooms -= id
  }

  def createBreakoutRoom(id: String, name: String, voiceConfId: String,
    assignedUsers: Vector[String], defaultPresentationURL: String): BreakoutRoom = {
    val room = new BreakoutRoom(id, name, voiceConfId, assignedUsers, Vector(), defaultPresentationURL)
    add(room)
    room
  }

}

