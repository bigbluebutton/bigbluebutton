package org.bigbluebutton.core.models

class EventNumber {
  var eventNumber = 0

  def increment(): Int = {
    eventNumber = eventNumber + 1
    eventNumber
  }
}

case class Event(num: Int)

class EventStore {
  private var events: scala.collection.immutable.Vector[Event] = Vector.empty

  def add(event: Event): Unit = {
    events = events :+ event
  }

  def getAll: Vector[Event] = {
    events
  }

  def get(from: Int, until: Int): Vector[Event] = {
    events.slice(from, until)
  }
}
